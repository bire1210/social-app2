const Notification = require("../models/Notification");

/**
 * Create a notification (skips if sender === recipient)
 */
const createNotification = async ({ recipient, sender, type, post }) => {
  // Don't notify yourself
  if (recipient.toString() === sender.toString()) return;

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
  });

  return notification;
};

module.exports = { createNotification };
