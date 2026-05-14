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
router
  .get("/", getLiveStreams)
  .get("/:id", optionalAuth, getLiveStream)
  .get("/streamer/:streamerId", getStreamerLiveStreams);

// Private routes
router
  .use(auth)
  .post("/start", startLiveStream)
  .post("/:id/view", addViewer)
  .post("/:id/like", likeLiveStream)
  .post("/:id/comment", addComment)
  .post("/:id/end", endLiveStream);

module.exports = router;
