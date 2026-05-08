const LiveStream = require("../models/LiveStream");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// @desc    Get all live streams
// @route   GET /api/live
// @access  Public
exports.getLiveStreams = asyncHandler(async (req, res) => {
  const streams = await LiveStream.find({ isLive: true })
    .populate("streamer", "username fullName avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    streams,
  });
});

// @desc    Get a specific live stream
// @route   GET /api/live/:id
// @access  Public
exports.getLiveStream = asyncHandler(async (req, res) => {
  const stream = await LiveStream.findById(req.params.id)
    .populate("streamer", "username fullName avatar")
    .populate("comments.author", "username fullName avatar");

  if (!stream) {
    throw new ApiError(404, "Live stream not found");
  }

  res.status(200).json({
    success: true,
    stream,
  });
});

// @desc    Start a live stream
// @route   POST /api/live/start
// @access  Private
exports.startLiveStream = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  // Check if user already has an active stream
  const existing = await LiveStream.findOne({
    streamer: req.user._id,
    isLive: true,
  });

  if (existing) {
    throw new ApiError(400, "You already have an active live stream");
  }

  const stream = await LiveStream.create({
    streamer: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
  });

  const populated = await LiveStream.findById(stream._id).populate(
    "streamer",
    "username fullName avatar"
  );

  res.status(201).json({
    success: true,
    stream: populated,
  });
});

// @desc    Add viewer to live stream
// @route   POST /api/live/:id/view
// @access  Private
exports.addViewer = asyncHandler(async (req, res) => {
  const stream = await LiveStream.findById(req.params.id);

  if (!stream) {
    throw new ApiError(404, "Live stream not found");
  }

  if (!stream.viewers.includes(req.user._id)) {
    stream.viewers.push(req.user._id);
    stream.viewerCount = stream.viewers.length;
    await stream.save();
  }

  res.status(200).json({
    success: true,
    viewerCount: stream.viewerCount,
  });
});

// @desc    Like a live stream
// @route   POST /api/live/:id/like
// @access  Private
exports.likeLiveStream = asyncHandler(async (req, res) => {
  const stream = await LiveStream.findById(req.params.id);

  if (!stream) {
    throw new ApiError(404, "Live stream not found");
  }

  const isLiked = stream.likes.includes(req.user._id);

  if (isLiked) {
    stream.likes = stream.likes.filter((id) => !id.equals(req.user._id));
  } else {
    stream.likes.push(req.user._id);
  }

  await stream.save();

  res.status(200).json({
    success: true,
    isLiked: !isLiked,
    likeCount: stream.likes.length,
  });
});

// @desc    Add comment to live stream
// @route   POST /api/live/:id/comment
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const stream = await LiveStream.findById(req.params.id);

  if (!stream) {
    throw new ApiError(404, "Live stream not found");
  }

  stream.comments.push({
    author: req.user._id,
    content: content.trim(),
  });

  await stream.save();

  const updated = await LiveStream.findById(req.params.id).populate(
    "comments.author",
    "username fullName avatar"
  );

  res.status(201).json({
    success: true,
    comments: updated.comments,
  });
});

// @desc    End a live stream
// @route   POST /api/live/:id/end
// @access  Private
exports.endLiveStream = asyncHandler(async (req, res) => {
  const stream = await LiveStream.findById(req.params.id);

  if (!stream) {
    throw new ApiError(404, "Live stream not found");
  }

  if (stream.streamer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to end this stream");
  }

  stream.isLive = false;
  stream.endedAt = new Date();
  await stream.save();

  res.status(200).json({
    success: true,
    stream,
  });
});

// @desc    Get streamer's live streams
// @route   GET /api/live/streamer/:streamerId
// @access  Public
exports.getStreamerLiveStreams = asyncHandler(async (req, res) => {
  const streams = await LiveStream.find({ streamer: req.params.streamerId })
    .populate("streamer", "username fullName avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    streams,
  });
});
