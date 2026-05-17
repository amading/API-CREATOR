// ============================================================
// COMMENTS API — GET at POST (with DELETE)
// 👉 BASE URL: /api/comments
// 👉 GAMITIN PARA SA: Comment section ng posts, products, videos
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/comments", require("./templates/GET-POST/comments"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
let comments = [
  {
    id: "1",
    // 👉 "targetId" at "targetType" = kung anong pinagcomment-an
    targetId: "post-1",
    targetType: "post",  // 👉 Palitan: "post", "product", "video", etc.
    authorId: "user-1",
    authorName: "Juan",
    content: "Magandang post!",
    likes: 3,
    parentId: null,      // null = main comment, may id = reply
    createdAt: new Date(),
  },
  {
    id: "2",
    targetId: "post-1",
    targetType: "post",
    authorId: "user-2",
    authorName: "Maria",
    content: "Sumasang-ayon ako!",
    likes: 1,
    parentId: null,
    createdAt: new Date(),
  },
  {
    id: "3",
    targetId: "post-1",
    targetType: "post",
    authorId: "user-1",
    authorName: "Juan",
    content: "Salamat Maria!",
    likes: 0,
    parentId: "2",       // Reply sa comment id "2"
    createdAt: new Date(),
  },
];

// -------------------------------------------------------
// GET /api/comments?targetId=post-1&targetType=post — Lahat ng comments ng isang item
// -------------------------------------------------------
router.get("/", (req, res) => {
  try {
    const { targetId, targetType } = req.query;

    if (!targetId || !targetType) {
      return errorResponse(res, "Kailangan ang targetId at targetType sa query.", 400);
    }

    // 👉 PALITAN: const comments = await Comment.find({ targetId, targetType, parentId: null }).populate("replies")
    const mainComments = comments.filter(
      (c) => c.targetId === targetId && c.targetType === targetType && !c.parentId
    );

    // I-attach ang mga replies sa bawat main comment
    const withReplies = mainComments.map((c) => ({
      ...c,
      replies: comments.filter((r) => r.parentId === c.id),
    }));

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;

    return paginatedResponse(res, "Nakuha ang mga komento.", withReplies.slice(start, start + limit), {
      total: mainComments.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga komento.");
  }
});

// -------------------------------------------------------
// POST /api/comments — Mag-comment (kailangan ng login)
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD AYON SA IYONG COMMENT STRUCTURE
    const { targetId, targetType, content, parentId } = req.body;

    if (!targetId || !targetType || !content) {
      return errorResponse(res, "Kailangan ang targetId, targetType, at content.", 400);
    }

    if (content.trim().length < 1 || content.length > 1000) {
      return errorResponse(res, "Ang komento ay dapat 1 hanggang 1000 characters.", 400);
    }

    // Kung may parentId, siguraduhing mayroon ito
    if (parentId) {
      const parent = comments.find((c) => c.id === parentId);
      if (!parent) return errorResponse(res, "Hindi mahanap ang comment na ire-reply.", 404);
    }

    // 👉 PALITAN: const comment = await Comment.create({...})
    const newComment = {
      id: Date.now().toString(),
      targetId,
      targetType,
      authorId: req.user.id,
      authorName: req.user.name || req.user.email, // 👉 Palitan kung iba ang field
      content: content.trim(),
      likes: 0,
      parentId: parentId || null,
      createdAt: new Date(),
    };
    comments.push(newComment);

    return successResponse(res, "Nai-post ang komento.", newComment, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pag-post ng komento.");
  }
});

// -------------------------------------------------------
// POST /api/comments/:id/like — I-like ang komento
// -------------------------------------------------------
router.post("/:id/like", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } })
    const comment = comments.find((c) => c.id === req.params.id);
    if (!comment) return errorResponse(res, "Hindi mahanap ang komento.", 404);

    comment.likes += 1;
    return successResponse(res, "Na-like ang komento!", { likes: comment.likes });
  } catch (err) {
    return errorResponse(res, "May error sa pag-like ng komento.");
  }
});

// -------------------------------------------------------
// DELETE /api/comments/:id — Burahin ang komento (may-ari o admin)
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = comments.findIndex((c) => c.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang komento.", 404);

    if (comments[index].authorId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong komento.", 403);
    }

    // Burahin din ang lahat ng replies nito
    // 👉 PALITAN: await Comment.deleteMany({ $or: [{ _id: id }, { parentId: id }] })
    const toDelete = comments[index].id;
    comments = comments.filter((c) => c.id !== toDelete && c.parentId !== toDelete);

    return successResponse(res, "Nabura ang komento.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng komento.");
  }
});

module.exports = router;
