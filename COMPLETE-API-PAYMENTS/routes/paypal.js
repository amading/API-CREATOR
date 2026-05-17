// ============================================================
// PAYPAL API — International Payments
// BASE URL: /api/payments/paypal
// DOCS: https://developer.paypal.com/api/orders/v2
// ============================================================

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DB — PALITAN NG TUNAY NA DATABASE
let transactions = [];

const PAYPAL_URL = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// Kumuha ng PayPal access token
async function getPayPalToken() {
  const response = await axios.post(
    `${PAYPAL_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET,
      },
    }
  );
  return response.data.access_token;
}

// -------------------------------------------------------
// POST /api/payments/paypal/create — Gumawa ng PayPal order
// -------------------------------------------------------
router.post("/create", verifyToken, authLimiter, async (req, res) => {
  try {
    const { amount, currency, description, items } = req.body;
    if (!amount || amount <= 0) return errorResponse(res, "Hindi valid ang amount.", 400);

    const token = await getPayPalToken();
    const cur = (currency || "PHP").toUpperCase();

    const response = await axios.post(
      `${PAYPAL_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: cur,
            value: parseFloat(amount).toFixed(2),
            breakdown: items ? {
              item_total: { currency_code: cur, value: parseFloat(amount).toFixed(2) },
            } : undefined,
          },
          description: description || "Payment",
          items: items?.map((i) => ({
            name: i.name,
            quantity: String(i.qty || 1),
            unit_amount: { currency_code: cur, value: parseFloat(i.price).toFixed(2) },
          })),
        }],
        application_context: {
          return_url: process.env.PAYPAL_SUCCESS_URL || `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: process.env.PAYPAL_CANCEL_URL || `${process.env.FRONTEND_URL}/payment/cancel`,
          brand_name: process.env.APP_NAME || "My App",
          user_action: "PAY_NOW",
        },
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    const order = response.data;
    const approveLink = order.links.find((l) => l.rel === "approve")?.href;

    // PALITAN: await Transaction.create({...})
    const transaction = {
      id: Date.now().toString(),
      userId: req.user.id,
      method: "paypal",
      amount: parseFloat(amount),
      currency: cur,
      status: "pending",
      referenceId: order.id,
      checkoutUrl: approveLink,
      createdAt: new Date(),
    };
    transactions.push(transaction);

    return successResponse(res, "Handa na ang PayPal payment!", {
      transactionId: transaction.id,
      orderId: order.id,
      checkoutUrl: approveLink, // ← i-redirect dito
      amount,
      currency: cur,
    }, 201);
  } catch (err) {
    console.error("[PAYPAL CREATE ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa paglikha ng PayPal order.", 500);
  }
});

// -------------------------------------------------------
// POST /api/payments/paypal/capture/:orderId — Kunin ang bayad
// (I-call ito kapag bumalik ang user mula sa PayPal)
// -------------------------------------------------------
router.post("/capture/:orderId", verifyToken, async (req, res) => {
  try {
    const token = await getPayPalToken();

    const response = await axios.post(
      `${PAYPAL_URL}/v2/checkout/orders/${req.params.orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    const capture = response.data;
    const status = capture.status; // COMPLETED, APPROVED, etc.

    // PALITAN: await Transaction.findOneAndUpdate({ referenceId: orderId }, { status: 'paid' })
    const transaction = transactions.find((t) => t.referenceId === req.params.orderId);
    if (transaction) transaction.status = status === "COMPLETED" ? "paid" : "pending";

    if (status !== "COMPLETED")
      return errorResponse(res, "Hindi pa kumpleto ang PayPal payment.", 400);

    return successResponse(res, "Matagumpay na nabayad via PayPal!", {
      orderId: capture.id,
      status: "paid",
      amount: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
      currency: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code,
    });
  } catch (err) {
    console.error("[PAYPAL CAPTURE ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa pag-capture ng PayPal payment.", 500);
  }
});

// -------------------------------------------------------
// GET /api/payments/paypal/status/:orderId — Tingnan ang status
// -------------------------------------------------------
router.get("/status/:orderId", verifyToken, async (req, res) => {
  try {
    const token = await getPayPalToken();
    const response = await axios.get(
      `${PAYPAL_URL}/v2/checkout/orders/${req.params.orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const order = response.data;
    return successResponse(res, "Nakuha ang PayPal order status.", {
      orderId: order.id,
      status: order.status,
      amount: order.purchase_units?.[0]?.amount?.value,
      currency: order.purchase_units?.[0]?.amount?.currency_code,
    });
  } catch (err) {
    console.error("[PAYPAL STATUS ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa pagkuha ng PayPal status.", 500);
  }
});

// -------------------------------------------------------
// POST /api/payments/paypal/refund/:captureId — Mag-refund ng PayPal payment
// -------------------------------------------------------
router.post("/refund/:captureId", verifyToken, authLimiter, async (req, res) => {
  try {
    const { amount, currency, note } = req.body;
    const token = await getPayPalToken();

    const body = {};
    if (amount) body.amount = { value: parseFloat(amount).toFixed(2), currency_code: (currency || "PHP").toUpperCase() };
    if (note) body.note_to_payer = note;

    const response = await axios.post(
      `${PAYPAL_URL}/v2/payments/captures/${req.params.captureId}/refund`,
      body,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    const refund = response.data;

    // PALITAN: await Transaction.findOneAndUpdate({ paypalCaptureId }, { status: 'refunded' })
    return successResponse(res, "Na-refund ang PayPal payment.", {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount?.value,
      currency: refund.amount?.currency_code,
    });
  } catch (err) {
    console.error("[PAYPAL REFUND ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa PayPal refund.", 500);
  }
});

// -------------------------------------------------------
// GET /api/payments/paypal/history — Lahat ng PayPal payments ng user
// -------------------------------------------------------
router.get("/history", verifyToken, (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    // PALITAN: await Transaction.find({ userId: req.user.id, method: 'paypal' }).sort("-createdAt")
    const filtered = transactions
      .filter((t) => t.userId === req.user.id && t.method === "paypal")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, "Nakuha ang PayPal payment history.", {
      transactions: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page, limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng PayPal history.");
  }
});

module.exports = router;
