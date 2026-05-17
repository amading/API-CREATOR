// ============================================================
// ANALYTICS API — GET Only, Dashboard stats at reports
// 👉 BASE URL: /api/analytics
// 👉 GAMITIN PARA SA: Admin dashboard, reports, charts
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/analytics", require("./templates/GET-only/analytics"))
//   TANDAAN: I-protect ito ng verifyAdmin middleware!
//   app.use("/api/analytics", verifyAdmin, require("./templates/GET-only/analytics"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// GET /api/analytics/overview — General na stats ng buong system
// -------------------------------------------------------
router.get("/overview", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN NG ACTUAL DATABASE AGGREGATION QUERIES
    // Para sa MongoDB:
    // const totalUsers = await User.countDocuments()
    // const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }}}])

    return successResponse(res, "Nakuha ang overview.", {
      totalUsers: 1250,           // 👉 PALITAN
      newUsersToday: 15,          // 👉 PALITAN
      totalOrders: 5800,          // 👉 PALITAN
      ordersToday: 42,            // 👉 PALITAN
      totalRevenue: 2850000,      // 👉 PALITAN (sa piso)
      revenueToday: 85000,        // 👉 PALITAN
      totalProducts: 340,         // 👉 PALITAN
      lowStockProducts: 12,       // 👉 PALITAN (stock < threshold)
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng overview.");
  }
});

// -------------------------------------------------------
// GET /api/analytics/sales?period=7d — Sales data para sa charts
// 👉 period: 7d (7 days), 30d (30 days), 12m (12 months)
// -------------------------------------------------------
router.get("/sales", verifyAdmin, (req, res) => {
  try {
    const period = req.query.period || "7d"; // 👉 Default 7 days

    // 👉 PALITAN NG ACTUAL DB AGGREGATION AYON SA PERIOD
    // Para sa MongoDB (daily sales ng nakaraang 7 araw):
    // const sales = await Order.aggregate([
    //   { $match: { createdAt: { $gte: startDate } } },
    //   { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }}, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    //   { $sort: { "_id": 1 } }
    // ])

    // Dummy data — palitan ng real aggregation
    const salesData = {
      "7d": [
        { date: "2024-01-01", revenue: 15000, orders: 5 },
        { date: "2024-01-02", revenue: 28000, orders: 9 },
        { date: "2024-01-03", revenue: 12000, orders: 4 },
        { date: "2024-01-04", revenue: 45000, orders: 15 },
        { date: "2024-01-05", revenue: 33000, orders: 11 },
        { date: "2024-01-06", revenue: 21000, orders: 7 },
        { date: "2024-01-07", revenue: 38000, orders: 13 },
      ],
    };

    return successResponse(res, `Sales data para sa ${period}.`, salesData[period] || []);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng sales data.");
  }
});

// -------------------------------------------------------
// GET /api/analytics/top-products?limit=5 — Pinaka-nabentang products
// -------------------------------------------------------
router.get("/top-products", verifyAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // 👉 Baguhin ang default limit

    // 👉 PALITAN NG ACTUAL DB QUERY
    // const topProducts = await Order.aggregate([
    //   { $unwind: "$items" },
    //   { $group: { _id: "$items.productId", totalSold: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] }} } },
    //   { $sort: { totalSold: -1 } },
    //   { $limit: limit }
    // ])

    const topProducts = [
      { productId: "1", name: "Laptop", totalSold: 120, revenue: 5400000 },
      { productId: "2", name: "Mouse", totalSold: 340, revenue: 272000 },
      { productId: "3", name: "Keyboard", totalSold: 210, revenue: 252000 },
    ].slice(0, limit);

    return successResponse(res, `Top ${limit} products.`, topProducts);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng top products.");
  }
});

// -------------------------------------------------------
// GET /api/analytics/users — User growth at activity
// -------------------------------------------------------
router.get("/users", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN NG ACTUAL DB QUERIES
    return successResponse(res, "Nakuha ang user analytics.", {
      totalUsers: 1250,
      activeThisMonth: 780,
      newThisMonth: 95,
      // 👉 Breakdown by role
      byRole: { user: 1200, admin: 50 },
      // 👉 Growth per month
      monthlyGrowth: [
        { month: "Ene", newUsers: 80 },
        { month: "Peb", newUsers: 95 },
        { month: "Mar", newUsers: 110 },
      ],
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng user analytics.");
  }
});

module.exports = router;
