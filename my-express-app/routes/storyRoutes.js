const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createStory,
  getStories,
  viewStory,
  deleteStory,
} = require("../controller/storyController");

router.use(auth);
router.get("/", getStories);
router.post("/", upload.single("image"), createStory);
router.post("/:id/view", viewStory);
router.delete("/:id", deleteStory);

module.exports = router;
