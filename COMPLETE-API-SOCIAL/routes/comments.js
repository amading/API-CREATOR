// ============================================================
// COMMENTS API â€” Mag-comment sa posts, products, atbp.
// BASE URL: /api/comments
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// DUMMY DATABASE â€” PALITAN NG TUNAY NA DATABASE
let comments = [
  { id: "1", postId: "1", userId: "1", authorName: "Juan", text: "Magandang post!", likes: 2, createdAt: new Date() },
  { id: "2", postId: "1", userId: "2", authorName: "Maria", text: "Agree!", likes: 0, createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/comments?postId=1 â€” Lahat ng comments ng isang post
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    const { postId, productId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // PALITAN: const comments = await Comment.find({ postId }).sort("-createdAt").skip(...).limit(...)
    let filtered = comments;
    if (postId) filtered = comments.filter((c) => c.postId === postId);
    if (productId) filtered = comments.filter((c) => c.productId === productId);

    return paginatedResponse(res, "Nakuha ang mga komento.", filtered.slice((page - 1) * limit, page * limit), {
      total: filtered.length, page, limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga komento.");
  }
});

// -------------------------------------------------------
// POST /api/comments â€” Mag-post ng comment
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    const { postId, productId, text } = req.body;

    if (!text || text.trim().length === 0)
      return errorResponse(res, "Hindi pwedeng blank ang komento.", 400);

    if (!postId && !productId)
      return errorResponse(res, "Kailangan ang postId o productId.", 400);

    // PALITAN: const comment = await Comment.create({ postId, productId, userId: req.user.id, text })
    const newComment = {
      id: Date.now().toString(),
      postId: postId || null,
      productId: productId || null,
      userId: req.user.id,
      authorName: req.user.name || "User",
      text: text.trim(),
      likes: 0,
      createdAt: new Date(),
    };
    comments.push(newComment);

    return successResponse(res, "Nai-post ang komento.", newComment, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pag-post ng komento.");
  }
});

// -------------------------------------------------------
// PUT /api/comments/:id â€” I-edit ang comment (author lang)
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0)
      return errorResponse(res, "Hindi pwedeng blank ang komento.", 400);

    const index = comments.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang komento.", 404);

    if (comments[index].userId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Ikaw lang ang pwedeng mag-edit ng iyong komento.", 403);

    // PALITAN: await Comment.findByIdAndUpdate(req.params.id, { text }, { new: true })
    comments[index].text = text.trim();
    return successResponse(res, "Na-edit ang komento.", comments[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-edit ng komento.");
  }
});

// -------------------------------------------------------
// POST /api/comments/:id/like â€” I-like ang comment
// -------------------------------------------------------
router.post("/:id/like", verifyToken, (req, res) => {
  try {
    // PALITAN: await Comment.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } })
    const comment = comments.find((c) => c.id === req.params.id);
    if (!comment) return errorResponse(res, "Hindi mahanap ang komento.", 404);
    comment.likes += 1;
    return successResponse(res, "Na-like ang komento!", { likes: comment.likes });
  } catch (err) {
    return errorResponse(res, "May error sa pag-like.");
  }
});

// -------------------------------------------------------
// DELETE /api/comments/:id â€” Burahin ang comment (author o admin)
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = comments.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang komento.", 404);

    if (comments[index].userId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong komento.", 403);

    // PALITAN: await Comment.findByIdAndDelete(req.params.id)
    comments.splice(index, 1);
    return successResponse(res, "Nabura ang komento.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng komento.");
  }
});

module.exports = router;

