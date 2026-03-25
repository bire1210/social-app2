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
const optionalAuth = require("../middleware/optionalAuth");
const upload = require("../middleware/upload");

// Public routes (guests can browse)
router.get("/explore", optionalAuth, getExplorePosts);
router.get("/user/:userId", optionalAuth, getUserPosts);
router.get("/:id", optionalAuth, getPost);

// Private routes (require authentication)
router.post("/", auth, upload.single("image"), createPost);
router.get("/feed", auth, getFeed);
router.delete("/:id", auth, deletePost);
router.post("/:id/like", auth, toggleLike);

module.exports = router;
