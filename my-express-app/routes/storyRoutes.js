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

router.use(auth);
router.get("/", getStories);
router.post("/", upload.single("image"), createStory);
router.post("/:id/view", viewStory);
router.delete("/:id", deleteStory);

// Story comments routes
router.post("/:id/comments", addStoryComment);
router.get("/:id/comments", getStoryComments);
router.delete("/:storyId/comments/:commentId", deleteStoryComment);

module.exports = router;
