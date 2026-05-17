// ============================================================
// REVIEWS / RATINGS API — GET at POST
// 👉 BASE URL: /api/reviews
// 👉 GAMITIN PARA SA: Product reviews, restaurant ratings, app reviews
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/reviews", require("./templates/GET-POST/reviews"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
let reviews = [
  { id: "1", targetId: "product-1", targetType: "product", userId: "user-1", rating: 5, title: "Maganda!", body: "Sulit na sulit!", helpful: 2, createdAt: new Date() },
  { id: "2", targetId: "product-1", targetType: "product", userId: "user-2", rating: 3, title: "Okay lang", body: "Pwede na.", helpful: 0, createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/reviews?targetId=product-1&targetType=product
// -------------------------------------------------------
router.get("/", (req, res) => {
  try {
    const { targetId, targetType } = req.query;

    if (!targetId || !targetType) {
      return errorResponse(res, "Kailangan ang targetId at targetType.", 400);
    }

    // 👉 PALITAN: const reviews = await Review.find({ targetId, targetType })
    const filtered = reviews.filter(
      (r) => r.targetId === targetId && r.targetType === targetType
    );

    // Kalkulahin ang average rating
    const avgRating =
      filtered.length > 0
        ? (filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length).toFixed(1)
        : 0;

    // Bilang ng bawat star
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filtered.forEach((r) => ratingBreakdown[r.rating]++);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;

    return res.json({
      success: true,
      message: "Nakuha ang mga review.",
      summary: {
        averageRating: parseFloat(avgRating),
        totalReviews: filtered.length,
        ratingBreakdown,
      },
      data: filtered.slice(start, start + limit),
      pagination: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga review.");
  }
});

// -------------------------------------------------------
// GET /api/reviews/my — Lahat ng sariling reviews ng naka-login
// -------------------------------------------------------
router.get("/my", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const myReviews = await Review.find({ userId: req.user.id })
    const myReviews = reviews.filter((r) => r.userId === req.user.id);
    return successResponse(res, "Nakuha ang iyong mga review.", myReviews);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng iyong mga review.");
  }
});

// -------------------------------------------------------
// POST /api/reviews — Mag-review (isang review per item per user)
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG REVIEW STRUCTURE
    const { targetId, targetType, rating, title, body } = req.body;

    if (!targetId || !targetType || !rating) {
      return errorResponse(res, "Kailangan ang targetId, targetType, at rating.", 400);
    }

    // Validate rating (1-5 stars lang)
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return errorResponse(res, "Ang rating ay dapat 1 hanggang 5 stars.", 400);
    }

    // Pwede lang mag-review ng isang beses per item
    // 👉 PALITAN: const existing = await Review.findOne({ targetId, userId: req.user.id })
    const existing = reviews.find(
      (r) => r.targetId === targetId && r.userId === req.user.id
    );
    if (existing) {
      return errorResponse(res, "Naka-review ka na ng item na ito. I-edit nalang.", 409);
    }

    // 👉 PALITAN: const review = await Review.create({...})
    const newReview = {
      id: Date.now().toString(),
      targetId,
      targetType,
      userId: req.user.id,
      rating: ratingNum,
      title: title || "",
      body: body || "",
      helpful: 0,
      createdAt: new Date(),
    };
    reviews.push(newReview);

    return successResponse(res, "Salamat sa iyong review!", newReview, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pagsusumite ng review.");
  }
});

// -------------------------------------------------------
// PUT /api/reviews/:id — I-edit ang sariling review
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    const index = reviews.findIndex((r) => r.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang review.", 404);

    if (reviews[index].userId !== req.user.id) {
      return errorResponse(res, "Ikaw lang ang pwedeng mag-edit ng iyong review.", 403);
    }

    const { rating, title, body } = req.body;
    if (rating) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return errorResponse(res, "Ang rating ay dapat 1 hanggang 5 stars.", 400);
      }
      reviews[index].rating = ratingNum;
    }
    if (title !== undefined) reviews[index].title = title;
    if (body !== undefined) reviews[index].body = body;
    reviews[index].updatedAt = new Date();

    return successResponse(res, "Na-update ang iyong review.", reviews[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-edit ng review.");
  }
});

// -------------------------------------------------------
// POST /api/reviews/:id/helpful — Markahan bilang helpful
// -------------------------------------------------------
router.post("/:id/helpful", verifyToken, (req, res) => {
  try {
    const review = reviews.find((r) => r.id === req.params.id);
    if (!review) return errorResponse(res, "Hindi mahanap ang review.", 404);

    review.helpful += 1;
    return successResponse(res, "Minarkahan bilang helpful!", { helpful: review.helpful });
  } catch (err) {
    return errorResponse(res, "May error.");
  }
});

// -------------------------------------------------------
// DELETE /api/reviews/:id — Burahin (may-ari o admin)
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = reviews.findIndex((r) => r.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang review.", 404);

    if (reviews[index].userId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong review.", 403);
    }

    reviews.splice(index, 1);
    return successResponse(res, "Nabura ang review.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng review.");
  }
});

module.exports = router;
