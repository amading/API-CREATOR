// ============================================================
// STRIPE API — Credit/Debit Card Payments
// BASE URL: /api/payments/stripe
// DOCS: https://stripe.com/docs/api
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { successResponse, errorResponse } = require("../utils/response");

// PALITAN: const Stripe = require("stripe"); const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
let stripe;
try { stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); } catch (e) {}

// DUMMY DB — PALITAN NG TUNAY NA DATABASE
let transactions = [];

// -------------------------------------------------------
// POST /api/payments/stripe/checkout — Gumawa ng Stripe Checkout
// -------------------------------------------------------
router.post("/checkout", verifyToken, authLimiter, async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return errorResponse(res, "Kailangan ng items array.", 400);

    // PALITAN: kunin ang actual na prices mula sa DB
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "php",
        product_data: { name: item.name, description: item.description || "" },
        unit_amount: Math.round(item.price * 100), // centavos
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: { userId: req.user.id },
    });

    // PALITAN: await Transaction.create({...})
    const total = items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
    const transaction = {
      id: Date.now().toString(),
      userId: req.user.id,
      method: "stripe",
      amount: total,
      currency: "PHP",
      status: "pending",
      referenceId: session.id,
      checkoutUrl: session.url,
      createdAt: new Date(),
    };
    transactions.push(transaction);

    return successResponse(res, "Handa na ang Stripe checkout!", {
      transactionId: transaction.id,
      checkoutUrl: session.url, // ← i-redirect dito
      sessionId: session.id,
      amount: total,
    }, 201);
  } catch (err) {
    console.error("[STRIPE ERROR]", err.message);
    return errorResponse(res, "May error sa paglikha ng Stripe checkout.", 500);
  }
});

// -------------------------------------------------------
// GET /api/payments/stripe/status/:sessionId — Tingnan ang status
// -------------------------------------------------------
router.get("/status/:sessionId", verifyToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const status = session.payment_status; // paid, unpaid, no_payment_required

    // PALITAN: await Transaction.findOneAndUpdate({ referenceId: sessionId }, { status })
    const transaction = transactions.find((t) => t.referenceId === req.params.sessionId);
    if (transaction) transaction.status = status;

    return successResponse(res, "Nakuha ang payment status.", {
      status,
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
    });
  } catch (err) {
    console.error("[STRIPE STATUS ERROR]", err.message);
    return errorResponse(res, "May error sa pagkuha ng status.", 500);
  }
});

// -------------------------------------------------------
// POST /api/payments/stripe/refund — Mag-refund
// -------------------------------------------------------
router.post("/refund", verifyToken, authLimiter, async (req, res) => {
  try {
    const { paymentIntentId, reason } = req.body;
    if (!paymentIntentId) return errorResponse(res, "Kailangan ang paymentIntentId.", 400);

    const validReasons = ["duplicate", "fraudulent", "requested_by_customer"];
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: validReasons.includes(reason) ? reason : "requested_by_customer",
    });

    return successResponse(res, "Na-refund ang payment.", {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    });
  } catch (err) {
    console.error("[STRIPE REFUND ERROR]", err.message);
    return errorResponse(res, "May error sa refund.", 500);
  }
});

// -------------------------------------------------------
// POST /api/payments/stripe/webhook — Stripe Webhook
// MAHALAGA: Gamitin ang express.raw() para sa route na ito sa server.js
// app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }), stripeRoutes)
// -------------------------------------------------------
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.warn("[STRIPE WEBHOOK] Invalid signature:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[STRIPE WEBHOOK] Event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        // PALITAN: await Transaction.findOneAndUpdate({ referenceId: session.id }, { status: 'paid' })
        // PALITAN: await Order.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'paid' })
        console.log("[STRIPE] Bayad na! Session:", session.id);
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("[STRIPE] Payment intent succeeded:", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        console.log("[STRIPE] Payment failed.");
        break;

      case "charge.refunded":
        console.log("[STRIPE] Na-refund ang charge.");
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("[STRIPE WEBHOOK ERROR]", err);
    res.status(500).json({ error: "Webhook error" });
  }
});

// -------------------------------------------------------
// GET /api/payments/stripe/history — Lahat ng Stripe payments ng user
// -------------------------------------------------------
router.get("/history", verifyToken, (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status } = req.query;

    // PALITAN: await Transaction.find({ userId: req.user.id, method: 'stripe' }).sort("-createdAt")
    let filtered = transactions.filter((t) => t.userId === req.user.id && t.method === "stripe");
    if (status) filtered = filtered.filter((t) => t.status === status);
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, "Nakuha ang Stripe payment history.", {
      transactions: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page, limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng Stripe history.");
  }
});

// -------------------------------------------------------
// POST /api/payments/stripe/subscriptions — Gumawa ng subscription
// -------------------------------------------------------
router.post("/subscriptions", verifyToken, authLimiter, async (req, res) => {
  try {
    const { priceId, customerEmail } = req.body;
    if (!priceId) return errorResponse(res, "Kailangan ang priceId mula sa Stripe dashboard.", 400);

    // STEP 1: Gumawa o hanapin ang Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail || req.user.email, limit: 1 });
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({ email: customerEmail || req.user.email, metadata: { userId: req.user.id } });
    }

    // STEP 2: Gumawa ng subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: { userId: req.user.id },
    });

    return successResponse(res, "Handa na ang subscription checkout!", {
      checkoutUrl: session.url,
      sessionId: session.id,
      customerId: customer.id,
    }, 201);
  } catch (err) {
    console.error("[STRIPE SUBSCRIPTION ERROR]", err.message);
    return errorResponse(res, "May error sa paggawa ng subscription.", 500);
  }
});

// -------------------------------------------------------
// GET /api/payments/stripe/subscriptions — Lahat ng subscriptions ng user
// -------------------------------------------------------
router.get("/subscriptions", verifyToken, async (req, res) => {
  try {
    const customers = await stripe.customers.list({ email: req.user.email, limit: 1 });
    if (!customers.data[0]) return successResponse(res, "Walang subscriptions.", { subscriptions: [] });

    const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, limit: 10 });

    return successResponse(res, "Nakuha ang mga subscriptions.", {
      subscriptions: subs.data.map((s) => ({
        id: s.id,
        status: s.status,
        currentPeriodEnd: new Date(s.current_period_end * 1000),
        plan: s.items.data[0]?.price?.nickname || "Unknown plan",
        amount: (s.items.data[0]?.price?.unit_amount || 0) / 100,
        currency: s.items.data[0]?.price?.currency?.toUpperCase(),
      })),
    });
  } catch (err) {
    console.error("[STRIPE SUBS ERROR]", err.message);
    return errorResponse(res, "May error sa pagkuha ng subscriptions.", 500);
  }
});

// -------------------------------------------------------
// DELETE /api/payments/stripe/subscriptions/:subscriptionId — I-cancel ang subscription
// -------------------------------------------------------
router.delete("/subscriptions/:subscriptionId", verifyToken, async (req, res) => {
  try {
    const cancelled = await stripe.subscriptions.cancel(req.params.subscriptionId);
    return successResponse(res, "Na-cancel ang subscription.", { id: cancelled.id, status: cancelled.status });
  } catch (err) {
    console.error("[STRIPE CANCEL SUB ERROR]", err.message);
    return errorResponse(res, "May error sa pag-cancel ng subscription.", 500);
  }
});

module.exports = router;
