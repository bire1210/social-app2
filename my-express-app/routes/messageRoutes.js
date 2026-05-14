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
router
  .get("/unread-count", getUnreadCount)
  .get("/conversations", getConversations)
  .get("/conversations/:id/messages", getMessages)
  .post("/conversations/:id/messages", sendMessage)
  .post("/conversations/:userId", getOrCreateConversation);

module.exports = router;
