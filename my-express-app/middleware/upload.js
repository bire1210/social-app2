const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|webm|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase();

  const isImage = imageTypes.test(ext) && imageTypes.test(file.mimetype);
  const isVideo = videoTypes.test(ext) || file.mimetype.startsWith("video/");

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files (jpeg, jpg, png, gif, webp) and video files (mp4, webm, mov) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (for videos)
  },
});

module.exports = upload;
