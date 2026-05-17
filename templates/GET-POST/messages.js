// ============================================================
// MESSAGING / INBOX API — GET at POST
// 👉 BASE URL: /api/messages
// 👉 GAMITIN PARA SA: Direct messages, inbox, chat history
// ============================================================
// PAANO GAMITIN:
//   sa server.js:  app.use("/api/messages", require("./templates/GET-POST/messages"))
// ============================================================

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { successResponse, errorResponse, paginatedResponse } = require("../../utils/response");

// -------------------------------------------------------
// DUMMY DATA — 👉 PALITAN NG TUNAY NA DATABASE
// -------------------------------------------------------
let messages = [
  { id: "1", senderId: "user-1", receiverId: "user-2", content: "Kumusta ka?", isRead: true, createdAt: new Date() },
  { id: "2", senderId: "user-2", receiverId: "user-1", content: "Maayos naman!", isRead: false, createdAt: new Date() },
];

// -------------------------------------------------------
// GET /api/messages/inbox — Lahat ng natanggap na messages
// -------------------------------------------------------
router.get("/inbox", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const inbox = await Message.find({ receiverId: req.user.id }).sort("-createdAt")
    const inbox = messages.filter((m) => m.receiverId === req.user.id);
    const unreadCount = inbox.filter((m) => !m.isRead).length;

    return successResponse(res, "Nakuha ang inbox.", { messages: inbox, unreadCount });
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng inbox.");
  }
});

// -------------------------------------------------------
// GET /api/messages/sent — Lahat ng napadala
// -------------------------------------------------------
router.get("/sent", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN: const sent = await Message.find({ senderId: req.user.id }).sort("-createdAt")
    const sent = messages.filter((m) => m.senderId === req.user.id);
    return successResponse(res, "Nakuha ang mga napadala.", sent);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng mga napadala.");
  }
});

// -------------------------------------------------------
// GET /api/messages/conversation/:userId — Conversation sa isang user
// -------------------------------------------------------
router.get("/conversation/:userId", verifyToken, (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    // 👉 PALITAN: await Message.find({ $or: [{ senderId: myId, receiverId: otherId }, { senderId: otherId, receiverId: myId }] }).sort("createdAt")
    const conversation = messages
      .filter(
        (m) =>
          (m.senderId === myId && m.receiverId === otherId) ||
          (m.senderId === otherId && m.receiverId === myId)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // I-mark lahat ng natanggap na messages bilang nabasa
    conversation
      .filter((m) => m.receiverId === myId && !m.isRead)
      .forEach((m) => (m.isRead = true));

    return successResponse(res, "Nakuha ang conversation.", conversation);
  } catch (err) {
    return errorResponse(res, "May error sa pagkuha ng conversation.");
  }
});

// -------------------------------------------------------
// POST /api/messages/send — Mag-send ng message
// -------------------------------------------------------
router.post("/send", verifyToken, (req, res) => {
  try {
    // 👉 PALITAN ANG MGA FIELD KUNG KAILANGAN
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return errorResponse(res, "Kailangan ang receiverId at content.", 400);
    }

    if (receiverId === req.user.id) {
      return errorResponse(res, "Hindi ka pwedeng mag-message sa sarili mo.", 400);
    }

    if (content.trim().length === 0 || content.length > 2000) {
      return errorResponse(res, "Ang mensahe ay dapat 1 hanggang 2000 characters.", 400);
    }

    // 👉 PALITAN: Siguraduhing mayroon ang receiver
    // const receiver = await User.findById(receiverId)
    // if (!receiver) return errorResponse(res, "Hindi mahanap ang tatanggap.", 404)

    // 👉 PALITAN: const message = await Message.create({...})
    const newMessage = {
      id: Date.now().toString(),
      senderId: req.user.id,
      receiverId,
      content: content.trim(),
      isRead: false,
      createdAt: new Date(),
    };
    messages.push(newMessage);

    // 👉 DITO PWEDE KANG MAG-EMIT NG SOCKET.IO EVENT PARA SA REAL-TIME
    // req.app.get("io").to(receiverId).emit("new_message", newMessage)

    return successResponse(res, "Naipadala ang mensahe.", newMessage, 201);
  } catch (err) {
    return errorResponse(res, "May error sa pagpapadala ng mensahe.");
  }
});

// -------------------------------------------------------
// PATCH /api/messages/:id/read — Markahan bilang nabasa
// -------------------------------------------------------
router.patch("/:id/read", verifyToken, (req, res) => {
  try {
    const message = messages.find(
      (m) => m.id === req.params.id && m.receiverId === req.user.id
    );
    if (!message) return errorResponse(res, "Hindi mahanap ang mensahe.", 404);

    message.isRead = true;
    return successResponse(res, "Nabasa na ang mensahe.");
  } catch (err) {
    return errorResponse(res, "May error.");
  }
});

// -------------------------------------------------------
// DELETE /api/messages/:id — Burahin ang mensahe (sender lang)
// -------------------------------------------------------
router.delete("/:id", verifyToken, (req, res) => {
  try {
    const index = messages.findIndex(
      (m) => m.id === req.params.id && m.senderId === req.user.id
    );
    if (index === -1) return errorResponse(res, "Hindi mahanap o wala kang pahintulot.", 404);

    messages.splice(index, 1);
    return successResponse(res, "Nabura ang mensahe.");
  } catch (err) {
    return errorResponse(res, "May error sa pagbura ng mensahe.");
  }
});

module.exports = router;
