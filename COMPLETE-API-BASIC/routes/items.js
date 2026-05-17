// ============================================================
// ITEMS API — Simple GET, POST, PUT, DELETE
// BASE URL: /api/items
//
// PAANO GAMITIN:
// 1. I-rename ang "items" sa pangalan ng gusto mo (products, users, posts, etc.)
// 2. I-edit ang mga fields sa DUMMY DATA
// 3. Palitan ang mga comment na "PALITAN" ng DB query mo
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// -------------------------------------------------------
// DUMMY DATA — PALITAN NG IYONG TUNAY NA DATABASE
// -------------------------------------------------------
let items = [
  { id: "1", name: "Item One",   description: "Ito ang unang item",   status: "active", createdAt: new Date() },
  { id: "2", name: "Item Two",   description: "Ito ang pangalawang item", status: "active", createdAt: new Date() },
  { id: "3", name: "Item Three", description: "Ito ang ikatlong item",    status: "inactive", createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/items — Lahat ng items
// Sinusuportahan ang: ?search=xxx &status=active &page=1 &limit=10
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    // PALITAN: const items = await Item.find(filters).skip(...).limit(...)
    let filtered = [...items];

    if (search) {
      filtered = filtered.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }

    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return paginatedResponse(res, "Nakuha ang mga items.", paginated, {
      total: filtered.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng items.");
  }
});

// -------------------------------------------------------
// GET /api/items/:id — Isang item
// -------------------------------------------------------
router.get("/:id", verifyToken, (req, res) => {
  try {
    // PALITAN: const item = await Item.findById(req.params.id)
    const item = items.find((i) => i.id === req.params.id);
    if (!item) return errorResponse(res, "Hindi mahanap ang item.", 404);

    return successResponse(res, "Nakuha ang item.", item);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng item.");
  }
});

// -------------------------------------------------------
// POST /api/items — Gumawa ng bagong item
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validation
    if (!name) return errorResponse(res, "Kailangan ang 'name'.", 400);

    // PALITAN: const item = await Item.create({ name, description, status, createdBy: req.user.id })
    const newItem = {
      id: Date.now().toString(),
      name,
      description: description || "",
      status: status || "active",
      createdBy: req.user.id,
      createdAt: new Date(),
    };
    items.push(newItem);

    return successResponse(res, "Nagawa ang bagong item.", newItem, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng item.");
  }
});

// -------------------------------------------------------
// PUT /api/items/:id — I-update ang item (full update)
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    const index = items.findIndex((i) => i.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang item.", 404);

    const { name, description, status } = req.body;
    if (!name) return errorResponse(res, "Kailangan ang 'name'.", 400);

    // PALITAN: const item = await Item.findByIdAndUpdate(req.params.id, { name, description, status }, { new: true })
    items[index] = {
      ...items[index],
      name,
      description: description ?? items[index].description,
      status: status ?? items[index].status,
      updatedAt: new Date(),
    };

    return successResponse(res, "Na-update ang item.", items[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng item.");
  }
});

// -------------------------------------------------------
// PATCH /api/items/:id — Partial update (ilang fields lang)
// -------------------------------------------------------
router.patch("/:id", verifyToken, (req, res) => {
  try {
    const index = items.findIndex((i) => i.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang item.", 404);

    // PALITAN: const item = await Item.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    items[index] = {
      ...items[index],
      ...req.body,           // I-apply lang ang mga fields na isinend
      id: items[index].id,   // Hindi pwedeng palitan ang id
      updatedAt: new Date(),
    };

    return successResponse(res, "Na-update ang item.", items[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-update ng item.");
  }
});

// -------------------------------------------------------
// DELETE /api/items/:id — Burahin ang item
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = items.findIndex((i) => i.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang item.", 404);

    // PALITAN: await Item.findByIdAndDelete(req.params.id)
    items.splice(index, 1);

    return successResponse(res, "Nabura ang item.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng item.");
  }
});

module.exports = router;
