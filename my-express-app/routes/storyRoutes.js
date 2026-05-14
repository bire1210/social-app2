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

router
  .use(auth)
  .get("/", getStories)
  .post("/", upload.single("image"), createStory)
  .post("/:id/view", viewStory)
  .delete("/:id", deleteStory);

// Story comments routes
router

  .post("/:id/comments", addStoryComment)
  .get("/:id/comments", getStoryComments)
  .delete("/:storyId/comments/:commentId", deleteStoryComment);

module.exports = router;
