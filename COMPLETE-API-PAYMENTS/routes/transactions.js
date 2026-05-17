// ============================================================
// TRANSACTIONS API — History ng lahat ng payments
// BASE URL: /api/payments/transactions
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// DUMMY DB — PALITAN NG TUNAY NA DATABASE
// Sa production: isang Transaction table/collection para sa lahat ng payment methods
let transactions = [
  { id: "1", userId: "1", method: "gcash", amount: 500, currency: "PHP", status: "paid", referenceId: "link_xxx", createdAt: new Date() },
  { id: "2", userId: "1", method: "stripe", amount: 1200, currency: "PHP", status: "pending", referenceId: "cs_xxx", createdAt: new Date() },
  { id: "3", userId: "2", method: "paypal", amount: 300, currency: "USD", status: "paid", referenceId: "ORDER_xxx", createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/payments/transactions — Sariling transaction history
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, method } = req.query;

    // PALITAN: const txns = await Transaction.find({ userId: req.user.id }).sort("-createdAt")
    let filtered = req.user.role === "admin"
      ? transactions
      : transactions.filter((t) => t.userId === req.user.id);

    if (status) filtered = filtered.filter((t) => t.status === status);
    if (method) filtered = filtered.filter((t) => t.method === method);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.reduce((sum, t) => t.status === "paid" ? sum + t.amount : sum, 0);

    return paginatedResponse(res, "Nakuha ang mga transaksyon.", filtered.slice((page - 1) * limit, page * limit), {
      total: filtered.length, page, limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga transaksyon.");
  }
});

// -------------------------------------------------------
// GET /api/payments/transactions/:id — Isang transaction
// -------------------------------------------------------
router.get("/:id", verifyToken, (req, res) => {
  try {
    // PALITAN: const txn = await Transaction.findById(req.params.id)
    const txn = transactions.find((t) => t.id === req.params.id);
    if (!txn) return errorResponse(res, "Hindi mahanap ang transaksyon.", 404);

    if (txn.userId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Wala kang access sa transaksyon na ito.", 403);

    return successResponse(res, "Nakuha ang transaksyon.", txn);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng transaksyon.");
  }
});

// -------------------------------------------------------
// GET /api/payments/transactions/summary/me — Summary ng sariling payments
// -------------------------------------------------------
router.get("/summary/me", verifyToken, (req, res) => {
  try {
    // PALITAN: await Transaction.aggregate([...])
    const userTxns = transactions.filter((t) => t.userId === req.user.id);
    const paid = userTxns.filter((t) => t.status === "paid");
    const pending = userTxns.filter((t) => t.status === "pending");
    const failed = userTxns.filter((t) => t.status === "failed");

    const summary = {
      total: userTxns.length,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      totalAmountPaid: paid.reduce((sum, t) => sum + t.amount, 0),
      byMethod: {
        gcash: paid.filter((t) => t.method === "gcash").reduce((s, t) => s + t.amount, 0),
        maya: paid.filter((t) => t.method === "maya").reduce((s, t) => s + t.amount, 0),
        stripe: paid.filter((t) => t.method === "stripe").reduce((s, t) => s + t.amount, 0),
        paypal: paid.filter((t) => t.method === "paypal").reduce((s, t) => s + t.amount, 0),
      },
    };

    return successResponse(res, "Nakuha ang payment summary.", summary);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng summary.");
  }
});

// -------------------------------------------------------
// GET /api/payments/transactions/admin/all — Lahat ng transactions (Admin only)
// -------------------------------------------------------
router.get("/admin/all", verifyAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, method, userId } = req.query;

    // PALITAN: const txns = await Transaction.find(filters).populate("userId", "name email")
    let filtered = [...transactions];
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (method) filtered = filtered.filter((t) => t.method === method);
    if (userId) filtered = filtered.filter((t) => t.userId === userId);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalRevenue = filtered.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);

    return paginatedResponse(res, `Nakuha ang lahat ng transaksyon. Total revenue: ₱${totalRevenue}`, filtered.slice((page - 1) * limit, page * limit), {
      total: filtered.length, page, limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng lahat ng transaksyon.");
  }
});

// -------------------------------------------------------
// PATCH /api/payments/transactions/:id/status — I-update ang status (Admin only)
// -------------------------------------------------------
router.patch("/:id/status", verifyAdmin, (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["pending", "paid", "failed", "refunded", "cancelled"];

    if (!validStatuses.includes(status))
      return errorResponse(res, `Hindi valid ang status. Gamitin ang: ${validStatuses.join(", ")}`, 400);

    const index = transactions.findIndex((t) => t.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang transaksyon.", 404);

    // PALITAN: await Transaction.findByIdAndUpdate(req.params.id, { status, note }, { new: true })
    transactions[index].status = status;
    transactions[index].note = note || transactions[index].note;
    transactions[index].updatedAt = new Date();

    return successResponse(res, `Na-update ang status ng transaksyon sa "${status}".`, transactions[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng transaksyon.");
  }
});

// -------------------------------------------------------
// DELETE /api/payments/transactions/:id — Cancel/Bura ng transaction (Admin only)
// -------------------------------------------------------
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = transactions.findIndex((t) => t.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang transaksyon.", 404);

    if (transactions[index].status === "paid")
      return errorResponse(res, "Hindi pwedeng burahin ang isang 'paid' na transaksyon. Mag-refund na lang.", 400);

    // PALITAN: await Transaction.findByIdAndDelete(req.params.id)
    transactions.splice(index, 1);
    return successResponse(res, "Nabura ang transaksyon.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng transaksyon.");
  }
});

// -------------------------------------------------------
// GET /api/payments/transactions/admin/revenue — Revenue report (Admin only)
// -------------------------------------------------------
router.get("/admin/revenue", verifyAdmin, (req, res) => {
  try {
    const { from, to } = req.query;
    // PALITAN: await Transaction.aggregate para sa real date filtering
    let filtered = transactions.filter((t) => t.status === "paid");
    if (from) filtered = filtered.filter((t) => new Date(t.createdAt) >= new Date(from));
    if (to)   filtered = filtered.filter((t) => new Date(t.createdAt) <= new Date(to));

    const revenue = {
      totalRevenue: filtered.reduce((s, t) => s + t.amount, 0),
      totalTransactions: filtered.length,
      byMethod: {
        gcash:  filtered.filter((t) => t.method === "gcash").reduce((s, t) => s + t.amount, 0),
        maya:   filtered.filter((t) => t.method === "maya").reduce((s, t) => s + t.amount, 0),
        stripe: filtered.filter((t) => t.method === "stripe").reduce((s, t) => s + t.amount, 0),
        paypal: filtered.filter((t) => t.method === "paypal").reduce((s, t) => s + t.amount, 0),
      },
      byStatus: {
        paid:      transactions.filter((t) => t.status === "paid").length,
        pending:   transactions.filter((t) => t.status === "pending").length,
        failed:    transactions.filter((t) => t.status === "failed").length,
        refunded:  transactions.filter((t) => t.status === "refunded").length,
        cancelled: transactions.filter((t) => t.status === "cancelled").length,
      },
    };

    return successResponse(res, "Nakuha ang revenue report.", revenue);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng revenue report.");
  }
});

module.exports = router;
