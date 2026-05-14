const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get or create a conversation with a user
// @route   POST /api/messages/conversations/:userId
// @access  Private
exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const me = req.user._id;

  if (userId === me.toString()) {
    throw new ApiError(400, "Cannot message yourself");
  }

  const other = await User.findById(userId).select("username fullName avatar");
  if (!other) throw new ApiError(404, "User not found");

  let conversation = await Conversation.findOne({
    participants: { $all: [me, userId], $size: 2 },
  }).populate("participants", "username fullName avatar");

  if (!conversation) {
    conversation = await Conversation.create({ participants: [me, userId] });
    conversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "username fullName avatar"
    );
  }

  res.status(200).json({ success: true, conversation });
});

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "username fullName avatar")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1 });

  // Attach unread count per conversation
  const withUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unread = await Message.countDocuments({
        conversation: conv._id,
        readBy: { $ne: req.user._id },
        sender: { $ne: req.user._id },
      });
      return { ...conv.toObject(), unreadCount: unread };
    })
  );

  res.status(200).json({ success: true, conversations: withUnread });
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:id/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  });

  if (!conversation) throw new ApiError(404, "Conversation not found");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversation: req.params.id })
    .populate("sender", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark all as read
  await Message.updateMany(
    { conversation: req.params.id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  const total = await Message.countDocuments({ conversation: req.params.id });

  res.status(200).json({
    success: true,
    messages: messages.reverse(),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Message content is required");

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.user._id,
  });

  if (!conversation) throw new ApiError(404, "Conversation not found");

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user._id,
    content: content.trim(),
    readBy: [req.user._id],
  });

  // Update conversation's lastMessage
  await Conversation.findByIdAndUpdate(req.params.id, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  const populated = await Message.findById(message._id).populate(
    "sender",
    "username fullName avatar"
  );

  res.status(201).json({ success: true, message: populated });
});


exports.getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id });
  const convIds = conversations.map((c) => c._id);

  const count = await Message.countDocuments({
    conversation: { $in: convIds },
    readBy: { $ne: req.user._id },
    sender: { $ne: req.user._id },
  });

  res.status(200).json({ success: true, unreadCount: count });
});
