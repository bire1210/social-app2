const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllAsRead,
  deleteNotification,
} = require("../controller/notificationController");
const auth = require("../middleware/auth");

router.use(auth);

router
  .get("/", getNotifications)
  .put("/read", markAllAsRead)
  .delete("/:id", deleteNotification);

module.exports = router;
