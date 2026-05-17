// ============================================================
// MESSAGES API — Direct Messages sa pagitan ng users
// BASE URL: /api/messages
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

// DUMMY DATABASE — PALITAN NG TUNAY NA DATABASE
let messages = [
  { id: "1", senderId: "1", receiverId: "2", text: "Kumusta?", isRead: false, createdAt: new Date() },
  { id: "2", senderId: "2", receiverId: "1", text: "Mabuti naman!", isRead: true, createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/messages/inbox — Lahat ng conversations ng naka-login
// -------------------------------------------------------
router.get("/inbox", verifyToken, (req, res) => {
  try {
    // PALITAN: I-group ng conversations gamit ang DB aggregation
    const userId = req.user.id;
    const myMessages = messages.filter((m) => m.senderId === userId || m.receiverId === userId);

    // Kunin ang unique na kausap
    const conversationMap = new Map();
    myMessages.forEach((m) => {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      const existing = conversationMap.get(otherId);
      if (!existing || new Date(m.createdAt) > new Date(existing.lastMessage.createdAt)) {
        conversationMap.set(otherId, { userId: otherId, lastMessage: m });
      }
    });

    const conversations = Array.from(conversationMap.values());
    const unreadCount = myMessages.filter((m) => m.receiverId === userId && !m.isRead).length;

    return successResponse(res, "Nakuha ang mga conversation.", { conversations, unreadCount });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng inbox.");
  }
});

// -------------------------------------------------------
// GET /api/messages/:userId — Conversation kasama ang isang user
// -------------------------------------------------------
router.get("/:userId", verifyToken, (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    // PALITAN: const msgs = await Message.find({ $or: [{senderId: myId, receiverId: otherId}, {senderId: otherId, receiverId: myId}] }).sort("createdAt")
    const conversation = messages
      .filter((m) => (m.senderId === myId && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === myId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Markahan bilang nabasa ang mga natanggap
    conversation.forEach((m) => { if (m.receiverId === myId) m.isRead = true; });

    const start = (page - 1) * limit;
    return successResponse(res, "Nakuha ang conversation.", {
      messages: conversation.slice(start, start + limit),
      total: conversation.length,
    });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng conversation.");
  }
});

// -------------------------------------------------------
// POST /api/messages — Mag-send ng message
// -------------------------------------------------------
router.post("/", verifyToken, (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId) return errorResponse(res, "Kailangan ang receiverId.", 400);
    if (!text || text.trim().length === 0) return errorResponse(res, "Hindi pwedeng blank ang mensahe.", 400);
    if (receiverId === req.user.id) return errorResponse(res, "Hindi ka pwedeng mag-message sa iyong sarili.", 400);

    // PALITAN: const msg = await Message.create({ senderId: req.user.id, receiverId, text })
    const newMessage = {
      id: Date.now().toString(),
      senderId: req.user.id,
      receiverId,
      text: text.trim(),
      isRead: false,
      createdAt: new Date(),
    };
    messages.push(newMessage);

    return successResponse(res, "Naipadala ang mensahe.", newMessage, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pagpapadala ng mensahe.");
  }
});

// -------------------------------------------------------
// DELETE /api/messages/:id — Burahin ang sariling message
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = messages.findIndex((m) => m.id === req.params.id);
    if (index === -1) return errorResponse(res, "Hindi mahanap ang mensahe.", 404);

    if (messages[index].senderId !== req.user.id)
      return errorResponse(res, "Ikaw lang ang pwedeng mag-bura ng iyong mensahe.", 403);

    // PALITAN: await Message.findByIdAndDelete(req.params.id)
    messages.splice(index, 1);
    return successResponse(res, "Nabura ang mensahe.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng mensahe.");
  }
});

module.exports = router;
