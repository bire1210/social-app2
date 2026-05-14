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

// Public routes - specific routes BEFORE parameterized routes
router
  .get("/", getLiveStreams)
  .get("/streamer/:streamerId", getStreamerLiveStreams)
  .get("/:id", optionalAuth, getLiveStream);

// Private routes - specific routes BEFORE parameterized routes
router
  .use(auth)
  .post("/start", startLiveStream)
  .post("/:id/view", addViewer)
  .post("/:id/like", likeLiveStream)
  .post("/:id/comment", addComment)
  .post("/:id/end", endLiveStream);

module.exports = router;
