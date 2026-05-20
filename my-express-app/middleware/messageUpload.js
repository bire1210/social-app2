const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/messages");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `message-${uniqueSuffix}${ext}`);
  },
});

// Optimized file type mapping for better performance
const FILE_TYPE_MAP = new Map([
  // Images
  ["image/jpeg", "image"],
  ["image/jpg", "image"],
  ["image/png", "image"],
  ["image/gif", "image"],
  ["image/webp", "image"],
  ["image/svg+xml", "image"],

  // Videos
  ["video/mp4", "video"],
  ["video/mpeg", "video"],
  ["video/quicktime", "video"],
  ["video/x-msvideo", "video"], // .avi
  ["video/webm", "video"],

  // Audio
  ["audio/mpeg", "audio"], // .mp3
  ["audio/wav", "audio"],
  ["audio/ogg", "audio"],
  ["audio/mp4", "audio"], // .m4a
  ["audio/webm", "audio"],

  // Documents
  ["application/pdf", "document"],
  ["application/msword", "document"], // .doc
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "document",
  ], // .docx
  ["application/vnd.ms-excel", "document"], // .xls
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "document",
  ], // .xlsx
  ["application/vnd.ms-powerpoint", "document"], // .ppt
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "document",
  ], // .pptx
  ["text/plain", "document"], // .txt
  ["text/csv", "document"],
  ["application/rtf", "document"],

  // Archives
  ["application/zip", "file"],
  ["application/x-rar-compressed", "file"],
  ["application/x-7z-compressed", "file"],
  ["application/gzip", "file"],

  // Other common files
  ["application/json", "file"],
  ["application/xml", "file"],
  ["text/xml", "file"],
]);

// File filter with better performance
const fileFilter = (req, file, cb) => {
  const fileCategory = FILE_TYPE_MAP.get(file.mimetype);

  if (fileCategory) {
    req.fileCategory = fileCategory;
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1, // Only one file at a time
  },
});

// Enhanced error handling middleware
const handleUploadError = (error, req, res, next) => {
  // Clean up uploaded file if there's an error
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to clean up file:", err);
    });
  }

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 50MB.",
          code: "FILE_TOO_LARGE",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Only one file allowed.",
          code: "TOO_MANY_FILES",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name. Use "file" as the field name.',
          code: "INVALID_FIELD_NAME",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "File upload error.",
          code: "UPLOAD_ERROR",
        });
    }
  }

  if (error.message.includes("File type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: "UNSUPPORTED_FILE_TYPE",
    });
  }

  next(error);
};

module.exports = { upload, handleUploadError };
