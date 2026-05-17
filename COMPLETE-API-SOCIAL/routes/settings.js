// ============================================================
// SETTINGS API — User Preferences at App Settings
// BASE URL: /api/settings
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DATABASE — PALITAN NG TUNAY NA DATABASE
let userSettings = [
  {
    userId: "1",
    notifications: { push: true, email: true, sms: false, orderUpdates: true, promotions: false },
    privacy: { showProfile: true, showActivity: false },
    appearance: { theme: "light", language: "filipino", fontSize: "medium" },
    updatedAt: new Date(),
  },
];

const defaultSettings = {
  notifications: { push: true, email: true, sms: false, orderUpdates: true, promotions: false },
  privacy: { showProfile: true, showActivity: false },
  appearance: { theme: "light", language: "filipino", fontSize: "medium" },
};

// -------------------------------------------------------
// GET /api/settings — Kunin ang settings ng naka-login
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const settings = await Settings.findOne({ userId: req.user.id })
    const settings = userSettings.find((s) => s.userId === req.user.id);

    // Kung wala pang settings, ibalik ang default
    return successResponse(res, "Nakuha ang settings.", settings || { userId: req.user.id, ...defaultSettings });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng settings.");
  }
});

// -------------------------------------------------------
// PUT /api/settings — I-update ang settings
// -------------------------------------------------------
router.put("/", verifyToken, (req, res) => {
  try {
    const { notifications, privacy, appearance } = req.body;

    // PALITAN: const settings = await Settings.findOneAndUpdate({ userId: req.user.id }, { $set: req.body }, { new: true, upsert: true })
    const index = userSettings.findIndex((s) => s.userId === req.user.id);

    if (index === -1) {
      const newSettings = {
        userId: req.user.id,
        ...defaultSettings,
        ...(notifications && { notifications: { ...defaultSettings.notifications, ...notifications } }),
        ...(privacy && { privacy: { ...defaultSettings.privacy, ...privacy } }),
        ...(appearance && { appearance: { ...defaultSettings.appearance, ...appearance } }),
        updatedAt: new Date(),
      };
      userSettings.push(newSettings);
      return successResponse(res, "Na-save ang settings.", newSettings);
    }

    if (notifications) userSettings[index].notifications = { ...userSettings[index].notifications, ...notifications };
    if (privacy) userSettings[index].privacy = { ...userSettings[index].privacy, ...privacy };
    if (appearance) userSettings[index].appearance = { ...userSettings[index].appearance, ...appearance };
    userSettings[index].updatedAt = new Date();

    return successResponse(res, "Na-update ang settings.", userSettings[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng settings.");
  }
});

// -------------------------------------------------------
// PUT /api/settings/notifications — I-update ang notification settings lang
// -------------------------------------------------------
router.put("/notifications", verifyToken, (req, res) => {
  try {
    const index = userSettings.findIndex((s) => s.userId === req.user.id);
    const updates = req.body;

    // PALITAN: await Settings.findOneAndUpdate({ userId: req.user.id }, { $set: { notifications: updates } })
    if (index === -1) {
      userSettings.push({ userId: req.user.id, ...defaultSettings, notifications: { ...defaultSettings.notifications, ...updates }, updatedAt: new Date() });
    } else {
      userSettings[index].notifications = { ...userSettings[index].notifications, ...updates };
      userSettings[index].updatedAt = new Date();
    }

    const saved = userSettings.find((s) => s.userId === req.user.id);
    return successResponse(res, "Na-update ang notification settings.", saved.notifications);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng notification settings.");
  }
});

// -------------------------------------------------------
// DELETE /api/settings — I-reset sa default settings
// -------------------------------------------------------
router.delete("/", verifyToken, (req, res) => {
  try {
    // PALITAN: await Settings.findOneAndDelete({ userId: req.user.id })
    const index = userSettings.findIndex((s) => s.userId === req.user.id);
    if (index !== -1) userSettings.splice(index, 1);

    return successResponse(res, "Na-reset ang settings sa default.", { userId: req.user.id, ...defaultSettings });
  } catch (err) {
    return errorResponse(res, "May error sa pag-reset ng settings.");
  }
});

module.exports = router;
