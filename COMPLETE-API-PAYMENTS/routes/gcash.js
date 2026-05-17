// ============================================================
// GCASH / MAYA API — via PayMongo
// BASE URL: /api/payments/gcash
// DOCS: https://developers.paymongo.com
// ============================================================

const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DB — PALITAN NG TUNAY NA DATABASE
let transactions = [];

// PayMongo base config
const PAYMONGO_URL = "https://api.paymongo.com/v1";
const getHeaders = () => ({
  Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

// -------------------------------------------------------
// POST /api/payments/gcash/pay — Gumawa ng GCash payment
// -------------------------------------------------------
router.post("/pay", verifyToken, authLimiter, async (req, res) => {
  try {
    const { amount, description, successUrl, cancelUrl } = req.body;

    if (!amount || amount < 100)
      return errorResponse(res, "Minimum na amount ay ₱1.00 (100 centavos).", 400);
    if (!successUrl || !cancelUrl)
      return errorResponse(res, "Kailangan ang successUrl at cancelUrl.", 400);

    // STEP 1: Gumawa ng payment link sa PayMongo
    const response = await axios.post(
      `${PAYMONGO_URL}/links`,
      {
        data: {
          attributes: {
            amount: Math.round(amount * 100), // Convert sa centavos
            description: description || "Payment",
            remarks: `user-${req.user.id}`,
          },
        },
      },
      { headers: getHeaders() }
    );

    const link = response.data.data;

    // PALITAN: await Transaction.create({...})
    const transaction = {
      id: Date.now().toString(),
      userId: req.user.id,
      method: "gcash",
      amount,
      currency: "PHP",
      status: "pending",
      referenceId: link.id,
      checkoutUrl: link.attributes.checkout_url,
      description: description || "Payment",
      createdAt: new Date(),
    };
    transactions.push(transaction);

    return successResponse(res, "Handa na ang GCash payment!", {
      transactionId: transaction.id,
      checkoutUrl: link.attributes.checkout_url, // ← i-redirect ang user dito
      referenceId: link.id,
      amount,
      status: "pending",
    }, 201);
  } catch (err) {
    console.error("[GCASH ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa paglikha ng GCash payment.", 500);
  }
});

// -------------------------------------------------------
// POST /api/payments/maya/pay — Gumawa ng Maya payment
// -------------------------------------------------------
router.post("/maya/pay", verifyToken, authLimiter, async (req, res) => {
  try {
    const { amount, description, successUrl, cancelUrl } = req.body;

    if (!amount || amount < 100)
      return errorResponse(res, "Minimum na amount ay ₱1.00.", 400);

    // STEP 1: Gumawa ng payment intent
    const intentRes = await axios.post(
      `${PAYMONGO_URL}/payment_intents`,
      {
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            payment_method_allowed: ["paymaya"],
            payment_method_options: { card: { request_three_d_secure: "any" } },
            currency: "PHP",
            description: description || "Maya Payment",
            statement_descriptor: "MyApp",
          },
        },
      },
      { headers: getHeaders() }
    );

    const intent = intentRes.data.data;

    // STEP 2: Gumawa ng payment method
    const methodRes = await axios.post(
      `${PAYMONGO_URL}/payment_methods`,
      { data: { attributes: { type: "paymaya" } } },
      { headers: getHeaders() }
    );

    const method = methodRes.data.data;

    // STEP 3: I-attach ang payment method sa intent
    const attachRes = await axios.post(
      `${PAYMONGO_URL}/payment_intents/${intent.id}/attach`,
      {
        data: {
          attributes: {
            payment_method: method.id,
            return_url: successUrl || `${process.env.FRONTEND_URL}/payment/success`,
          },
        },
      },
      { headers: getHeaders() }
    );

    const attached = attachRes.data.data;

    // PALITAN: await Transaction.create({...})
    const transaction = {
      id: Date.now().toString(),
      userId: req.user.id,
      method: "maya",
      amount,
      currency: "PHP",
      status: "pending",
      referenceId: intent.id,
      checkoutUrl: attached.attributes.next_action?.redirect?.url,
      createdAt: new Date(),
    };
    transactions.push(transaction);

    return successResponse(res, "Handa na ang Maya payment!", {
      transactionId: transaction.id,
      checkoutUrl: transaction.checkoutUrl, // ← i-redirect dito
      referenceId: intent.id,
      amount,
      status: "pending",
    }, 201);
  } catch (err) {
    console.error("[MAYA ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa paglikha ng Maya payment.", 500);
  }
});

// -------------------------------------------------------
// GET /api/payments/gcash/status/:referenceId — Tingnan ang status
// -------------------------------------------------------
router.get("/status/:referenceId", verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${PAYMONGO_URL}/links/${req.params.referenceId}`,
      { headers: getHeaders() }
    );

    const link = response.data.data;
    const status = link.attributes.status; // paid, pending, unpaid

    // PALITAN: await Transaction.findOneAndUpdate({ referenceId }, { status })
    const transaction = transactions.find((t) => t.referenceId === req.params.referenceId && t.userId === req.user.id);
    if (transaction) transaction.status = status;

    return successResponse(res, "Nakuha ang status ng payment.", { status, amount: link.attributes.amount / 100 });
  } catch (err) {
    console.error("[STATUS ERROR]", err.response?.data || err.message);
    return errorResponse(res, "May error sa pagkuha ng payment status.", 500);
  }
});

// -------------------------------------------------------
// POST /api/payments/gcash/webhook — PayMongo webhook
// (Tinatawagan ng PayMongo kapag may nangyari sa payment)
// -------------------------------------------------------
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    const signature = req.headers["paymongo-signature"];

    // I-verify ang signature
    if (webhookSecret && signature) {
      const [timestamp, testSig, liveSig] = signature.split(",").map((s) => s.split("=")[1]);
      const payload = `${timestamp}.${req.body.toString()}`;
      const expectedSig = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");

      if (testSig !== expectedSig && liveSig !== expectedSig) {
        console.warn("[WEBHOOK] Invalid PayMongo signature");
        return res.status(400).json({ error: "Invalid signature" });
      }
    }

    const event = JSON.parse(req.body.toString());
    console.log(`[PAYMONGO WEBHOOK] Event: ${event.data?.attributes?.type}`);

    switch (event.data?.attributes?.type) {
      case "payment.paid":
        // PALITAN: await Transaction.findOneAndUpdate({ referenceId: ... }, { status: 'paid' })
        console.log("[PAYMENT] Bayad na!", event.data.attributes.data);
        break;
      case "payment.failed":
        console.log("[PAYMENT] Nabigo ang bayad.");
        break;
      case "link.payment.paid":
        console.log("[LINK] Bayad na ang link!");
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
    res.status(500).json({ error: "Webhook error" });
  }
});

// -------------------------------------------------------
// GET /api/payments/gcash/history — Lahat ng GCash payments ng user
// -------------------------------------------------------
router.get("/history", verifyToken, (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status } = req.query;

    // PALITAN: await Transaction.find({ userId: req.user.id, method: 'gcash' }).sort("-createdAt")
    let filtered = transactions.filter((t) => t.userId === req.user.id && (t.method === "gcash" || t.method === "maya"));
    if (status) filtered = filtered.filter((t) => t.status === status);
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, "Nakuha ang GCash/Maya payment history.", {
      transactions: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      totalPaid: filtered.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0),
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng history.");
  }
});

// -------------------------------------------------------
// PATCH /api/payments/gcash/:transactionId/cancel — I-cancel ang pending payment
// -------------------------------------------------------
router.patch("/:transactionId/cancel", verifyToken, async (req, res) => {
  try {
    const txn = transactions.find((t) => t.id === req.params.transactionId && t.userId === req.user.id);
    if (!txn) return errorResponse(res, "Hindi mahanap ang transaksyon.", 404);
    if (txn.status !== "pending") return errorResponse(res, "Pwede lang i-cancel ang 'pending' na payment.", 400);

    // PALITAN: i-expire ang PayMongo link via API
    // await axios.post(`${PAYMONGO_URL}/links/${txn.referenceId}/expire`, {}, { headers: getHeaders() })
    txn.status = "cancelled";
    txn.updatedAt = new Date();

    // PALITAN: await Transaction.findByIdAndUpdate(txn.id, { status: 'cancelled' })
    return successResponse(res, "Na-cancel ang payment.", txn);
  } catch (err) {
    return errorResponse(res, "May error sa pag-cancel ng payment.");
  }
});

module.exports = router;
