// ============================================================
// OTP / SMS VERIFICATION API — POST at GET
// 👉 BASE URL: /api/otp
// 👉 GAMITIN PARA SA: Phone number verification, 2FA, password reset
// ============================================================
// PAANO GAMITIN:
//   1. Pumili ng SMS provider:
//      - Semaphore (PH): npm install semaphore-sms  |  https://semaphore.co
//      - Twilio (Global): npm install twilio          |  https://twilio.com
//   2. I-set sa .env:
//        OTP_EXPIRY_MINUTES=5
//        SEMAPHORE_API_KEY=iyong-api-key     (para sa Semaphore)
//        TWILIO_SID=ACxxx                    (para sa Twilio)
//        TWILIO_AUTH_TOKEN=xxx
//        TWILIO_PHONE=+1234567890
//   3. sa server.js:  app.use("/api/otp", require("./templates/SPECIAL/otp-verification"))
// ============================================================

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { authLimiter } = require("../../middleware/rateLimiter");
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// IN-MEMORY OTP STORE — 👉 PALITAN NG REDIS O DATABASE
// -------------------------------------------------------
// Para sa production, gumamit ng Redis:
// const redis = require("redis")
// const client = redis.createClient({ url: process.env.REDIS_URL })
const otpStore = new Map(); // { phoneNumber: { otp, expiresAt, attempts } }

// -------------------------------------------------------
// HELPER: Gumawa ng 6-digit OTP
// -------------------------------------------------------
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// -------------------------------------------------------
// HELPER: Mag-send ng OTP via Semaphore (PH)
// -------------------------------------------------------
// const sendViaSemaphore = async (phone, otp) => {
//   const axios = require("axios");
//   await axios.post("https://api.semaphore.co/api/v4/messages", {
//     apikey: process.env.SEMAPHORE_API_KEY,
//     number: phone,
//     message: `Ang iyong OTP ay: ${otp}. Mag-expire ito sa ${process.env.OTP_EXPIRY_MINUTES || 5} minuto.`,
//     // 👉 PALITAN NG IYONG SENDER NAME (registered sa Semaphore)
//     sendername: "IYONGAPP",
//   });
// };

// -------------------------------------------------------
// HELPER: Mag-send ng OTP via Twilio (International)
// -------------------------------------------------------
// const sendViaTwilio = async (phone, otp) => {
//   const twilio = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
//   await twilio.messages.create({
//     body: `Your OTP is: ${otp}. Expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.`,
//     from: process.env.TWILIO_PHONE,
//     to: phone, // Format: +639XXXXXXXXX
//   });
// };

// -------------------------------------------------------
// POST /api/otp/send — Mag-send ng OTP sa phone number
// -------------------------------------------------------
router.post("/send", authLimiter, async (req, res) => {
  try {
    // 👉 PALITAN NG IYONG FIELD NAME KUNG KAILANGAN
    const { phone } = req.body;

    if (!phone) {
      return errorResponse(res, "Kailangan ang phone number.", 400);
    }

    // Basic PH number validation (+63 format)
    // 👉 PALITAN O ALISIN ANG VALIDATION AYON SA IYONG TARGET REGION
    const phoneRegex = /^(\+63|0)9\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return errorResponse(res, "Hindi valid ang phone number. Gamitin ang format: 09XXXXXXXXX o +639XXXXXXXXX", 400);
    }

    // Normalize ang phone number
    const normalizedPhone = phone.startsWith("0") ? "+63" + phone.slice(1) : phone;

    // I-check kung nag-request na recently (anti-spam)
    const existing = otpStore.get(normalizedPhone);
    if (existing && existing.expiresAt > Date.now() - 60000) { // 1 minutong cooldown
      return errorResponse(res, "Nakapag-request ka na ng OTP kamakailan. Hintayin ng isang minuto.", 429);
    }

    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

    // 👉 I-save sa Redis o Database sa production:
    // await redis.setEx(`otp:${normalizedPhone}`, expiryMinutes * 60, JSON.stringify({ otp, attempts: 0 }))
    otpStore.set(normalizedPhone, { otp, expiresAt, attempts: 0 });

    // 👉 PILIIN NG IYONG SMS PROVIDER:
    // await sendViaSemaphore(normalizedPhone, otp);  // Para sa PH (Semaphore)
    // await sendViaTwilio(normalizedPhone, otp);      // Para sa International (Twilio)

    // PLACEHOLDER: Sa development, i-print sa console
    console.log(`[OTP] Phone: ${normalizedPhone} | OTP: ${otp} | Expires: ${new Date(expiresAt).toISOString()}`);

    return successResponse(res, `OTP naipadala na sa ${normalizedPhone}. Mag-expire ito sa ${expiryMinutes} minuto.`, {
      // 👉 Sa production, HUWAG ibalik ang OTP sa response!
      // Ito ay para sa development/testing lang:
      ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
    });
  } catch (err) {
    console.error("[OTP SEND ERROR]", err);
    return errorResponse(res, "May error sa pagpapadala ng OTP.");
  }
});

// -------------------------------------------------------
// POST /api/otp/verify — I-verify ang OTP
// -------------------------------------------------------
router.post("/verify", authLimiter, async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return errorResponse(res, "Kailangan ang phone number at OTP.", 400);
    }

    const normalizedPhone = phone.startsWith("0") ? "+63" + phone.slice(1) : phone;

    // 👉 PALITAN NG REDIS QUERY SA PRODUCTION:
    // const stored = await redis.get(`otp:${normalizedPhone}`)
    // const data = stored ? JSON.parse(stored) : null
    const data = otpStore.get(normalizedPhone);

    if (!data) {
      return errorResponse(res, "Walang OTP para sa phone number na ito. Mag-request muli.", 400);
    }

    // Check kung expired na
    if (data.expiresAt < Date.now()) {
      otpStore.delete(normalizedPhone);
      return errorResponse(res, "Expired na ang OTP. Mag-request ng bago.", 400);
    }

    // Max attempts (anti-brute force)
    if (data.attempts >= 5) {
      otpStore.delete(normalizedPhone);
      return errorResponse(res, "Napakaraming maling pagtatangka. Mag-request ng bagong OTP.", 429);
    }

    if (data.otp !== otp.toString()) {
      data.attempts += 1;
      return errorResponse(res, `Mali ang OTP. ${5 - data.attempts} pagtatangka pa ang natitira.`, 400);
    }

    // Tama ang OTP — burahin na
    // 👉 PALITAN: await redis.del(`otp:${normalizedPhone}`)
    otpStore.delete(normalizedPhone);

    // 👉 MAAARI KANG MAG-MARK NG PHONE NUMBER BILANG VERIFIED SA DATABASE:
    // await User.findOneAndUpdate({ phone: normalizedPhone }, { phoneVerified: true })

    return successResponse(res, "Tama ang OTP! Verified na ang iyong phone number.", {
      verified: true,
      phone: normalizedPhone,
    });
  } catch (err) {
    console.error("[OTP VERIFY ERROR]", err);
    return errorResponse(res, "May error sa pag-verify ng OTP.");
  }
});

// -------------------------------------------------------
// POST /api/otp/resend — Mag-resend ng OTP
// -------------------------------------------------------
router.post("/resend", authLimiter, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return errorResponse(res, "Kailangan ang phone number.", 400);

    // Burahin ang lumang OTP at mag-request ng bago
    const normalizedPhone = phone.startsWith("0") ? "+63" + phone.slice(1) : phone;
    otpStore.delete(normalizedPhone);

    // I-redirect sa /send logic
    req.body.phone = phone;

    // Simplified resend (same logic sa /send)
    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

    otpStore.set(normalizedPhone, { otp, expiresAt, attempts: 0 });
    // 👉 PALITAN: I-send gamit ang iyong SMS provider

    console.log(`[OTP RESEND] Phone: ${normalizedPhone} | OTP: ${otp}`);

    return successResponse(res, `Muling naipadala ang OTP sa ${normalizedPhone}.`, {
      ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
    });
  } catch (err) {
    return errorResponse(res, "May error sa pag-resend ng OTP.");
  }
});

module.exports = router;
