const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require("../controller/messageController");

router.use(auth); // all message routes require auth

router.get("/unread-count", getUnreadCount);
router.get("/conversations", getConversations);
router.post("/conversations/:userId", getOrCreateConversation);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);

module.exports = router;
