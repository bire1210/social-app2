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
} = require("../controller/postController");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const upload = require("../middleware/upload");

// Static routes MUST come before /:id
router.get("/feed", auth, getFeed);
router.get("/explore", optionalAuth, getExplorePosts);
router.get("/videos", optionalAuth, getVideoPosts);
router.get("/user/:userId", optionalAuth, getUserPosts);
router.post("/", auth, upload.single("image"), createPost);

// Dynamic :id routes LAST
router.get("/:id", optionalAuth, getPost);
router.put("/:id", auth, editPost);
router.delete("/:id", auth, deletePost);
router.post("/:id/like", auth, toggleLike);
router.post("/:id/react", auth, reactToPost);

module.exports = router;
