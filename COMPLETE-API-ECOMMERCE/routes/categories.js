// CATEGORIES API â€” BASE URL: /api/categories
const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

let categories = [
  { id: "1", name: "Electronics", slug: "electronics", icon: "ðŸ’»", productCount: 12 },
  { id: "2", name: "Fashion", slug: "fashion", icon: "ðŸ‘—", productCount: 8 },
  { id: "3", name: "Food", slug: "food", icon: "ðŸ”", productCount: 20 },
];

// GET /api/categories â€” Lahat ng categories (public)
router.get("/", verifyToken, (req, res) => {
  try {
    // PALITAN: const cats = await Category.find().sort("name")
    return successResponse(res, "Nakuha ang mga kategorya.", categories);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng kategorya."); }
});

// GET /api/categories/:slug â€” Isang category (public)
router.get("/:slug", verifyToken, (req, res) => {
  try {
    const cat = categories.find((c) => c.slug === req.params.slug || c.id === req.params.slug);
    if (!cat) return errorResponse(res, "Hindi mahanap ang kategorya.", 404);
    return successResponse(res, "Nakuha ang kategorya.", cat);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng kategorya."); }
});

// POST /api/categories â€” Gumawa ng category (Admin only)
router.post("/", verifyAdmin, (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return errorResponse(res, "Kailangan ang name.", 400);
    // PALITAN: const cat = await Category.create({ name, slug, icon })
    const newCat = { id: Date.now().toString(), name, slug: name.toLowerCase().replace(/\s+/g, "-"), icon: icon || "ðŸ“¦", productCount: 0 };
    categories.push(newCat);
    return successResponse(res, "Nagawa ang kategorya.", newCat, 201);
  } catch (err) { return errorResponse(res, "May error sa paggawa ng kategorya."); }
});

// PUT /api/categories/:id â€” I-edit (Admin only)
router.put("/:id", verifyAdmin, (req, res) => {
  try {
    const index = categories.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang kategorya.", 404);
    // PALITAN: await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    categories[index] = { ...categories[index], ...req.body, id: req.params.id };
    return successResponse(res, "Na-update ang kategorya.", categories[index]);
  } catch (err) { return errorResponse(res, "May error sa pag-update ng kategorya."); }
});

// DELETE /api/categories/:id â€” Burahin (Admin only)
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = categories.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang kategorya.", 404);
    // PALITAN: await Category.findByIdAndDelete(req.params.id)
    categories.splice(index, 1);
    return successResponse(res, "Nabura ang kategorya.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng kategorya."); }
});

module.exports = router;

