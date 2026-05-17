// ============================================================
// AUTH ROUTES — Register, Login, Logout, Refresh Token
// 👉 BASE URL: /api/auth
// ============================================================

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config/config");
const { authLimiter } = require("../middleware/rateLimiter");
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");
const { encryptPayload } = require("../utils/tokenUtils");

// -------------------------------------------------------
// DUMMY DATABASE — 👉 PALITAN NG TUNAY NA DATABASE (MongoDB, MySQL, etc.)
// -------------------------------------------------------
const users = [];

// -------------------------------------------------------
// REFRESH TOKEN STORE — 👉 SA PRODUCTION: gamitin ang Redis o DB table
// Map<refreshToken, { userId, role }>
// Kapag nag-logout o nag-refresh, tinatanggal ang lumang token (rotation)
// -------------------------------------------------------
const refreshTokenStore = new Map();

// -------------------------------------------------------
// HELPERS — Token generation
// -------------------------------------------------------

// Access token — short-lived (15m), encrypted ang payload (hindi mababasa kahit ma-decode)
function generateAccessToken(userId, role) {
  const encrypted = encryptPayload({ id: userId, role });
  return jwt.sign(
    { data: encrypted },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN, algorithm: "HS256" }
  );
}

// Refresh token — opaque random string, hindi JWT para hindi ma-decode
// I-store sa server (refreshTokenStore / DB), hindi sa client-readable payload
function generateRefreshToken(userId, role) {
  const token = crypto.randomBytes(64).toString("hex");
  refreshTokenStore.set(token, { userId, role });
  return token;
}

// -------------------------------------------------------
// POST /api/auth/register — Gumawa ng bagong account
// -------------------------------------------------------
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 👉 PALITAN NG IYONG VALIDATION LOGIC
    if (!name || !email || !password) {
      return errorResponse(res, "Kumpleto ang name, email, at password.", 400);
    }

    if (password.length < 8) {
      return errorResponse(res, "Dapat 8 characters pataas ang password.", 400);
    }

    // 👉 PALITAN NG DB CHECK (e.g., User.findOne({ email }))
    const exists = users.find((u) => u.email === email);
    if (exists) {
      return errorResponse(res, "Ginagamit na ang email na iyon.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 👉 PALITAN NG DB SAVE (e.g., await User.create({...}))
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    };
    users.push(newUser);

    const accessToken = generateAccessToken(newUser.id, newUser.role);
    const refreshToken = generateRefreshToken(newUser.id, newUser.role);

    return successResponse(
      res,
      "Matagumpay na nagrehistro!",
      {
        accessToken,
        refreshToken,
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      },
      201
    );
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return errorResponse(res, "May error sa pagre-rehistro.");
  }
});

// -------------------------------------------------------
// POST /api/auth/login — Mag-login
// -------------------------------------------------------
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Kailangan ang email at password.", 400);
    }

    // 👉 PALITAN NG DB QUERY (e.g., User.findOne({ email }))
    const user = users.find((u) => u.email === email);
    if (!user) {
      return errorResponse(res, "Mali ang email o password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Mali ang email o password.", 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    return successResponse(res, "Matagumpay na nag-login!", {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return errorResponse(res, "May error sa pag-login.");
  }
});

// -------------------------------------------------------
// POST /api/auth/refresh — Kumuha ng bagong access token
// Body: { refreshToken: "..." }
// Ginagamit ng client kapag 401 "Expired na ang token"
// -------------------------------------------------------
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, "Walang refresh token.", 401);
  }

  const stored = refreshTokenStore.get(refreshToken);
  if (!stored) {
    // Token hindi kilala — posibleng na-logout na o na-steal
    return errorResponse(res, "Hindi valid ang refresh token. Mag-login ulit.", 403);
  }

  // Rotation: tanggalin ang lumang refresh token, gumawa ng bago
  // Kung may nagnakaw ng token at ginamit nila, magiging invalid na ang sa tunay na user
  refreshTokenStore.delete(refreshToken);

  const newAccessToken = generateAccessToken(stored.userId, stored.role);
  const newRefreshToken = generateRefreshToken(stored.userId, stored.role);

  return successResponse(res, "Na-refresh ang session.", {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

// -------------------------------------------------------
// GET /api/auth/me — Kunin ang sariling profile (kailangan ng token)
// -------------------------------------------------------
router.get("/me", verifyToken, (req, res) => {
  // 👉 PALITAN NG DB QUERY PARA SA ACTUAL USER DATA
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return errorResponse(res, "Hindi mahanap ang user.", 404);

  const { password, ...userWithoutPassword } = user;
  return successResponse(res, "Nakuha ang profile.", userWithoutPassword);
});

// -------------------------------------------------------
// POST /api/auth/logout — Mag-logout (server-side token revocation)
// Body: { refreshToken: "..." }
// -------------------------------------------------------
router.post("/logout", verifyToken, (req, res) => {
  const { refreshToken } = req.body;

  // Burahin ang refresh token sa store — hindi na magagamit kahit hindi pa expire ang access token
  if (refreshToken) {
    refreshTokenStore.delete(refreshToken);
  }

  return successResponse(res, "Matagumpay na nag-logout!");
});

module.exports = router;
