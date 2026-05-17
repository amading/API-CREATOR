// ============================================================
// INVENTORY MANAGEMENT API — Full CRUD
// 👉 BASE URL: /api/inventory
// 👉 GAMITIN PARA SA: Stock management, warehouse tracking
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/inventory", require("./templates/FULL-CRUD/inventory"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
let inventory = [
  { id: "1", productId: "prod-1", productName: "Laptop", sku: "LAP-001", qty: 50, lowStockThreshold: 10, location: "Bodega A", lastUpdated: new Date() },
  { id: "2", productId: "prod-2", productName: "Mouse", sku: "MOU-001", qty: 3, lowStockThreshold: 10, location: "Bodega A", lastUpdated: new Date() },
  { id: "3", productId: "prod-3", productName: "Keyboard", sku: "KEY-001", qty: 0, lowStockThreshold: 5, location: "Bodega B", lastUpdated: new Date() },
];

// Kasaysayan ng stock changes
let stockHistory = [];

// -------------------------------------------------------
// GET /api/inventory — Lahat ng inventory items
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Filter by status
    const status = req.query.status; // "low", "out", "ok"
    let filtered = [...inventory];

    if (status === "low") {
      filtered = filtered.filter((i) => i.qty > 0 && i.qty <= i.lowStockThreshold);
    } else if (status === "out") {
      filtered = filtered.filter((i) => i.qty === 0);
    } else if (status === "ok") {
      filtered = filtered.filter((i) => i.qty > i.lowStockThreshold);
    }

    // I-add ang status sa bawat item
    const withStatus = filtered.map((item) => ({
      ...item,
      stockStatus:
        item.qty === 0 ? "out_of_stock" : item.qty <= item.lowStockThreshold ? "low_stock" : "in_stock",
    }));

    const start = (page - 1) * limit;
    return paginatedResponse(res, "Nakuha ang inventory.", withStatus.slice(start, start + limit), {
      total: filtered.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng inventory.");
  }
});

// -------------------------------------------------------
// GET /api/inventory/low-stock — Mga items na mababa na ang stock
// -------------------------------------------------------
router.get("/low-stock", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Inventory.find({ $expr: { $lte: ["$qty", "$lowStockThreshold"] }, qty: { $gt: 0 } })
    const lowStock = inventory.filter((i) => i.qty > 0 && i.qty <= i.lowStockThreshold);
    return successResponse(res, `${lowStock.length} items ang mababa na ang stock.`, lowStock);
  } catch (err) {
    return errorResponse(res, "May error.");
  }
});

// -------------------------------------------------------
// GET /api/inventory/out-of-stock — Mga wala nang stock
// -------------------------------------------------------
router.get("/out-of-stock", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Inventory.find({ qty: 0 })
    const outOfStock = inventory.filter((i) => i.qty === 0);
    return successResponse(res, `${outOfStock.length} items ang wala nang stock.`, outOfStock);
  } catch (err) {
    return errorResponse(res, "May error.");
  }
});

// -------------------------------------------------------
// GET /api/inventory/:id/history — Kasaysayan ng stock changes
// -------------------------------------------------------
router.get("/:id/history", verifyToken, (req, res) => {
  try {
    const history = stockHistory.filter((h) => h.inventoryId === req.params.id);
    return successResponse(res, "Nakuha ang kasaysayan ng stock.", history);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng stock history.");
  }
});

// -------------------------------------------------------
// POST /api/inventory — Gumawa ng bagong inventory record (Admin)
// -------------------------------------------------------
router.post("/", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG INVENTORY STRUCTURE
    const { productId, productName, sku, qty, lowStockThreshold, location } = req.body;

    if (!productId || !productName || !sku) {
      return errorResponse(res, "Kailangan ang productId, productName, at SKU.", 400);
    }

    // Check kung duplicate ang SKU
    // 👉 PALITAN: const exists = await Inventory.findOne({ sku })
    const exists = inventory.find((i) => i.sku === sku);
    if (exists) return errorResponse(res, "Mayroon nang inventory record na may parehong SKU.", 409);

    const newItem = {
      id: Date.now().toString(),
      productId,
      productName,
      sku,
      qty: parseInt(qty) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 10, // 👉 PALITAN NG IYONG DEFAULT
      location: location || "Main Warehouse",               // 👉 PALITAN
      lastUpdated: new Date(),
    };
    inventory.push(newItem);

    return successResponse(res, "Nagawa ang bagong inventory record.", newItem, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng inventory record.");
  }
});

// -------------------------------------------------------
// PATCH /api/inventory/:id/adjust — I-adjust ang stock quantity
// -------------------------------------------------------
router.patch("/:id/adjust", verifyAdmin, (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    // 👉 adjustment = positive (dagdag) o negative (bawas) na numero
    // Halimbawa: +10 (natanggap na bagong stock), -5 (nabenta)

    if (adjustment === undefined || isNaN(parseInt(adjustment))) {
      return errorResponse(res, "Kailangan ang adjustment na numero (positibo o negatibo).", 400);
    }

    const index = inventory.findIndex((i) => i.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang inventory item.", 404);

    const oldQty = inventory[index].qty;
    const newQty = oldQty + parseInt(adjustment);

    if (newQty < 0) {
      return errorResponse(res, `Hindi pwede. Kulang pa ang stock. Kasalukuyang qty: ${oldQty}`, 400);
    }

    // 👉 PALITAN: await Inventory.findByIdAndUpdate(id, { qty: newQty })
    inventory[index].qty = newQty;
    inventory[index].lastUpdated = new Date();

    // I-record ang history
    // 👉 PALITAN: await StockHistory.create({...})
    stockHistory.push({
      id: Date.now().toString(),
      inventoryId: req.params.id,
      adjustment: parseInt(adjustment),
      oldQty,
      newQty,
      reason: reason || "Manual adjustment",
      adjustedBy: req.user.id,
      adjustedAt: new Date(),
    });

    return successResponse(res, `Stock na-adjust mula ${oldQty} hanggang ${newQty}.`, inventory[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-adjust ng stock.");
  }
});

// -------------------------------------------------------
// DELETE /api/inventory/:id — Burahin ang inventory record (Admin)
// -------------------------------------------------------
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = inventory.findIndex((i) => i.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang inventory record.", 404);

    inventory.splice(index, 1);
    return successResponse(res, "Nabura ang inventory record.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng inventory record.");
  }
});

module.exports = router;
