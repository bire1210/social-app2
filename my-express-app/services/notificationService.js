const Notification = require("../models/Notification");
const { getIO, getSocketId } = require("../config/socket");

/**
 * Create a notification and emit a socket event
 * @param {Object} data - Notification data
 * @param {String} data.recipient - User ID of the recipient
 * @param {String} data.sender - User ID of the sender
 * @param {String} data.type - Type of notification (like, comment, follow, etc.)
 * @param {String} [data.post] - Post ID (optional)
 */
const createNotification = async ({ recipient, sender, type, post }) => {
  try {
    // 1. Don't notify if recipient is the sender
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    // 2. Create notification in database
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
    });

    // 3. Populate sender info for the socket event
    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "username fullName avatar")
      .populate("post", "content image")
      .lean();

    // 4. Emit real-time event if user is online
    const io = getIO();
    const recipientSocketId = getSocketId(recipient);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newNotification", populatedNotification);
      console.log(`📢 Notification emitted to user ${recipient} via socket ${recipientSocketId}`);
    }

    return populatedNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

module.exports = { createNotification };
