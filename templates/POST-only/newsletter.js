// ============================================================
// NEWSLETTER / SUBSCRIPTION API — POST Only
// 👉 BASE URL: /api/newsletter
// 👉 GAMITIN PARA SA: Email subscription, push notification opt-in
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/newsletter", require("./templates/POST-only/newsletter"))
// ============================================================

const express = require("express");
const router = express.Router();
const { authLimiter } = require("../../middleware/rateLimiter");
const { verifyAdmin } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
const subscribers = [];

// -------------------------------------------------------
// POST /api/newsletter/subscribe — Mag-subscribe
// -------------------------------------------------------
router.post("/subscribe", authLimiter, async (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD KUNG KAILANGAN
    const { email, name, preferences } = req.body;

    if (!email) {
      return errorResponse(res, "Kailangan ang email address.", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, "Hindi valid ang email address.", 400);
    }

    // 👉 PALITAN: const exists = await Subscriber.findOne({ email })
    const exists = subscribers.find((s) => s.email === email);
    if (exists) {
      if (exists.isActive) {
        return errorResponse(res, "Naka-subscribe na ang email na iyan.", 409);
      }
      // I-reactivate kung dati na naka-subscribe
      exists.isActive = true;
      return successResponse(res, "Muling na-activate ang iyong subscription!");
    }

    // 👉 PALITAN: await Subscriber.create({...})
    subscribers.push({
      id: Date.now().toString(),
      email,
      name: name || "",
      // 👉 PALITAN ANG MGA PREFERENCES AYON SA IYONG NEWSLETTER TYPES
      preferences: preferences || ["general"],
      isActive: true,
      subscribedAt: new Date(),
    });

    console.log(`[NEWSLETTER] Bagong subscriber: ${email}`);
    return successResponse(res, "Matagumpay na naka-subscribe! Salamat.");
  } catch (err) {
    return errorResponse(res, "May error sa pag-subscribe.");
  }
});

// -------------------------------------------------------
// POST /api/newsletter/unsubscribe — Mag-unsubscribe
// -------------------------------------------------------
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return errorResponse(res, "Kailangan ang email.", 400);

    // 👉 PALITAN: await Subscriber.findOneAndUpdate({ email }, { isActive: false })
    const subscriber = subscribers.find((s) => s.email === email);
    if (!subscriber) {
      return errorResponse(res, "Hindi nahanap ang email na iyan sa aming listahan.", 404);
    }

    subscriber.isActive = false;
    return successResponse(res, "Na-unsubscribe ka na. Maaari kang mag-subscribe ulit anumang oras.");
  } catch (err) {
    return errorResponse(res, "May error sa pag-unsubscribe.");
  }
});

// -------------------------------------------------------
// POST /api/newsletter/send — Mag-send ng newsletter (Admin only)
// -------------------------------------------------------
router.post("/send", verifyAdmin, async (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD NG IYONG NEWSLETTER
    const { subject, htmlContent, targetPreference } = req.body;

    if (!subject || !htmlContent) {
      return errorResponse(res, "Kailangan ang subject at htmlContent.", 400);
    }

    // 👉 PALITAN: Filter subscribers base sa preference
    const recipients = subscribers.filter(
      (s) => s.isActive && (!targetPreference || s.preferences.includes(targetPreference))
    );

    if (recipients.length === 0) {
      return errorResponse(res, "Walang mga subscribers na makakatanggap ng newsletter.", 400);
    }

    // 👉 PALITAN: I-send sa bawat recipient gamit ang nodemailer/sendgrid/mailchimp
    // for (const sub of recipients) {
    //   await transporter.sendMail({
    //     from: process.env.EMAIL_FROM,
    //     to: sub.email,
    //     subject,
    //     html: htmlContent,
    //   });
    // }

    console.log(`[NEWSLETTER] Nagpadala sa ${recipients.length} subscribers`);
    return successResponse(res, `Newsletter naipadala sa ${recipients.length} subscribers!`, {
      sentTo: recipients.length,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagpapadala ng newsletter.");
  }
});

module.exports = router;
