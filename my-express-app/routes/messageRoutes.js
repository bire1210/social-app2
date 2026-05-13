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

// Define specific routes BEFORE parameterized routes
router.get("/unread-count", getUnreadCount);
router.get("/conversations", getConversations);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);
router.post("/conversations/:userId", getOrCreateConversation);

module.exports = router;
