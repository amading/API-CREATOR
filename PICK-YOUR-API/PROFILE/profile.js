// ============================================================
// PROFILE API — View, Edit, Change Password, Upload Avatar
// BASE URL: /api/profile
// ============================================================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// Multer setup para sa avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/avatars/";
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB lang para sa avatar
  fileFilter: (req, file, cb) => {
    ["image/jpeg", "image/png", "image/gif"].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("JPEG, PNG, o GIF lang ang allowed para sa avatar."), false);
  },
});

// DUMMY DATABASE — PALITAN NG TUNAY NA DATABASE
const users = [
  { id: "1", name: "Juan Dela Cruz", email: "juan@example.com", password: "$2b$12$xxx", bio: "Hello!", avatar: null, role: "user" },
];

// -------------------------------------------------------
// GET /api/profile — Tingnan ang sariling profile
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const user = await User.findById(req.user.id).select("-password")
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return errorResponse(res, "Hindi mahanap ang user.", 404);

    const { password, ...profile } = user;
    return successResponse(res, "Nakuha ang profile.", profile);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng profile.");
  }
});

// -------------------------------------------------------
// PUT /api/profile — I-update ang profile info
// -------------------------------------------------------
router.put("/", verifyToken, (req, res) => {
  try {
    const { name, bio } = req.body;

    // PALITAN: const user = await User.findByIdAndUpdate(req.user.id, { name, bio }, { new: true })
    const index = users.findIndex((u) => u.id === req.user.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang user.", 404);

    if (name) users[index].name = name;
    if (bio !== undefined) users[index].bio = bio;

    const { password, ...profile } = users[index];
    return successResponse(res, "Na-update ang profile.", profile);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng profile.");
  }
});

// -------------------------------------------------------
// PUT /api/profile/password — Palitan ang password
// -------------------------------------------------------
router.put("/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return errorResponse(res, "Kailangan ang currentPassword at newPassword.", 400);

    if (newPassword.length < 8)
      return errorResponse(res, "Dapat 8 characters pataas ang bagong password.", 400);

    // PALITAN: const user = await User.findById(req.user.id)
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return errorResponse(res, "Hindi mahanap ang user.", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return errorResponse(res, "Mali ang kasalukuyang password.", 401);

    // PALITAN: await User.findByIdAndUpdate(req.user.id, { password: hashedPassword })
    user.password = await bcrypt.hash(newPassword, 12);

    return successResponse(res, "Matagumpay na nabago ang password.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbabago ng password.");
  }
});

// -------------------------------------------------------
// POST /api/profile/avatar — Mag-upload ng profile picture
// -------------------------------------------------------
router.post("/avatar", verifyToken, upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "Walang na-upload na avatar.", 400);

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    // PALITAN: await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl })
    const user = users.find((u) => u.id === req.user.id);
    if (user) user.avatar = avatarUrl;

    return successResponse(res, "Na-update ang avatar!", { avatar: avatarUrl });
  } catch (err) {
    return errorResponse(res, "May error sa pag-upload ng avatar.");
  }
});

module.exports = router;
