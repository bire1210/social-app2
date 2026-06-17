const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} = require("../controller/notificationController");

router
  .use(auth)
  .get("/", getNotifications)
  .put("/read", markAllAsRead)
  .put("/:id/read", markAsRead)
  .delete("/:id", deleteNotification);

module.exports = router;
