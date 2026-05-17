// CART API — BASE URL: /api/cart
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DB — PALITAN NG TUNAY NA DATABASE
let carts = {}; // { userId: [{ productId, name, price, qty, image }] }

const getCart = (userId) => carts[userId] || [];
const saveCart = (userId, items) => { carts[userId] = items; };
const getTotal = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0);

// GET /api/cart — Tingnan ang cart
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId")
    const items = getCart(req.user.id);
    return successResponse(res, "Nakuha ang cart.", {
      items,
      itemCount: items.reduce((sum, i) => sum + i.qty, 0),
      total: getTotal(items),
    });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng cart."); }
});

// POST /api/cart — Magdagdag ng item sa cart
router.post("/", verifyToken, (req, res) => {
  try {
    const { productId, name, price, qty, image } = req.body;
    if (!productId || !name || !price) return errorResponse(res, "Kailangan ang productId, name, at price.", 400);

    // PALITAN: const product = await Product.findById(productId) → verify price
    const items = getCart(req.user.id);
    const existing = items.find((i) => i.productId === productId);

    if (existing) {
      existing.qty += qty || 1;
    } else {
      items.push({ productId, name, price: parseFloat(price), qty: parseInt(qty) || 1, image: image || null });
    }

    // PALITAN: await Cart.findOneAndUpdate({ userId: req.user.id }, { items }, { upsert: true })
    saveCart(req.user.id, items);
    return successResponse(res, "Naidagdag sa cart!", { items, total: getTotal(items) }, 201);
  } catch (err) { return errorResponse(res, "May error sa pagdagdag sa cart."); }
});

// PUT /api/cart/:productId — I-update ang quantity
router.put("/:productId", verifyToken, (req, res) => {
  try {
    const { qty } = req.body;
    if (!qty || qty < 1) return errorResponse(res, "Kailangan ng qty na hindi bababa sa 1.", 400);

    const items = getCart(req.user.id);
    const item = items.find((i) => i.productId === req.params.productId);
    if (!item) return errorResponse(res, "Hindi mahanap ang item sa cart.", 404);

    // PALITAN: await Cart.findOneAndUpdate({ userId, "items.productId": productId }, { $set: { "items.$.qty": qty } })
    item.qty = parseInt(qty);
    saveCart(req.user.id, items);
    return successResponse(res, "Na-update ang quantity.", { items, total: getTotal(items) });
  } catch (err) { return errorResponse(res, "May error sa pag-update ng cart."); }
});

// DELETE /api/cart/:productId — Alisin ang item sa cart
router.delete("/:productId", verifyToken, (req, res) => {
  try {
    let items = getCart(req.user.id);
    const before = items.length;
    items = items.filter((i) => i.productId !== req.params.productId);
    if (items.length === before) return errorResponse(res, "Hindi mahanap ang item sa cart.", 404);

    // PALITAN: await Cart.findOneAndUpdate({ userId }, { $pull: { items: { productId } } })
    saveCart(req.user.id, items);
    return successResponse(res, "Naalis ang item sa cart.", { items, total: getTotal(items) });
  } catch (err) { return errorResponse(res, "May error sa pag-alis ng item sa cart."); }
});

// DELETE /api/cart — Burahin ang buong cart
router.delete("/", verifyToken, (req, res) => {
  try {
    // PALITAN: await Cart.findOneAndDelete({ userId: req.user.id })
    saveCart(req.user.id, []);
    return successResponse(res, "Na-clear ang cart.");
  } catch (err) { return errorResponse(res, "May error sa pag-clear ng cart."); }
});

module.exports = router;
