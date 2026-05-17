// ============================================================
// WEBHOOK RECEIVER API — POST Only
// 👉 BASE URL: /api/webhooks
// 👉 GAMITIN PARA SA: Pagtanggap ng events mula sa ibang services
//    (Stripe payments, GitHub events, Facebook messenger, etc.)
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/webhooks", require("./templates/POST-only/webhook"))
// MAHALAGA: I-whitelist ang IP ng nagpadala sa iyong server kung posible
// ============================================================

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// WEBHOOK SIGNATURE VERIFIER — Para mapatunayan na legit ang sender
// -------------------------------------------------------
const verifyStripeSignature = (req, res, next) => {
  // 👉 PALITAN NG IYONG STRIPE WEBHOOK SECRET (mula sa Stripe dashboard)
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_palitan-mo-ito";
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return errorResponse(res, "Walang Stripe signature.", 400);
  }

  // Stripe nagre-require ng raw body para sa signature verification
  // 👉 SIGURADUHING may express.raw() ang route na ito sa server.js:
  // app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeRoutes)
  try {
    // const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
    // const event = stripe.webhooks.constructEvent(req.body, signature, stripeSecret)
    // req.stripeEvent = event
    next();
  } catch (err) {
    console.error("[WEBHOOK] Invalid Stripe signature:", err.message);
    return errorResponse(res, "Invalid webhook signature.", 400);
  }
};

// -------------------------------------------------------
// Simpleng signature verifier para sa custom webhooks
// -------------------------------------------------------
const verifyCustomSignature = (req, res, next) => {
  // 👉 PALITAN NG IYONG WEBHOOK SECRET
  const secret = process.env.WEBHOOK_SECRET || "iyong-webhook-secret";
  const signature = req.headers["x-webhook-signature"];
  const payload = JSON.stringify(req.body);

  const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (signature !== expectedSig) {
    console.warn("[WEBHOOK] Invalid signature attempt");
    return errorResponse(res, "Invalid webhook signature.", 401);
  }
  next();
};

// -------------------------------------------------------
// POST /api/webhooks/stripe — Tumatanggap ng Stripe events
// -------------------------------------------------------
router.post("/stripe", verifyStripeSignature, (req, res) => {
  try {
    // 👉 Ang event ay nasa req.stripeEvent kapag gumamit ng totoong Stripe library
    const event = req.body; // Placeholder lang ito

    console.log(`[STRIPE WEBHOOK] Event: ${event.type}`);

    // 👉 PALITAN NG MGA EVENTS NA KAILANGAN MO
    switch (event.type) {
      case "payment_intent.succeeded":
        // const paymentIntent = event.data.object;
        // 👉 I-update ang order status sa DB: await Order.findOneAndUpdate({ stripeId: paymentIntent.id }, { status: "paid" })
        console.log("[STRIPE] Bayad na!");
        break;

      case "payment_intent.payment_failed":
        // 👉 I-update ang order status sa DB
        console.log("[STRIPE] Nabigo ang bayad.");
        break;

      case "customer.subscription.created":
        // 👉 I-handle ang bagong subscription
        console.log("[STRIPE] Bagong subscription!");
        break;

      case "customer.subscription.deleted":
        // 👉 I-cancel ang subscription ng user
        console.log("[STRIPE] Na-cancel ang subscription.");
        break;

      default:
        console.log(`[STRIPE] Hindi handled na event: ${event.type}`);
    }

    // Kailangan mag-respond ng 200 agad para hindi mag-retry ang Stripe
    res.json({ received: true });
  } catch (err) {
    console.error("[STRIPE WEBHOOK ERROR]", err);
    return errorResponse(res, "Webhook processing error.", 500);
  }
});

// -------------------------------------------------------
// POST /api/webhooks/custom — Para sa custom webhooks
// -------------------------------------------------------
router.post("/custom", verifyCustomSignature, (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`[CUSTOM WEBHOOK] Event: ${event}`);

    // 👉 PALITAN NG IYONG MGA EVENTS AT LOGIC
    switch (event) {
      case "user.created":
        // 👉 Gawin ang kailangan kapag may bagong user
        break;
      case "order.shipped":
        // 👉 Mag-send ng notification sa user
        break;
      default:
        console.log(`[WEBHOOK] Unknown event: ${event}`);
    }

    res.json({ received: true });
  } catch (err) {
    return errorResponse(res, "Webhook processing error.", 500);
  }
});

// -------------------------------------------------------
// POST /api/webhooks/github — Para sa GitHub events
// -------------------------------------------------------
router.post("/github", (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`[GITHUB WEBHOOK] Event: ${event}`);

    // 👉 PALITAN NG MGA GITHUB EVENTS NA KAILANGAN MO
    switch (event) {
      case "push":
        // 👉 May bagong push sa repository
        const branch = payload.ref?.replace("refs/heads/", "");
        console.log(`[GITHUB] Push sa branch: ${branch}`);
        // 👉 Pwede kang mag-trigger ng deployment dito
        break;
      case "pull_request":
        console.log(`[GITHUB] PR: ${payload.action}`);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    return errorResponse(res, "GitHub webhook error.", 500);
  }
});

module.exports = router;
