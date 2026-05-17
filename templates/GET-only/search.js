// ============================================================
// SEARCH API — GET Only, May search + filter + sort + paginate
// 👉 BASE URL: /api/search
// 👉 GAMITIN PARA SA: Search bar ng website/app mo
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/search", require("./templates/GET-only/search"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG IYONG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
const items = [
  { id: "1", title: "Laptop Asus", category: "electronics", price: 45000, rating: 4.5, tags: ["laptop", "computer"] },
  { id: "2", title: "iPhone 15", category: "phones", price: 70000, rating: 4.8, tags: ["phone", "apple"] },
  { id: "3", title: "Nike Shoes", category: "fashion", price: 5000, rating: 4.2, tags: ["shoes", "sports"] },
  { id: "4", title: "Samsung TV", category: "electronics", price: 30000, rating: 4.3, tags: ["tv", "samsung"] },
];

// -------------------------------------------------------
// GET /api/search?q=laptop&category=electronics&sort=price&order=asc&page=1&limit=10
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    // ---- KUNIN ANG MGA QUERY PARAMETERS ----
    const q = req.query.q || "";                          // 👉 Search keyword
    const category = req.query.category || "";             // 👉 Filter by category
    const minPrice = parseFloat(req.query.minPrice) || 0;  // 👉 Minimum price filter
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity; // 👉 Max price filter
    const sort = req.query.sort || "title";               // 👉 Sort field (title, price, rating)
    const order = req.query.order === "desc" ? -1 : 1;   // 👉 asc o desc
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // ---- PALITAN NG ACTUAL DB QUERY ----
    // Para sa MongoDB:
    // const items = await Item.find({
    //   title: { $regex: q, $options: "i" },
    //   ...(category && { category }),
    //   price: { $gte: minPrice, $lte: maxPrice }
    // }).sort({ [sort]: order }).skip((page-1)*limit).limit(limit)

    let results = [...items];

    // Filter by search keyword (title o tags)
    if (q) {
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      );
    }

    // Filter by category
    if (category) {
      results = results.filter((i) => i.category === category);
    }

    // Filter by price range
    results = results.filter((i) => i.price >= minPrice && i.price <= maxPrice);

    // Sort
    results.sort((a, b) => {
      if (a[sort] < b[sort]) return -1 * order;
      if (a[sort] > b[sort]) return 1 * order;
      return 0;
    });

    // Paginate
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    return paginatedResponse(res, `${results.length} resulta para sa "${q}".`, paginated, {
      total: results.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa paghahanap.");
  }
});

// -------------------------------------------------------
// GET /api/search/categories — Lahat ng available categories
// -------------------------------------------------------
router.get("/categories", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Item.distinct("category")
    const categories = [...new Set(items.map((i) => i.category))];
    return successResponse(res, "Nakuha ang mga kategorya.", categories);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga kategorya.");
  }
});

// -------------------------------------------------------
// GET /api/search/suggestions?q=lap — Para sa autocomplete
// -------------------------------------------------------
router.get("/suggestions", verifyToken, (req, res) => {
  try {
    const q = req.query.q || "";
    if (q.length < 2) return successResponse(res, "Keyword is too short.", []);

    // 👉 PALITAN NG ACTUAL AUTOCOMPLETE QUERY SA DB
    const suggestions = items
      .filter((i) => i.title.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5) // Limitahan sa 5 suggestions
      .map((i) => ({ id: i.id, title: i.title }));

    return successResponse(res, "Nakuha ang mga suggestions.", suggestions);
  } catch (err) {
    return errorResponse(res, "May error sa autocomplete.");
  }
});

module.exports = router;
