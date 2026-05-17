// ============================================================
// CONTACT FORM API — POST Only
// 👉 BASE URL: /api/contact
// 👉 GAMITIN PARA SA: Contact us form, feedback form, report form
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/contact", require("./templates/POST-only/contact-form"))
// KAILANGAN PANG I-INSTALL:
//   npm install nodemailer          (para sa email sending)
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { authLimiter } = require("../../middleware/rateLimiter");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// NODEMAILER SETUP — 👉 I-uncomment at palitan ng iyong email settings
// -------------------------------------------------------
// const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,    // 👉 Iyong Gmail address
//     pass: process.env.EMAIL_PASS,    // 👉 Gmail App Password (hindi ang actual password)
//   },
// });

// -------------------------------------------------------
// POST /api/contact — Mag-send ng contact form
// -------------------------------------------------------
router.post("/", verifyToken, authLimiter, async (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG FORM
    const { name, email, subject, message, phone } = req.body;

    // Validation
    if (!name || !email || !message) {
      return errorResponse(res, "Kailangan ang name, email, at message.", 400);
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, "Hindi valid ang email address.", 400);
    }

    if (message.length < 10) {
      return errorResponse(res, "Dapat hindi bababa sa 10 characters ang message.", 400);
    }

    // ---- OPTION 1: I-save sa database ----
    // 👉 PALITAN: await ContactMessage.create({ name, email, subject, message, phone })

    // ---- OPTION 2: I-send sa email ----
    // 👉 I-uncomment ang nodemailer sa taas at ito:
    // await transporter.sendMail({
    //   from: `"${name}" <${process.env.EMAIL_USER}>`,
    //   to: process.env.ADMIN_EMAIL,   // 👉 Iyong email na tatanggap
    //   subject: subject || `Bagong mensahe mula kay ${name}`,
    //   html: `
    //     <h3>Bagong Contact Form Submission</h3>
    //     <p><strong>Pangalan:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Phone:</strong> ${phone || "Hindi ibinigay"}</p>
    //     <p><strong>Mensahe:</strong></p>
    //     <p>${message}</p>
    //   `,
    // });

    console.log(`[CONTACT FORM] Mula: ${name} <${email}>`);

    return successResponse(res, "Natanggap ang iyong mensahe! Makikipag-ugnayan kami sa iyo.");
  } catch (err) {
    console.error("[CONTACT FORM ERROR]", err);
    return errorResponse(res, "May error sa pagpapadala ng mensahe. Subukang muli.");
  }
});

// -------------------------------------------------------
// POST /api/contact/report — Para sa report/complaint form
// -------------------------------------------------------
router.post("/report", verifyToken, authLimiter, async (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG REPORT FORM
    const { reporterEmail, category, description, attachmentUrl } = req.body;

    if (!reporterEmail || !category || !description) {
      return errorResponse(res, "Kailangan ang email, kategorya, at deskripsyon.", 400);
    }

    // 👉 PALITAN: Anong mga valid na categories sa iyong app
    const validCategories = ["bug", "spam", "inappropriate", "fraud", "other"];
    if (!validCategories.includes(category)) {
      return errorResponse(res, `Hindi valid ang kategorya. Gamitin ang: ${validCategories.join(", ")}`, 400);
    }

    // 👉 PALITAN: await Report.create({ reporterEmail, category, description, attachmentUrl })
    console.log(`[REPORT] ${category} mula sa ${reporterEmail}`);

    return successResponse(res, "Naisumite ang iyong reklamo. Susuriin namin ito.");
  } catch (err) {
    return errorResponse(res, "May error sa pagsusumite ng reklamo.");
  }
});

module.exports = router;
