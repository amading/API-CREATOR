// ============================================================
// NOTIFICATIONS ROUTES — Para sa in-app notifications
// 👉 BASE URL: /api/notifications
// 👉 PALITAN NG IYONG NOTIFICATION MODEL AT FIELDS
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
let notifications = [
  { id: "1", userId: "1", message: "Maligayang pagdating!", isRead: false, createdAt: new Date() },
  { id: "2", userId: "1", message: "May bagong order ka!", isRead: false, createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/notifications — Lahat ng notif ng naka-login
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const notifs = await Notification.find({ userId: req.user.id }).sort("-createdAt")
    const userNotifs = notifications.filter((n) => n.userId === req.user.id);
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    return successResponse(res, "Nakuha ang mga notipikasyon.", {
      notifications: userNotifs,
      unreadCount,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng notifications.");
  }
});

// -------------------------------------------------------
// PATCH /api/notifications/:id/read — Markahan bilang nabasa
// -------------------------------------------------------
router.patch("/:id/read", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    const notif = notifications.find((n) => n.id === req.params.id && n.userId === req.user.id);
    if (!notif) return errorResponse(res, "Hindi mahanap ang notipikasyon.", 404);

    notif.isRead = true;
    return successResponse(res, "Nabasa na ang notipikasyon.", notif);
  } catch (err) {
    return errorResponse(res, "May error sa pag-mark ng notipikasyon.");
  }
});

// -------------------------------------------------------
// PATCH /api/notifications/read-all — Markahan lahat bilang nabasa
// -------------------------------------------------------
router.patch("/read-all", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Notification.updateMany({ userId: req.user.id }, { isRead: true })
    notifications
      .filter((n) => n.userId === req.user.id)
      .forEach((n) => (n.isRead = true));

    return successResponse(res, "Lahat ng notipikasyon ay nabasa na.");
  } catch (err) {
    return errorResponse(res, "May error sa pag-mark ng lahat ng notipikasyon.");
  }
});

// -------------------------------------------------------
// DELETE /api/notifications/:id — Burahin ang notif
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = notifications.findIndex(
      (n) => n.id === req.params.id && n.userId === req.user.id
    );
    if (index === -1) return errorResponse(res, "Hindi mahanap ang notipikasyon.", 404);

    // 👉 PALITAN: await Notification.findByIdAndDelete(req.params.id)
    notifications.splice(index, 1);
    return successResponse(res, "Nabura ang notipikasyon.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng notipikasyon.");
  }
});

module.exports = router;
