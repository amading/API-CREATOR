// ============================================================
// DEVICE TOKENS API — Para sa Push Notifications (FCM / APNs)
// BASE URL: /api/device-tokens
// GAMIT: I-register ang device ng user para makatanggap ng push notif
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DATABASE — PALITAN NG TUNAY NA DATABASE
let deviceTokens = [];

// -------------------------------------------------------
// POST /api/device-tokens — I-register ang device
// I-call ito kapag nag-login ang user sa mobile app
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;

    if (!token) return errorResponse(res, "Kailangan ang device token.", 400);

    const validPlatforms = ["android", "ios", "web"];
    if (platform && !validPlatforms.includes(platform))
      return errorResponse(res, `Hindi valid ang platform. Gamitin ang: ${validPlatforms.join(", ")}`, 400);

    // PALITAN: await DeviceToken.findOneAndUpdate({ userId: req.user.id, deviceId }, { token, platform }, { upsert: true })
    const existing = deviceTokens.find((d) => d.userId === req.user.id && d.deviceId === deviceId);
    if (existing) {
      existing.token = token;
      existing.platform = platform || existing.platform;
      existing.updatedAt = new Date();
      return successResponse(res, "Na-update ang device token.", existing);
    }

    const newDevice = {
      id: Date.now().toString(),
      userId: req.user.id,
      token,
      platform: platform || "android",
      deviceId: deviceId || `device-${Date.now()}`,
      createdAt: new Date(),
    };
    deviceTokens.push(newDevice);

    return successResponse(res, "Nai-register ang device para sa push notifications.", newDevice, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pag-register ng device.");
  }
});

// -------------------------------------------------------
// GET /api/device-tokens — Lahat ng registered devices ng user
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const devices = await DeviceToken.find({ userId: req.user.id })
    const userDevices = deviceTokens.filter((d) => d.userId === req.user.id);
    return successResponse(res, "Nakuha ang mga device.", userDevices);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga device.");
  }
});

// -------------------------------------------------------
// DELETE /api/device-tokens — Alisin ang device (kapag nag-logout)
// I-call ito kapag nag-logout ang user sa mobile app
// -------------------------------------------------------
router.delete("/", verifyToken, (req, res) => {
  try {
    const { token, deviceId } = req.body;

    if (!token && !deviceId)
      return errorResponse(res, "Kailangan ang token o deviceId.", 400);

    // PALITAN: await DeviceToken.findOneAndDelete({ userId: req.user.id, token })
    const before = deviceTokens.length;
    deviceTokens = deviceTokens.filter((d) => {
      if (d.userId !== req.user.id) return true;
      if (token && d.token === token) return false;
      if (deviceId && d.deviceId === deviceId) return false;
      return true;
    });

    if (deviceTokens.length === before)
      return errorResponse(res, "Hindi mahanap ang device.", 404);

    return successResponse(res, "Na-remove ang device. Hindi na makakatanggap ng push notifications.");
  } catch (err) {
    return errorResponse(res, "May error sa pag-remove ng device.");
  }
});

module.exports = router;
