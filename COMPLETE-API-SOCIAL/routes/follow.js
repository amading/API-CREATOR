// FOLLOW API â€” BASE URL: /api/follow
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DB â€” PALITAN NG TUNAY NA DATABASE
let follows = [
  { id: "1", followerId: "1", followingId: "2", createdAt: new Date() },
];

// POST /api/follow/:userId â€” Sundan ang user
router.post("/:userId", verifyToken, (req, res) => {
  try {
    const followingId = req.params.userId;
    if (followingId === req.user.id) return errorResponse(res, "Hindi ka pwedeng sundan ang iyong sarili.", 400);

    // PALITAN: const exists = await Follow.findOne({ followerId: req.user.id, followingId })
    const exists = follows.find((f) => f.followerId === req.user.id && f.followingId === followingId);
    if (exists) return errorResponse(res, "Sinusudan mo na siya.", 409);

    // PALITAN: await Follow.create({ followerId: req.user.id, followingId })
    const follow = { id: Date.now().toString(), followerId: req.user.id, followingId, createdAt: new Date() };
    follows.push(follow);
    return successResponse(res, "Sinundan na!", { following: true });
  } catch (err) { return errorResponse(res, "May error sa pag-follow."); }
});

// DELETE /api/follow/:userId â€” Hindi na sundan
router.delete("/:userId", verifyToken, (req, res) => {
  try {
    const index = follows.findIndex((f) => f.followerId === req.user.id && f.followingId === req.params.userId);
    if (index === -1) return errorResponse(res, "Hindi ka naman sumusunod sa kanya.", 404);
    // PALITAN: await Follow.findOneAndDelete({ followerId: req.user.id, followingId })
    follows.splice(index, 1);
    return successResponse(res, "Hindi na sinusundan.", { following: false });
  } catch (err) { return errorResponse(res, "May error sa pag-unfollow."); }
});

// GET /api/follow/:userId/followers â€” Mga followers ng user
router.get("/:userId/followers", verifyToken, (req, res) => {
  try {
    // PALITAN: await Follow.find({ followingId }).populate("followerId", "name avatar")
    const followers = follows.filter((f) => f.followingId === req.params.userId);
    return successResponse(res, "Nakuha ang mga followers.", { count: followers.length, followers });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng followers."); }
});

// GET /api/follow/:userId/following â€” Mga sinusundan ng user
router.get("/:userId/following", verifyToken, (req, res) => {
  try {
    // PALITAN: await Follow.find({ followerId }).populate("followingId", "name avatar")
    const following = follows.filter((f) => f.followerId === req.params.userId);
    return successResponse(res, "Nakuha ang mga sinusundan.", { count: following.length, following });
  } catch (err) { return errorResponse(res, "May error sa pagkuha ng following."); }
});

// GET /api/follow/check/:userId â€” Tingnan kung sinusundan
router.get("/check/:userId", verifyToken, (req, res) => {
  try {
    const isFollowing = follows.some((f) => f.followerId === req.user.id && f.followingId === req.params.userId);
    return successResponse(res, "Nakita.", { isFollowing });
  } catch (err) { return errorResponse(res, "May error."); }
});

module.exports = router;

