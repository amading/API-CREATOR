// ============================================================
// EMAIL SENDER API — POST Only
// 👉 BASE URL: /api/email
// 👉 GAMITIN PARA SA: Transactional emails (welcome, reset password, receipts)
// ============================================================
// PAANO GAMITIN:
//   1. PILIIN ANG EMAIL PROVIDER:
//      - Gmail:       npm install nodemailer
//      - SendGrid:    npm install @sendgrid/mail   |  https://sendgrid.com
//      - Resend (libre tier): npm install resend   |  https://resend.com
//   2. I-set sa .env (ayon sa piniling provider):
//        EMAIL_PROVIDER=gmail        (o sendgrid, resend)
//        EMAIL_FROM=no-reply@iyongsite.com
//
//        Para sa Gmail:
//        GMAIL_USER=iyong@gmail.com
//        GMAIL_PASS=xxxx-xxxx-xxxx-xxxx  (Google App Password)
//
//        Para sa SendGrid:
//        SENDGRID_API_KEY=SG.xxxx
//
//        Para sa Resend:
//        RESEND_API_KEY=re_xxxx
//   3. sa server.js:  app.use("/api/email", require("./templates/SPECIAL/email-sender"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../../middleware/auth");
const { authLimiter } = require("../../middleware/rateLimiter");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// EMAIL PROVIDER SETUP — 👉 I-uncomment ang provider na gagamitin mo
// -------------------------------------------------------

// --- OPTION A: Gmail via Nodemailer ---
// const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
// });

// --- OPTION B: SendGrid ---
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- OPTION C: Resend (pinaka-madaling gamitin) ---
// const { Resend } = require("resend");
// const resend = new Resend(process.env.RESEND_API_KEY);

// -------------------------------------------------------
// HELPER: Mag-send ng email (palitan ng iyong provider)
// -------------------------------------------------------
const sendEmail = async ({ to, subject, html, text }) => {
  // 👉 UNCOMMENT ANG PROVIDER NA GAGAMITIN MO:

  // --- Gmail ---
  // await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, text });

  // --- SendGrid ---
  // await sgMail.send({ from: process.env.EMAIL_FROM, to, subject, html, text });

  // --- Resend ---
  // await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject, html, text });

  // PLACEHOLDER (para sa development):
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
};

// -------------------------------------------------------
// EMAIL TEMPLATES — 👉 PALITAN NG IYONG BRAND/COLORS
// -------------------------------------------------------
const emailTemplates = {
  welcome: (name) => ({
    subject: `Maligayang pagdating, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007bff;">Maligayang Pagdating!</h1>  <!-- 👉 PALITAN NG IYONG COLOR -->
        <p>Kumusta ${name}!</p>
        <p>Matagumpay kang nagrehistro sa aming platform.</p>
        <!-- 👉 PALITAN NG IYONG MENSAHE -->
        <a href="${process.env.FRONTEND_URL}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Bisitahin ang App
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          <!-- 👉 PALITAN NG IYONG PANGALAN AT ADDRESS -->
          Ang email na ito ay galing sa Iyong Company Name
        </p>
      </div>
    `,
  }),

  resetPassword: (name, resetLink) => ({
    subject: "Reset ang iyong password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Password</h2>
        <p>Kumusta ${name},</p>
        <p>May kahilingan para i-reset ang iyong password.</p>
        <a href="${resetLink}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          I-reset ang Password
        </a>
        <p>Mag-e-expire ang link na ito sa <strong>1 oras</strong>.</p>
        <p>Kung hindi ikaw ang nag-request nito, huwag pansinin ang email na ito.</p>
      </div>
    `,
  }),

  orderConfirmation: (name, order) => ({
    subject: `Order Confirmed — Order #${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nakumpirma ang iyong order!</h2>
        <p>Salamat ${name}, natanggap na namin ang iyong order.</p>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Kabuuan:</strong> PHP ${order.total?.toLocaleString()}</p>
        <!-- 👉 DAGDAGAN NG MGA ITEMS TABLE KUNG GUSTO MO -->
        <p>Aabisuhan ka namin kapag naka-ship na.</p>
      </div>
    `,
  }),
};

// -------------------------------------------------------
// POST /api/email/welcome — Mag-send ng welcome email
// -------------------------------------------------------
router.post("/welcome", verifyToken, authLimiter, async (req, res) => {
  try {
    const { to, name } = req.body;
    if (!to || !name) return errorResponse(res, "Kailangan ang to at name.", 400);

    const template = emailTemplates.welcome(name);
    await sendEmail({ to, ...template });
    return successResponse(res, "Welcome email naipadala na.");
  } catch (err) {
    return errorResponse(res, "May error sa pagpapadala ng welcome email.");
  }
});

// -------------------------------------------------------
// POST /api/email/reset-password — Mag-send ng password reset link
// -------------------------------------------------------
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { to, name, resetToken } = req.body;
    if (!to || !resetToken) return errorResponse(res, "Kailangan ang to at resetToken.", 400);

    // 👉 PALITAN NG IYONG ACTUAL RESET URL
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const template = emailTemplates.resetPassword(name || "User", resetLink);
    await sendEmail({ to, ...template });

    return successResponse(res, "Password reset email naipadala na.");
  } catch (err) {
    return errorResponse(res, "May error sa pagpapadala ng reset email.");
  }
});

// -------------------------------------------------------
// POST /api/email/order-confirmation — Mag-send ng order receipt
// -------------------------------------------------------
router.post("/order-confirmation", verifyToken, async (req, res) => {
  try {
    const { to, name, order } = req.body;
    if (!to || !order) return errorResponse(res, "Kailangan ang to at order.", 400);

    const template = emailTemplates.orderConfirmation(name || "Customer", order);
    await sendEmail({ to, ...template });
    return successResponse(res, "Order confirmation email naipadala na.");
  } catch (err) {
    return errorResponse(res, "May error sa order confirmation email.");
  }
});

// -------------------------------------------------------
// POST /api/email/custom — Custom email (Admin only)
// -------------------------------------------------------
router.post("/custom", verifyAdmin, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject || (!html && !text)) {
      return errorResponse(res, "Kailangan ang to, subject, at html o text.", 400);
    }

    await sendEmail({ to, subject, html, text });
    return successResponse(res, "Custom email naipadala na.");
  } catch (err) {
    return errorResponse(res, "May error sa pagpapadala ng custom email.");
  }
});

module.exports = router;
