const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getExplorePosts,
  getVideoPosts,
  getPost,
  getUserPosts,
  deletePost,
  editPost,
  toggleLike,
  reactToPost,
  getUserLikedPosts,
} = require("../controller/postController");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const upload = require("../middleware/upload");

// Static routes MUST come before /:id
router
  .get("/feed", auth, getFeed)
  .get("/explore", optionalAuth, getExplorePosts)
  .get("/videos", optionalAuth, getVideoPosts)
  .get("/user/:userId/liked", optionalAuth, getUserLikedPosts)
  .get("/user/:userId", optionalAuth, getUserPosts)
  .post("/", auth, upload.single("image"), createPost);

// Dynamic :id routes LAST
router
  .get("/:id", optionalAuth, getPost)
  .put("/:id", auth, editPost)
  .delete("/:id", auth, deletePost)
  .post("/:id/like", auth, toggleLike)
  .post("/:id/react", auth, reactToPost);

module.exports = router;
