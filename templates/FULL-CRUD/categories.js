// ============================================================
// CATEGORIES API — Full CRUD + Nested Categories
// 👉 BASE URL: /api/categories
// 👉 GAMITIN PARA SA: Product categories, blog categories, menu items
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/categories", require("./templates/FULL-CRUD/categories"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../../middleware/auth");
const { successResponse, errorResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
let categories = [
  { id: "1", name: "Electronics", slug: "electronics", parentId: null, isActive: true, order: 1 },
  { id: "2", name: "Laptops", slug: "laptops", parentId: "1", isActive: true, order: 1 },
  { id: "3", name: "Phones", slug: "phones", parentId: "1", isActive: true, order: 2 },
  { id: "4", name: "Fashion", slug: "fashion", parentId: null, isActive: true, order: 2 },
];

// Helper: Gumawa ng slug mula sa pangalan
const toSlug = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// -------------------------------------------------------
// GET /api/categories — Lahat ng categories (public)
// -------------------------------------------------------
router.get("/", (req, res) => {
  try {
    // 👉 PALITAN: const categories = await Category.find({ isActive: true })
    const parentOnly = req.query.parentOnly === "true";

    let result = categories.filter((c) => c.isActive);
    if (parentOnly) result = result.filter((c) => !c.parentId);

    // I-attach ang mga subcategories sa bawat parent
    const withChildren = result
      .filter((c) => !c.parentId)
      .map((parent) => ({
        ...parent,
        children: categories.filter((c) => c.parentId === parent.id && c.isActive),
      }));

    return successResponse(res, "Nakuha ang mga kategorya.", withChildren);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga kategorya.");
  }
});

// -------------------------------------------------------
// GET /api/categories/:id — Isang category at ang mga anak nito
// -------------------------------------------------------
router.get("/:id", (req, res) => {
  try {
    // 👉 PALITAN: const cat = await Category.findById(req.params.id)
    const cat = categories.find((c) => c.id === req.params.id);
    if (!cat) return errorResponse(res, "Hindi mahanap ang kategorya.", 404);

    const children = categories.filter((c) => c.parentId === cat.id);
    return successResponse(res, "Nakuha ang kategorya.", { ...cat, children });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng kategorya.");
  }
});

// -------------------------------------------------------
// POST /api/categories — Gumawa ng bagong category (Admin)
// -------------------------------------------------------
router.post("/", verifyAdmin, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG CATEGORY STRUCTURE
    const { name, parentId, order } = req.body;

    if (!name) return errorResponse(res, "Kailangan ang pangalan ng kategorya.", 400);

    // 👉 Check kung may existing na same name
    const exists = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return errorResponse(res, "Mayroon nang kategoryang may parehong pangalan.", 409);

    // Kung may parentId, i-validate
    if (parentId) {
      const parent = categories.find((c) => c.id === parentId);
      if (!parent) return errorResponse(res, "Hindi mahanap ang parent category.", 404);
    }

    // 👉 PALITAN: const cat = await Category.create({...})
    const newCat = {
      id: Date.now().toString(),
      name,
      slug: toSlug(name),
      parentId: parentId || null,
      isActive: true,
      order: order || categories.length + 1,
      createdAt: new Date(),
    };
    categories.push(newCat);

    return successResponse(res, "Nagawa ang bagong kategorya.", newCat, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng kategorya.");
  }
});

// -------------------------------------------------------
// PUT /api/categories/:id — I-update ang category (Admin)
// -------------------------------------------------------
router.put("/:id", verifyAdmin, (req, res) => {
  try {
    const index = categories.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang kategorya.", 404);

    const { name, parentId, isActive, order } = req.body;

    // Huwag payagan ang isang category na maging anak ng sarili nito
    if (parentId === req.params.id) {
      return errorResponse(res, "Hindi pwedeng maging parent ng sarili ang isang kategorya.", 400);
    }

    const updated = {
      ...categories[index],
      ...(name && { name, slug: toSlug(name) }),
      ...(parentId !== undefined && { parentId: parentId || null }),
      ...(isActive !== undefined && { isActive }),
      ...(order && { order }),
      updatedAt: new Date(),
    };
    categories[index] = updated;

    return successResponse(res, "Na-update ang kategorya.", updated);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng kategorya.");
  }
});

// -------------------------------------------------------
// DELETE /api/categories/:id — Burahin ang category (Admin)
// -------------------------------------------------------
router.delete("/:id", verifyAdmin, (req, res) => {
  try {
    const index = categories.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang kategorya.", 404);

    // I-check kung may mga subcategories pa
    const hasChildren = categories.some((c) => c.parentId === req.params.id);
    if (hasChildren) {
      return errorResponse(
        res,
        "May mga sub-kategorya pa ang kategoryang ito. Burahin muna ang mga ito.",
        400
      );
    }

    // 👉 PALITAN: await Category.findByIdAndDelete(req.params.id)
    categories.splice(index, 1);
    return successResponse(res, "Nabura ang kategorya.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng kategorya.");
  }
});

module.exports = router;
