const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getExplorePosts,
  getPost,
  getUserPosts,
  deletePost,
  toggleLike,
} = require("../controller/postController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(auth); // All post routes require authentication

router.post("/", upload.single("image"), createPost);
router.get("/feed", getFeed);
router.get("/explore", getExplorePosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);
router.post("/:id/like", toggleLike);

module.exports = router;
