const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getNotifications,
  markAllAsRead,
  deleteNotification,
} = require("../controller/notificationController");

router
  .use(auth)
  .get("/", getNotifications)
  .put("/read", markAllAsRead)
  .delete("/:id", deleteNotification);

module.exports = router;
