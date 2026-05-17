// ============================================================
// USERS ROUTES — CRUD para sa Users
// 👉 BASE URL: /api/users
// 👉 PALITAN ANG "users" NG IYONG COLLECTION/TABLE NAME
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
let users = [
  { id: "1", name: "Juan Dela Cruz", email: "juan@example.com", role: "user" },
  { id: "2", name: "Maria Santos", email: "maria@example.com", role: "user" },
];

// -------------------------------------------------------
// GET /api/users — Kuhanin ang lahat ng users (Admin only)
// -------------------------------------------------------
router.get("/", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN: const users = await User.find().select("-password")
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const paginated = users.slice(start, start + limit);

    return paginatedResponse(res, "Nakuha ang lahat ng users.", paginated, {
      total: users.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng users.");
  }
});

// -------------------------------------------------------
// GET /api/users/:id — Kuhanin ang isang user
// -------------------------------------------------------
router.get("/:id", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const user = await User.findById(req.params.id)
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return errorResponse(res, "Hindi mahanap ang user.", 404);

    return successResponse(res, "Nakuha ang user.", user);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng user.");
  }
});

// -------------------------------------------------------
// PUT /api/users/:id — I-update ang user (sarili lang o admin)
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    const { name, email } = req.body;

    // Pwede lang i-edit ang sariling profile (maliban kung admin)
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return errorResponse(res, "Hindi ka pwedeng mag-edit ng ibang user.", 403);
    }

    // 👉 PALITAN: await User.findByIdAndUpdate(req.params.id, { name, email })
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang user.", 404);

    users[index] = { ...users[index], name: name || users[index].name, email: email || users[index].email };

    return successResponse(res, "Na-update ang user.", users[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng user.");
  }
});

// -------------------------------------------------------
// DELETE /api/users/:id — Burahin ang user (Admin only)
// -------------------------------------------------------
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN: await User.findByIdAndDelete(req.params.id)
    const index = users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang user.", 404);

    users.splice(index, 1);
    return successResponse(res, "Nabura ang user.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng user.");
  }
});

module.exports = router;
