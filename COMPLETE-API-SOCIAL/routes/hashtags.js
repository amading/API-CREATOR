// HASHTAGS API â€” BASE URL: /api/hashtags
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DB â€” PALITAN NG TUNAY NA DATABASE
let hashtags = [
  { tag: "pinoy", postCount: 150, trending: true },
  { tag: "food", postCount: 89, trending: true },
  { tag: "travel", postCount: 67, trending: false },
  { tag: "tech", postCount: 45, trending: false },
];

// GET /api/hashtags/trending â€” Mga trending hashtags
router.get("/trending", verifyToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    // PALITAN: await Hashtag.find({ trending: true }).sort("-postCount").limit(10)
    const trending = hashtags.filter((h) => h.trending).sort((a, b) => b.postCount - a.postCount).slice(0, limit);
    return successResponse(res, "Nakuha ang mga trending hashtags.", trending);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng trending hashtags."); }
});

// GET /api/hashtags/search?q=food â€” Maghanap ng hashtag
router.get("/search", verifyToken, (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return errorResponse(res, "Kailangan ng search query.", 400);
    // PALITAN: await Hashtag.find({ tag: { $regex: q, $options: 'i' } }).sort("-postCount")
    const results = hashtags.filter((h) => h.tag.includes(q.toLowerCase()));
    return successResponse(res, `Resulta para sa "#${q}".`, results);
  } catch (err) { return errorResponse(res, "May error sa paghahanap ng hashtag."); }
});

// GET /api/hashtags/:tag/posts â€” Mga posts na may hashtag
router.get("/:tag/posts", verifyToken, (req, res) => {
  try {
    const tag = req.params.tag.replace("#", "").toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    // PALITAN: await Post.find({ hashtags: tag }).sort("-createdAt").skip(...).limit(...)
    // DEMO: walang actual posts sa dummy data, ibabalik lang ang empty array
    return successResponse(res, `Nakuha ang mga posts para sa #${tag}.`, {
      tag,
      posts: [],
      total: 0,
      page,
      limit,
    });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng posts ng hashtag."); }
});

module.exports = router;

