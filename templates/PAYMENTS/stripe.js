// ============================================================
// STRIPE PAYMENT API — Pinaka-popular na payment gateway
// 👉 BASE URL: /api/payments/stripe
// 👉 GAMITIN PARA SA: Credit card, debit card, e-wallet payments
// ============================================================
// PAANO GAMITIN:
//   1. npm install stripe
//   2. Kumuha ng API keys sa https://dashboard.stripe.com
//   3. I-set sa .env:  STRIPE_SECRET_KEY=sk_test_...
//                      STRIPE_WEBHOOK_SECRET=whsec_...
//   4. sa server.js:  app.use("/api/payments/stripe", require("./templates/PAYMENTS/stripe"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// 👉 I-uncomment ito pagkatapos ng "npm install stripe"
// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// -------------------------------------------------------
// POST /api/payments/stripe/create-payment-intent
// — Gumawa ng payment session (para sa frontend integration)
// -------------------------------------------------------
router.post("/create-payment-intent", verifyToken, async (req, res) => {
  try {
    // 👉 PALITAN: Kunin ang actual amount mula sa iyong order
    const { amount, currency, orderId, metadata } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, "Hindi valid ang halaga ng bayad.", 400);
    }

    // 👉 PALITAN NG IYONG CURRENCY (php, usd, sgd, etc.)
    const paymentCurrency = currency || "php";

    // 👉 I-uncomment ang stripe code:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Stripe ay gumagamit ng centavos/cents
    //   currency: paymentCurrency,
    //   metadata: {
    //     userId: req.user.id,
    //     orderId: orderId || "",
    //     ...metadata,
    //   },
    // });
    // return successResponse(res, "Payment intent created.", {
    //   clientSecret: paymentIntent.client_secret,
    //   paymentIntentId: paymentIntent.id,
    // });

    // PLACEHOLDER RESPONSE (burahin ito kapag may tunay na Stripe)
    return successResponse(res, "[PLACEHOLDER] Payment intent created.", {
      clientSecret: "pi_placeholder_secret_key",
      paymentIntentId: "pi_placeholder_id",
      amount,
      currency: paymentCurrency,
      note: "👉 I-uncomment ang Stripe code at tanggalin ang placeholder na ito",
    });
  } catch (err) {
    console.error("[STRIPE ERROR]", err);
    return errorResponse(res, err.message || "May error sa Stripe payment.");
  }
});

// -------------------------------------------------------
// POST /api/payments/stripe/create-checkout-session
// — Redirect user sa Stripe hosted checkout page
// -------------------------------------------------------
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    // 👉 PALITAN: Kunin ang items mula sa iyong cart/order
    const { items, orderId, successUrl, cancelUrl } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, "Walang items para i-checkout.", 400);
    }

    // 👉 I-uncomment ang stripe code:
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   line_items: items.map((item) => ({
    //     price_data: {
    //       currency: "php",                    // 👉 PALITAN NG IYONG CURRENCY
    //       product_data: { name: item.name },
    //       unit_amount: Math.round(item.price * 100),
    //     },
    //     quantity: item.qty,
    //   })),
    //   mode: "payment",
    //   // 👉 PALITAN NG IYONG ACTUAL URLS
    //   success_url: successUrl || `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cart`,
    //   metadata: { userId: req.user.id, orderId: orderId || "" },
    // });
    // return successResponse(res, "Checkout session created.", { url: session.url, sessionId: session.id });

    return successResponse(res, "[PLACEHOLDER] Checkout session.", {
      url: "https://checkout.stripe.com/placeholder",
      note: "👉 I-uncomment ang Stripe code at tanggalin ito",
    });
  } catch (err) {
    return errorResponse(res, err.message || "May error sa Stripe checkout.");
  }
});

// -------------------------------------------------------
// GET /api/payments/stripe/verify/:sessionId
// — I-verify kung bayad na ang isang session
// -------------------------------------------------------
router.get("/verify/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 👉 I-uncomment ang stripe code:
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    // if (session.payment_status === "paid") {
    //   // 👉 I-update ang order status sa database
    //   // await Order.findOneAndUpdate({ stripeSessionId: sessionId }, { status: "paid", paidAt: new Date() })
    //   return successResponse(res, "Bayad na!", { status: "paid", session });
    // }
    // return successResponse(res, "Hindi pa bayad.", { status: session.payment_status });

    return successResponse(res, "[PLACEHOLDER] Payment status.", {
      status: "paid",
      note: "👉 I-uncomment ang Stripe code",
    });
  } catch (err) {
    return errorResponse(res, err.message || "May error sa pag-verify ng payment.");
  }
});

// -------------------------------------------------------
// POST /api/payments/stripe/refund — Mag-refund (Admin only)
// -------------------------------------------------------
router.post("/refund", verifyToken, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return errorResponse(res, "Kailangan ang paymentIntentId.", 400);
    }

    // 👉 PALITAN NG IYONG ADMIN CHECK
    if (req.user.role !== "admin") {
      return errorResponse(res, "Admin lang ang pwedeng mag-refund.", 403);
    }

    // 👉 I-uncomment ang stripe code:
    // const refund = await stripe.refunds.create({
    //   payment_intent: paymentIntentId,
    //   ...(amount && { amount: Math.round(amount * 100) }), // Partial refund (optional)
    //   reason: reason || "requested_by_customer",
    // });
    // return successResponse(res, "Naisagawa ang refund!", { refundId: refund.id, status: refund.status });

    return successResponse(res, "[PLACEHOLDER] Refund processed.", {
      note: "👉 I-uncomment ang Stripe code",
    });
  } catch (err) {
    return errorResponse(res, err.message || "May error sa pag-refund.");
  }
});

module.exports = router;
