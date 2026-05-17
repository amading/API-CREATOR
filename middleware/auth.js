// ============================================================
// AUTH MIDDLEWARE — Sinusuri kung may valid JWT token ang user
// Ilagay sa mga routes na kailangan ng login
// ============================================================

const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { decryptPayload } = require("../utils/tokenUtils");
const { errorResponse } = require("../utils/response");

// -------------------------------------------------------
// VERIFY TOKEN — Gamitin sa mga protected routes
// Halimbawa: router.get("/profile", verifyToken, controller)
// -------------------------------------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    return errorResponse(res, "Walang token. Kailangan mag-login.", 401);
  }

  try {
    // Step 1: I-verify ang JWT signature (tamper check)
    const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });

    // Step 2: I-decrypt ang payload (AES-256-GCM)
    req.user = decryptPayload(decoded.data);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Expired na ang token. I-refresh ang session.", 401);
    }
    return errorResponse(res, "Hindi valid ang token.", 403);
  }
};

// -------------------------------------------------------
// VERIFY ADMIN — Para sa admin-only routes
// -------------------------------------------------------
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    // 👉 PALITAN NG IYONG ADMIN ROLE CHECK
    if (req.user.role !== "admin") {
      return errorResponse(res, "Admin lang ang may access dito.", 403);
    }
    next();
  });
};

// -------------------------------------------------------
// VERIFY API KEY — Para sa server-to-server na calls
// -------------------------------------------------------
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== config.API_KEY) {
    return errorResponse(res, "Hindi valid ang API Key.", 401);
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyApiKey };
