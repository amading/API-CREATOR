// ============================================================
// POSTS ROUTES — CRUD para sa Posts/Blogs/Articles
// 👉 BASE URL: /api/posts
// 👉 PALITAN ANG "Post" NG IYONG MODEL (Blog, Article, News, etc.)
// 👉 PALITAN ANG MGA FIELD (title, content, etc.) NG IYONG MGA FIELD
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE QUERIES
// -------------------------------------------------------
let posts = [
  { id: "1", title: "Unang Post", content: "Hello World!", authorId: "1", likes: 0, createdAt: new Date() },
  { id: "2", title: "Pangalawang Post", content: "Kamusta?", authorId: "1", likes: 5, createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/posts — Lahat ng posts (public)
// -------------------------------------------------------
router.get("/", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 👉 SEARCH by title
    const search = req.query.search || "";
    const filtered = search
      ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
      : posts;

    const start = (page - 1) * limit;
    return paginatedResponse(res, "Nakuha ang mga post.", filtered.slice(start, start + limit), {
      total: filtered.length,
      page,
      limit,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga post.");
  }
});

// -------------------------------------------------------
// GET /api/posts/:id — Isang post
// -------------------------------------------------------
router.get("/:id", (req, res) => {
  try {
    // 👉 PALITAN: const post = await Post.findById(req.params.id)
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return errorResponse(res, "Hindi mahanap ang post.", 404);

    return successResponse(res, "Nakuha ang post.", post);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng post.");
  }
});

// -------------------------------------------------------
// POST /api/posts — Gumawa ng bagong post (kailangan ng login)
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD NA ITO
    const { title, content } = req.body;

    if (!title || !content) {
      return errorResponse(res, "Kailangan ang title at content.", 400);
    }

    // 👉 PALITAN: const post = await Post.create({...})
    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      authorId: req.user.id, // Galing sa JWT token
      likes: 0,
      createdAt: new Date(),
    };
    posts.push(newPost);

    return successResponse(res, "Nagawa ang bagong post.", newPost, 201);
  } catch (err) {
    return errorResponse(res, "May error sa paggawa ng post.");
  }
});

// -------------------------------------------------------
// PUT /api/posts/:id — I-edit ang post (author lang)
// -------------------------------------------------------
router.put("/:id", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const post = await Post.findById(req.params.id)
    const index = posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang post.", 404);

    // Tsekuhin kung siya ba ang author
    if (posts[index].authorId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Ikaw lang ang pwedeng mag-edit ng iyong post.", 403);
    }

    posts[index] = { ...posts[index], ...req.body, id: req.params.id, authorId: posts[index].authorId };
    return successResponse(res, "Na-update ang post.", posts[index]);
  } catch (err) {
    return errorResponse(res, "May error sa pag-edit ng post.");
  }
});

// -------------------------------------------------------
// POST /api/posts/:id/like — I-like ang post
// -------------------------------------------------------
router.post("/:id/like", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } })
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return errorResponse(res, "Hindi mahanap ang post.", 404);

    post.likes += 1;
    return successResponse(res, "Na-like ang post!", { likes: post.likes });
  } catch (err) {
    return errorResponse(res, "May error sa pag-like.");
  }
});

// -------------------------------------------------------
// DELETE /api/posts/:id — Burahin ang post (author o admin)
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang post.", 404);

    if (posts[index].authorId !== req.user.id && req.user.role !== "admin") {
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong post.", 403);
    }

    // 👉 PALITAN: await Post.findByIdAndDelete(req.params.id)
    posts.splice(index, 1);
    return successResponse(res, "Nabura ang post.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng post.");
  }
});

module.exports = router;
