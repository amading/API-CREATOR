// ============================================================
// PAYPAL PAYMENT API
// 👉 BASE URL: /api/payments/paypal
// 👉 GAMITIN PARA SA: International payments, paypal checkout
// ============================================================
// PAANO GAMITIN:
//   1. Mag-sign up sa https://developer.paypal.com
//   2. Gumawa ng app para makuha ang Client ID at Secret
//   3. npm install axios
//   4. I-set sa .env:
//        PAYPAL_CLIENT_ID=AaBbCc...
//        PAYPAL_CLIENT_SECRET=EeFfGg...
//        PAYPAL_MODE=sandbox   (palitan ng "live" sa production)
//        FRONTEND_URL=http://localhost:5173
//   5. sa server.js:  app.use("/api/payments/paypal", require("./templates/PAYMENTS/paypal"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// 👉 I-uncomment ito pagkatapos ng "npm install axios"
// const axios = require("axios");
// const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
//   ? "https://api-m.paypal.com"
//   : "https://api-m.sandbox.paypal.com";

// Helper function para makuha ang PayPal access token
// const getPaypalToken = async () => {
//   const response = await axios.post(`${PAYPAL_BASE}/v1/oauth2/token`,
//     "grant_type=client_credentials",
//     {
//       auth: { username: process.env.PAYPAL_CLIENT_ID, password: process.env.PAYPAL_CLIENT_SECRET },
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     }
//   );
//   return response.data.access_token;
// };

// -------------------------------------------------------
// POST /api/payments/paypal/create-order — Gumawa ng PayPal order
// -------------------------------------------------------
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    // 👉 PALITAN: Kunin ang actual amount at items mula sa iyong order
    const { amount, currency, orderId, items } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, "Hindi valid ang halaga.", 400);
    }

    // 👉 I-uncomment ang PayPal code:
    // const token = await getPaypalToken();
    // const response = await axios.post(`${PAYPAL_BASE}/v2/checkout/orders`, {
    //   intent: "CAPTURE",
    //   purchase_units: [{
    //     reference_id: orderId || Date.now().toString(),
    //     amount: {
    //       currency_code: currency || "PHP",    // 👉 PALITAN NG IYONG CURRENCY
    //       value: amount.toFixed(2),
    //     },
    //   }],
    //   application_context: {
    //     return_url: `${process.env.FRONTEND_URL}/payment-success`,  // 👉 PALITAN
    //     cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,   // 👉 PALITAN
    //   },
    // }, { headers: { Authorization: `Bearer ${token}` } });
    //
    // const approvalUrl = response.data.links.find(l => l.rel === "approve")?.href;
    // return successResponse(res, "PayPal order created.", {
    //   orderId: response.data.id,
    //   approvalUrl,
    // });

    return successResponse(res, "[PLACEHOLDER] PayPal order.", {
      orderId: "PAYPAL-ORDER-PLACEHOLDER",
      approvalUrl: "https://www.sandbox.paypal.com/checkoutnow?token=placeholder",
      note: "👉 I-uncomment ang PayPal code at mag-install ng axios",
    });
  } catch (err) {
    console.error("[PAYPAL ERROR]", err.response?.data || err);
    return errorResponse(res, "May error sa PayPal order creation.");
  }
});

// -------------------------------------------------------
// POST /api/payments/paypal/capture/:paypalOrderId — I-capture ang payment
// (Tatawagin ito pagkatapos mag-approve ng user sa PayPal)
// -------------------------------------------------------
router.post("/capture/:paypalOrderId", verifyToken, async (req, res) => {
  try {
    const { paypalOrderId } = req.params;

    // 👉 I-uncomment ang PayPal code:
    // const token = await getPaypalToken();
    // const response = await axios.post(
    //   `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    //   {},
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
    //
    // if (response.data.status === "COMPLETED") {
    //   // 👉 I-update ang order sa database
    //   // await Order.findOneAndUpdate({ paypalOrderId }, { status: "paid", paidAt: new Date() })
    //   return successResponse(res, "Matagumpay na nabayad sa PayPal!", {
    //     transactionId: response.data.id,
    //     status: response.data.status,
    //   });
    // }

    return successResponse(res, "[PLACEHOLDER] PayPal capture.", {
      transactionId: "TRANSACTION-PLACEHOLDER",
      status: "COMPLETED",
      note: "👉 I-uncomment ang PayPal code",
    });
  } catch (err) {
    return errorResponse(res, "May error sa PayPal payment capture.");
  }
});

// -------------------------------------------------------
// POST /api/payments/paypal/refund/:captureId — Mag-refund (Admin only)
// -------------------------------------------------------
router.post("/refund/:captureId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return errorResponse(res, "Admin lang ang pwedeng mag-refund.", 403);
    }

    const { amount, currency } = req.body;

    // 👉 I-uncomment ang PayPal code:
    // const token = await getPaypalToken();
    // const response = await axios.post(
    //   `${PAYPAL_BASE}/v2/payments/captures/${req.params.captureId}/refund`,
    //   amount ? { amount: { value: amount.toFixed(2), currency_code: currency || "PHP" } } : {},
    //   { headers: { Authorization: `Bearer ${token}` } }
    // );
    // return successResponse(res, "Naisagawa ang PayPal refund!", { refundId: response.data.id });

    return successResponse(res, "[PLACEHOLDER] PayPal refund.", {
      refundId: "REFUND-PLACEHOLDER",
      note: "👉 I-uncomment ang PayPal code",
    });
  } catch (err) {
    return errorResponse(res, "May error sa PayPal refund.");
  }
});

module.exports = router;
