// ============================================================
// PRODUCTS ROUTES â€” CRUD para sa Products
// ðŸ‘‰ BASE URL: /api/products
// ðŸ‘‰ PALITAN ANG "Product" NG IYONG MODEL NAME
// ðŸ‘‰ PALITAN ANG MGA FIELD (name, price, etc.) NG IYONG MGA FIELD
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// -------------------------------------------------------
// DUMMY DATA â€” ðŸ‘‰ PALITAN NG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
let products = [
  { id: "1", name: "Laptop", price: 45000, category: "electronics", stock: 10 },
  { id: "2", name: "Mouse", price: 800, category: "electronics", stock: 50 },
  { id: "3", name: "Keyboard", price: 1200, category: "electronics", stock: 30 },
];

// -------------------------------------------------------
// GET /api/products â€” Lahat ng products (public, walang login)
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // ðŸ‘‰ PALITAN: const products = await Product.find()
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // ðŸ‘‰ SEARCH by name (optional)
    const search = req.query.search || "";
    const filtered = search
      ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : products;

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return paginatedResponse(res, "Nakuha ang mga produkto.", paginated, {
      total: filtered.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng products.");
  }
});

// -------------------------------------------------------
// GET /api/products/:id â€” Isang product
// -------------------------------------------------------
router.get("/:id", verifyToken, (req, res) => {
  try {
    // ðŸ‘‰ PALITAN: const product = await Product.findById(req.params.id)
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return errorResponse(res, "Hindi mahanap ang produkto.", 404);

    return successResponse(res, "Nakuha ang produkto.", product);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng produkto.");
  }
});

// -------------------------------------------------------
// POST /api/products â€” Gumawa ng bagong product (Admin only)
// -------------------------------------------------------
router.post("/", verifyAdmin, (req, res) => {
  try {
    // ðŸ‘‰ PALITAN ANG MGA FIELD NA ITO NG IYONG MGA FIELD
    const { name, price, category, stock } = req.body;

    if (!name || !price) {
      return errorResponse(res, "Kailangan ang name at price.", 400);
    }

    // ðŸ‘‰ PALITAN: const product = await Product.create({...})
    const newProduct = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      category: category || "uncategorized",
      stock: parseInt(stock) || 0,
      createdAt: new Date(),
    };
    products.push(newProduct);

    return successResponse(res, "Nagawa ang bagong produkto.", newProduct, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng produkto.");
  }
});

// -------------------------------------------------------
// PUT /api/products/:id â€” I-update ang product (Admin only)
// -------------------------------------------------------
router.put("/:id", verifyAdmin, (req, res) => {
  try {
    // ðŸ‘‰ PALITAN: await Product.findByIdAndUpdate(req.params.id, req.body)
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang produkto.", 404);

    products[index] = { ...products[index], ...req.body, id: req.params.id };
    return successResponse(res, "Na-update ang produkto.", products[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng produkto.");
  }
});

// -------------------------------------------------------
// DELETE /api/products/:id â€” Burahin ang product (Admin only)
// -------------------------------------------------------
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    // ðŸ‘‰ PALITAN: await Product.findByIdAndDelete(req.params.id)
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang produkto.", 404);

    products.splice(index, 1);
    return successResponse(res, "Nabura ang produkto.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng produkto.");
  }
});

module.exports = router;

