// ============================================================
// PUBLIC DATA API — GET Only, Walang kailangang login
// 👉 BASE URL: /api/public
// 👉 GAMITIN PARA SA: FAQs, Announcements, Config, Static Data
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/public", require("./templates/GET-only/public-data"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG IYONG TUNAY NA DATA O DATABASE
// -------------------------------------------------------
const faqs = [
  { id: "1", question: "Ano ang iyong serbisyo?", answer: "Nag-aalok kami ng..." },
  { id: "2", question: "Paano mag-sign up?", answer: "Pumunta sa register page..." },
];

const announcements = [
  { id: "1", title: "Bagong Update!", body: "Version 2.0 ay available na.", date: "2024-01-01" },
];

// 👉 PALITAN NG IMPORMASYON NG IYONG COMPANY/APP
const appInfo = {
  name: "Pangalan ng App Mo",           // 👉 PALITAN
  description: "Deskripsyon ng app",    // 👉 PALITAN
  version: "1.0.0",                     // 👉 PALITAN
  contact: "support@iyongsite.com",     // 👉 PALITAN
  social: {
    facebook: "https://facebook.com/iyongpage",   // 👉 PALITAN
    instagram: "https://instagram.com/iyongpage", // 👉 PALITAN
  },
};

// -------------------------------------------------------
// GET /api/public/info — Basic info ng app (walang auth)
// -------------------------------------------------------
router.get("/info", verifyToken, (req, res) => {
  return successResponse(res, "Impormasyon ng app.", appInfo);
});

// -------------------------------------------------------
// GET /api/public/faqs — Lahat ng FAQs
// -------------------------------------------------------
router.get("/faqs", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const faqs = await Faq.find({ isActive: true })
    return successResponse(res, "Nakuha ang mga FAQ.", faqs);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng FAQs.");
  }
});

// -------------------------------------------------------
// GET /api/public/faqs/:id — Isang FAQ
// -------------------------------------------------------
router.get("/faqs/:id", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const faq = await Faq.findById(req.params.id)
    const faq = faqs.find((f) => f.id === req.params.id);
    if (!faq) return errorResponse(res, "Hindi mahanap ang FAQ.", 404);
    return successResponse(res, "Nakuha ang FAQ.", faq);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng FAQ.");
  }
});

// -------------------------------------------------------
// GET /api/public/announcements — Lahat ng announcements
// -------------------------------------------------------
router.get("/announcements", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const list = await Announcement.find().sort("-date")
    return successResponse(res, "Nakuha ang mga anunsyo.", announcements);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga anunsyo.");
  }
});

// -------------------------------------------------------
// GET /api/public/stats — Public statistics (walang sensitive data)
// -------------------------------------------------------
router.get("/stats", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: kunin ang real counts mula sa database
    return successResponse(res, "Nakuha ang stats.", {
      totalUsers: 1200,       // 👉 PALITAN: await User.countDocuments()
      totalProducts: 340,     // 👉 PALITAN: await Product.countDocuments()
      totalOrders: 5600,      // 👉 PALITAN: await Order.countDocuments()
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng stats.");
  }
});

module.exports = router;
