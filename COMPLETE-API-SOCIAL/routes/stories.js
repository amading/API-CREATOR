// STORIES API — BASE URL: /api/stories (24-hour stories like Instagram)
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/stories/";
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => cb(null, `story-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// DUMMY DB — PALITAN NG TUNAY NA DATABASE
let stories = [
  { id: "1", userId: "1", mediaUrl: "https://example.com/story1.jpg", mediaType: "image", caption: "Hello!", viewers: [], expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), createdAt: new Date() },
];

const isExpired = (story) => new Date() > new Date(story.expiresAt);

// GET /api/stories/feed — Stories ng mga taong sinusundan mo
router.get("/feed", verifyToken, (req, res) => {
  try {
    // PALITAN: I-fetch ang stories ng mga sinusundan mo + sarili mo, di pa expired
    const active = stories.filter((s) => !isExpired(s));
    return successResponse(res, "Nakuha ang mga stories.", active);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng stories."); }
});

// GET /api/stories/me — Sariling stories
router.get("/me", verifyToken, (req, res) => {
  try {
    // PALITAN: await Story.find({ userId: req.user.id, expiresAt: { $gt: new Date() } })
    const myStories = stories.filter((s) => s.userId === req.user.id && !isExpired(s));
    return successResponse(res, "Nakuha ang sariling mga stories.", myStories);
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng stories."); }
});

// POST /api/stories — Mag-post ng story (may media)
router.post("/", verifyToken, upload.single("media"), (req, res) => {
  try {
    const { caption, duration } = req.body;
    const mediaUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/stories/${req.file.filename}`
      : req.body.mediaUrl;
    const mediaType = req.file ? (req.file.mimetype.startsWith("video") ? "video" : "image") : "image";

    if (!mediaUrl) return errorResponse(res, "Kailangan ng media (file o URL).", 400);

    // PALITAN: await Story.create({...})
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const story = { id: Date.now().toString(), userId: req.user.id, mediaUrl, mediaType, caption: caption || "", viewers: [], duration: parseInt(duration) || 5, expiresAt, createdAt: new Date() };
    stories.push(story);
    return successResponse(res, "Nai-post ang story!", story, 201);
  } catch (err) { return errorResponse(res, "May error sa pag-post ng story."); }
});

// POST /api/stories/:id/view — I-record na nanood
router.post("/:id/view", verifyToken, (req, res) => {
  try {
    const story = stories.find((s) => s.id === req.params.id);
    if (!story || isExpired(story)) return errorResponse(res, "Hindi mahanap ang story.", 404);
    if (!story.viewers.includes(req.user.id)) story.viewers.push(req.user.id);
    // PALITAN: await Story.findByIdAndUpdate(id, { $addToSet: { viewers: req.user.id } })
    return successResponse(res, "Narecord ang view.", { viewCount: story.viewers.length });
  } catch (err) { return errorResponse(res, "May error."); }
});

// DELETE /api/stories/:id — Burahin ang story
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = stories.findIndex((s) => s.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang story.", 404);
    if (stories[index].userId !== req.user.id && req.user.role !== "admin")
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong story.", 403);
    // PALITAN: await Story.findByIdAndDelete(req.params.id)
    stories.splice(index, 1);
    return successResponse(res, "Nabura ang story.");
  } catch (err) { return errorResponse(res, "May error sa pagbura ng story."); }
});

module.exports = router;
