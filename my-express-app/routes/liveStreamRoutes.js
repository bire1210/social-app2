const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const {
  getLiveStreams,
  getLiveStream,
  startLiveStream,
  addViewer,
  likeLiveStream,
  addComment,
  endLiveStream,
  getStreamerLiveStreams,
} = require("../controller/liveStreamController");

// Public routes
router.get("/", getLiveStreams);
router.get("/:id", optionalAuth, getLiveStream);
router.get("/streamer/:streamerId", getStreamerLiveStreams);

// Private routes
router.use(auth);
router.post("/start", startLiveStream);
router.post("/:id/view", addViewer);
router.post("/:id/like", likeLiveStream);
router.post("/:id/comment", addComment);
router.post("/:id/end", endLiveStream);

module.exports = router;
