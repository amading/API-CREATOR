// ============================================================
// RATINGS API â€” I-rate ang products, services, atbp.
// BASE URL: /api/ratings
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DATABASE â€” PALITAN NG TUNAY NA DATABASE
let ratings = [
  { id: "1", itemId: "1", itemType: "product", userId: "1", stars: 5, review: "Maganda!", createdAt: new Date() },
  { id: "2", itemId: "1", itemType: "product", userId: "2", stars: 4, review: "Ok naman.", createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/ratings?itemId=1&itemType=product â€” Lahat ng ratings ng isang item
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    const { itemId, itemType } = req.query;
    if (!itemId) return errorResponse(res, "Kailangan ang itemId.", 400);

    // PALITAN: const ratings = await Rating.find({ itemId, itemType }).sort("-createdAt")
    const filtered = ratings.filter((r) => r.itemId === itemId && (!itemType || r.itemType === itemType));

    const avg = filtered.length > 0
      ? (filtered.reduce((sum, r) => sum + r.stars, 0) / filtered.length).toFixed(1)
      : 0;

    return successResponse(res, "Nakuha ang mga rating.", {
      ratings: filtered,
      total: filtered.length,
      average: parseFloat(avg),
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga rating.");
  }
});

// -------------------------------------------------------
// POST /api/ratings â€” Mag-rate ng item
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    const { itemId, itemType, stars, review } = req.body;

    if (!itemId || !itemType || !stars)
      return errorResponse(res, "Kailangan ang itemId, itemType, at stars.", 400);

    if (stars < 1 || stars > 5)
      return errorResponse(res, "Ang stars ay dapat 1 hanggang 5 lang.", 400);

    // PALITAN: const exists = await Rating.findOne({ userId: req.user.id, itemId })
    const exists = ratings.find((r) => r.userId === req.user.id && r.itemId === itemId);
    if (exists) return errorResponse(res, "Naka-rate ka na ng item na ito. I-edit na lang.", 409);

    // PALITAN: const rating = await Rating.create({...})
    const newRating = {
      id: Date.now().toString(),
      itemId,
      itemType,
      userId: req.user.id,
      stars: parseInt(stars),
      review: review || "",
      createdAt: new Date(),
    };
    ratings.push(newRating);

    return successResponse(res, "Nai-submit ang rating!", newRating, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pag-rate.");
  }
});

// -------------------------------------------------------
// PUT /api/ratings/:id â€” I-edit ang sariling rating
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    const { stars, review } = req.body;
    if (stars && (stars < 1 || stars > 5))
      return errorResponse(res, "Ang stars ay dapat 1 hanggang 5 lang.", 400);

    const index = ratings.findIndex((r) => r.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang rating.", 404);

    if (ratings[index].userId !== req.user.id)
      return errorResponse(res, "Ikaw lang ang pwedeng mag-edit ng iyong rating.", 403);

    // PALITAN: await Rating.findByIdAndUpdate(req.params.id, { stars, review }, { new: true })
    if (stars) ratings[index].stars = parseInt(stars);
    if (review !== undefined) ratings[index].review = review;

    return successResponse(res, "Na-update ang rating.", ratings[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-edit ng rating.");
  }
});

// -------------------------------------------------------
// DELETE /api/ratings/:id â€” Burahin ang sariling rating
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = ratings.findIndex((r) => r.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang rating.", 404);

    if (ratings[index].userId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong rating.", 403);

    // PALITAN: await Rating.findByIdAndDelete(req.params.id)
    ratings.splice(index, 1);
    return successResponse(res, "Nabura ang rating.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng rating.");
  }
});

module.exports = router;

