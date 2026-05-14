const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createStory,
  getStories,
  viewStory,
  deleteStory,
  addStoryComment,
  getStoryComments,
  deleteStoryComment,
} = require("../controller/storyController");

// All story routes require auth
router
  .use(auth)
  // Specific routes BEFORE parameterized routes
  .get("/", getStories)
  .post("/", upload.single("image"), createStory)
  // Story-specific routes
  .post("/:id/view", viewStory)
  .delete("/:id", deleteStory)
  // Story comments routes - specific routes BEFORE parameterized routes
  .post("/:id/comments", addStoryComment)
  .get("/:id/comments", getStoryComments)
  .delete("/:storyId/comments/:commentId", deleteStoryComment);

module.exports = router;
