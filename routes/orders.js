// ============================================================
// ORDERS ROUTES — Para sa E-commerce Orders
// 👉 BASE URL: /api/orders
// 👉 PALITAN ANG "Order" NG IYONG MODEL NAME
// 👉 PALITAN ANG MGA FIELD ng iyong schema
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
let orders = [
  {
    id: "1",
    userId: "1",
    items: [{ productId: "1", name: "Laptop", qty: 1, price: 45000 }],
    total: 45000,
    status: "pending",
    createdAt: new Date(),
  },
];

// -------------------------------------------------------
// GET /api/orders — Lahat ng orders ng naka-login na user
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // Kung admin, makikita lahat; kung user, sarili lang
    // 👉 PALITAN: const orders = req.user.role === 'admin' ? await Order.find() : await Order.find({ userId: req.user.id })
    const filtered =
      req.user.role === "admin"
        ? orders
        : orders.filter((o) => o.userId === req.user.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;

    return paginatedResponse(res, "Nakuha ang mga order.", filtered.slice(start, start + limit), {
      total: filtered.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga order.");
  }
});

// -------------------------------------------------------
// GET /api/orders/:id — Isang order
// -------------------------------------------------------
router.get("/:id", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const order = await Order.findById(req.params.id)
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) return errorResponse(res, "Hindi mahanap ang order.", 404);

    // Hindi pwedeng makita ng ibang user ang order ng iba
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Wala kang access sa order na ito.", 403);
    }

    return successResponse(res, "Nakuha ang order.", order);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng order.");
  }
});

// -------------------------------------------------------
// POST /api/orders — Gumawa ng bagong order
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD NA ITO NG IYONG ORDER STRUCTURE
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, "Kailangan ng hindi empty na items array.", 400);
    }

    // 👉 KALKULAHIN ANG TOTAL (palitan ng actual DB lookup ng prices)
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // 👉 PALITAN: const order = await Order.create({...})
    const newOrder = {
      id: Date.now().toString(),
      userId: req.user.id,
      items,
      total,
      status: "pending", // pending → processing → shipped → delivered
      createdAt: new Date(),
    };
    orders.push(newOrder);

    return successResponse(res, "Nagawa ang order!", newOrder, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng order.");
  }
});

// -------------------------------------------------------
// PATCH /api/orders/:id/status — I-update ang status (Admin only)
// -------------------------------------------------------
router.patch("/:id/status", verifyAdmin, (req, res) => {
  try {
    const { status } = req.body;
    // 👉 PALITAN ANG MGA VALID STATUS NG IYONG PROJECT
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Gamitin ang: ${validStatuses.join(", ")}`, 400);
    }

    // 👉 PALITAN: await Order.findByIdAndUpdate(req.params.id, { status })
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) return errorResponse(res, "Hindi mahanap ang order.", 404);

    order.status = status;
    return successResponse(res, `Na-update ang status ng order sa "${status}".`, order);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng status.");
  }
});

// -------------------------------------------------------
// DELETE /api/orders/:id — Cancel/Bura ng order (Admin only)
// -------------------------------------------------------
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN: await Order.findByIdAndDelete(req.params.id)
    const index = orders.findIndex((o) => o.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang order.", 404);

    orders.splice(index, 1);
    return successResponse(res, "Nabura ang order.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng order.");
  }
});

module.exports = router;
