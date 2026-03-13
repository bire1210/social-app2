const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "username fullName avatar")
    .populate("post", "content image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
});
