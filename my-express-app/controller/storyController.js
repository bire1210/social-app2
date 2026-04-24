const Story = require("../models/Story");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a story
// @route   POST /api/stories
// @access  Private
exports.createStory = asyncHandler(async (req, res) => {
  const { text, backgroundColor } = req.body;

  if (!req.file && !text?.trim()) {
    throw new ApiError(400, "Story must have an image or text");
  }

  const storyData = {
    author: req.user._id,
    text: text?.trim() || "",
    backgroundColor: backgroundColor || "#1877f2",
  };

  if (req.file) {
    storyData.image = `/uploads/${req.file.filename}`;
  }

  const story = await Story.create(storyData);
  const populated = await Story.findById(story._id).populate(
    "author",
    "username fullName avatar"
  );

  res.status(201).json({ success: true, story: populated });
});

// @desc    Get stories feed (own + following, not expired)
// @route   GET /api/stories
// @access  Private
exports.getStories = asyncHandler(async (req, res) => {
  const feedUsers = [...req.user.following, req.user._id];

  const stories = await Story.find({
    author: { $in: feedUsers },
    expiresAt: { $gt: new Date() },
  })
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 });

  // Group by author
  const grouped = {};
  stories.forEach((story) => {
    const authorId = story.author._id.toString();
    if (!grouped[authorId]) {
      grouped[authorId] = {
        author: story.author,
        stories: [],
        hasUnviewed: false,
      };
    }
    grouped[authorId].stories.push(story);
    if (!story.viewers.includes(req.user._id)) {
      grouped[authorId].hasUnviewed = true;
    }
  });

  res.status(200).json({
    success: true,
    storyGroups: Object.values(grouped),
  });
});

// @desc    Mark a story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
exports.viewStory = asyncHandler(async (req, res) => {
  await Story.findByIdAndUpdate(req.params.id, {
    $addToSet: { viewers: req.user._id },
  });
  res.status(200).json({ success: true });
});

// @desc    Delete own story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) throw new ApiError(404, "Story not found");
  if (story.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }
  await Story.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true });
});
