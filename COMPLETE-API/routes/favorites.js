// ============================================================
// FAVORITES / WISHLIST API — I-save ang mga paboritong items
// BASE URL: /api/favorites
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DATABASE — PALITAN NG TUNAY NA DATABASE
let favorites = [
  { id: "1", userId: "1", itemId: "1", itemType: "product", createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/favorites — Lahat ng favorites ng naka-login
// -------------------------------------------------------
router.get("/", verifyToken, (req, res) => {
  try {
    const { itemType } = req.query; // optional filter: "product", "post", etc.

    // PALITAN: const favs = await Favorite.find({ userId: req.user.id }).populate("itemId")
    let userFavs = favorites.filter((f) => f.userId === req.user.id);
    if (itemType) userFavs = userFavs.filter((f) => f.itemType === itemType);

    return successResponse(res, "Nakuha ang mga paborito.", { favorites: userFavs, total: userFavs.length });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga paborito.");
  }
});

// -------------------------------------------------------
// POST /api/favorites — Idagdag sa favorites
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType)
      return errorResponse(res, "Kailangan ang itemId at itemType.", 400);

    const validTypes = ["product", "post", "article", "store"];
    if (!validTypes.includes(itemType))
      return errorResponse(res, `Hindi valid ang itemType. Gamitin ang: ${validTypes.join(", ")}`, 400);

    // PALITAN: const exists = await Favorite.findOne({ userId: req.user.id, itemId })
    const exists = favorites.find((f) => f.userId === req.user.id && f.itemId === itemId);
    if (exists) return errorResponse(res, "Nandoon na ito sa iyong mga paborito.", 409);

    // PALITAN: const fav = await Favorite.create({ userId: req.user.id, itemId, itemType })
    const newFav = { id: Date.now().toString(), userId: req.user.id, itemId, itemType, createdAt: new Date() };
    favorites.push(newFav);

    return successResponse(res, "Naidagdag sa mga paborito!", newFav, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pagdagdag ng paborito.");
  }
});

// -------------------------------------------------------
// GET /api/favorites/check/:itemId — Tingnan kung paborito na
// -------------------------------------------------------
router.get("/check/:itemId", verifyToken, (req, res) => {
  try {
    // PALITAN: const fav = await Favorite.findOne({ userId: req.user.id, itemId: req.params.itemId })
    const isFavorite = favorites.some((f) => f.userId === req.user.id && f.itemId === req.params.itemId);
    return successResponse(res, "Nakita.", { isFavorite });
  } catch (err) {
    return errorResponse(res, "May error sa pag-check ng paborito.");
  }
});

// -------------------------------------------------------
// DELETE /api/favorites/:itemId — Alisin sa favorites
// -------------------------------------------------------
router.delete("/:itemId", verifyToken, (req, res) => {
  try {
    const index = favorites.findIndex((f) => f.userId === req.user.id && f.itemId === req.params.itemId);
    if (index === -1) return errorResponse(res, "Hindi mahanap sa iyong mga paborito.", 404);

    // PALITAN: await Favorite.findOneAndDelete({ userId: req.user.id, itemId: req.params.itemId })
    favorites.splice(index, 1);
    return successResponse(res, "Naalis sa mga paborito.");
  } catch (err) {
    return errorResponse(res, "May error sa pag-alis ng paborito.");
  }
});

module.exports = router;
