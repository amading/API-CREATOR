// ============================================================
// GCASH / MAYA (PAYMONGO) API — Para sa Philippine payments
// 👉 BASE URL: /api/payments/ph
// 👉 GAMITIN PARA SA: GCash, Maya (PayMaya), credit/debit cards sa PH
// ============================================================
// PAANO GAMITIN:
//   1. Mag-sign up sa https://dashboard.paymongo.com
//   2. Kumuha ng API keys (public at secret key)
//   3. npm install axios
//   4. I-set sa .env:
//        PAYMONGO_SECRET_KEY=sk_test_...
//        PAYMONGO_PUBLIC_KEY=pk_test_...
//        FRONTEND_URL=http://localhost:5173
//   5. sa server.js:  app.use("/api/payments/ph", require("./templates/PAYMENTS/gcash-paymaya"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// 👉 I-uncomment ito pagkatapos ng "npm install axios"
// const axios = require("axios");
// const PAYMONGO_BASE = "https://api.paymongo.com/v1";
// const authHeader = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");
// const paymongoHeaders = { Authorization: `Basic ${authHeader}`, "Content-Type": "application/json" };

// -------------------------------------------------------
// POST /api/payments/ph/gcash — Gumawa ng GCash payment link
// -------------------------------------------------------
router.post("/gcash", verifyToken, async (req, res) => {
  try {
    // 👉 PALITAN: Kunin ang actual amount mula sa iyong order
    const { amount, orderId, description } = req.body;

    if (!amount || amount < 100) {
      return errorResponse(res, "Minimum na bayad ay PHP 1.00 (100 centavos).", 400);
    }

    // 👉 I-uncomment ang PayMongo code:
    // const response = await axios.post(`${PAYMONGO_BASE}/sources`, {
    //   data: {
    //     attributes: {
    //       amount: Math.round(amount * 100), // Sa centavos
    //       redirect: {
    //         success: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`, // 👉 PALITAN
    //         failed: `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId}`,   // 👉 PALITAN
    //       },
    //       type: "gcash",
    //       currency: "PHP",
    //       description: description || `Order #${orderId}`,
    //     },
    //   },
    // }, { headers: paymongoHeaders });
    //
    // const source = response.data.data;
    // // 👉 I-save ang source.id sa iyong order para sa tracking
    // // await Order.findByIdAndUpdate(orderId, { paymongoSourceId: source.id, paymentMethod: "gcash" })
    //
    // return successResponse(res, "GCash payment link created.", {
    //   checkoutUrl: source.attributes.redirect.checkout_url,
    //   sourceId: source.id,
    // });

    // PLACEHOLDER RESPONSE
    return successResponse(res, "[PLACEHOLDER] GCash payment link.", {
      checkoutUrl: "https://gcash.com/placeholder-checkout",
      sourceId: "src_placeholder",
      amount,
      note: "👉 I-uncomment ang PayMongo code at mag-install ng axios",
    });
  } catch (err) {
    console.error("[GCASH ERROR]", err.response?.data || err);
    return errorResponse(res, "May error sa GCash payment setup.");
  }
});

// -------------------------------------------------------
// POST /api/payments/ph/maya — Gumawa ng Maya (PayMaya) payment link
// -------------------------------------------------------
router.post("/maya", verifyToken, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount || amount < 100) {
      return errorResponse(res, "Minimum na bayad ay PHP 1.00.", 400);
    }

    // 👉 I-uncomment ang PayMongo code (pareho lang ang format, type lang ang nagbabago):
    // const response = await axios.post(`${PAYMONGO_BASE}/sources`, {
    //   data: {
    //     attributes: {
    //       amount: Math.round(amount * 100),
    //       redirect: {
    //         success: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
    //         failed: `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId}`,
    //       },
    //       type: "paymaya",     // 👈 "paymaya" para sa Maya
    //       currency: "PHP",
    //       description: description || `Order #${orderId}`,
    //     },
    //   },
    // }, { headers: paymongoHeaders });

    return successResponse(res, "[PLACEHOLDER] Maya payment link.", {
      checkoutUrl: "https://maya.ph/placeholder-checkout",
      note: "👉 I-uncomment ang PayMongo code",
    });
  } catch (err) {
    return errorResponse(res, "May error sa Maya payment setup.");
  }
});

// -------------------------------------------------------
// POST /api/payments/ph/card — Credit/Debit Card via PayMongo
// -------------------------------------------------------
router.post("/card", verifyToken, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount) return errorResponse(res, "Kailangan ang amount.", 400);

    // 👉 I-uncomment ang PayMongo code:
    // const response = await axios.post(`${PAYMONGO_BASE}/payment_intents`, {
    //   data: {
    //     attributes: {
    //       amount: Math.round(amount * 100),
    //       payment_method_allowed: ["card"],
    //       payment_method_options: { card: { request_three_d_secure: "any" } },
    //       currency: "PHP",
    //       description: description || `Order #${orderId}`,
    //       metadata: { orderId, userId: req.user.id },
    //     },
    //   },
    // }, { headers: paymongoHeaders });
    //
    // return successResponse(res, "Payment intent created.", {
    //   clientKey: response.data.data.attributes.client_key,
    //   paymentIntentId: response.data.data.id,
    // });

    return successResponse(res, "[PLACEHOLDER] Card payment intent.", {
      clientKey: "pi_placeholder_client_key",
      note: "👉 I-uncomment ang PayMongo code",
    });
  } catch (err) {
    return errorResponse(res, "May error sa card payment setup.");
  }
});

// -------------------------------------------------------
// POST /api/payments/ph/webhook — PayMongo webhook receiver
// -------------------------------------------------------
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    // 👉 I-verify ang webhook signature (optional pero recommended)
    // const signature = req.headers["paymongo-signature"]
    // ... verify signature logic ...

    const event = JSON.parse(req.body);
    console.log(`[PAYMONGO WEBHOOK] Type: ${event.data?.attributes?.type}`);

    switch (event.data?.attributes?.type) {
      case "payment.paid":
        // 👉 I-update ang order sa database
        // const paymentData = event.data.attributes.data
        // await Order.findOneAndUpdate({ paymongoPaymentId: paymentData.id }, { status: "paid" })
        console.log("[PAYMONGO] Bayad na!");
        break;

      case "payment.failed":
        // 👉 I-update ang order status bilang failed
        console.log("[PAYMONGO] Nabigo ang bayad.");
        break;

      case "source.chargeable":
        // 👉 Para sa GCash/Maya: Kapag chargeable na, mag-create ng payment
        // const sourceId = event.data.attributes.data.id
        // await axios.post(`${PAYMONGO_BASE}/payments`, {
        //   data: { attributes: { amount: event.data.attributes.data.attributes.amount, source: { id: sourceId, type: "source" }, currency: "PHP" } }
        // }, { headers: paymongoHeaders })
        console.log("[PAYMONGO] Source chargeable na!");
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("[PAYMONGO WEBHOOK ERROR]", err);
    res.status(500).json({ received: false });
  }
});

// -------------------------------------------------------
// GET /api/payments/ph/status/:paymentId — I-check ang payment status
// -------------------------------------------------------
router.get("/status/:paymentId", verifyToken, async (req, res) => {
  try {
    // 👉 I-uncomment ang PayMongo code:
    // const response = await axios.get(`${PAYMONGO_BASE}/payments/${req.params.paymentId}`, { headers: paymongoHeaders })
    // const payment = response.data.data
    // return successResponse(res, "Nakuha ang payment status.", {
    //   status: payment.attributes.status,
    //   amount: payment.attributes.amount / 100,
    //   method: payment.attributes.source?.type,
    // })

    return successResponse(res, "[PLACEHOLDER] Payment status.", {
      status: "paid",
      note: "👉 I-uncomment ang PayMongo code",
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng payment status.");
  }
});

module.exports = router;
