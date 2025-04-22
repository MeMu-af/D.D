const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cleanup old files (older than 24 hours)
const cleanupOldFiles = () => {
  const files = fs.readdirSync(uploadDir);
  const now = Date.now();
  
  files.forEach(file => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60); // hours
    
    if (fileAge > 24) {
      fs.unlinkSync(filePath);
    }
  });
};

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const sanitizedFilename = sanitizeFilename(file.originalname);
    cb(null, `${uniqueSuffix}-${sanitizedFilename}`);
  },
});

// Allowed file types
const allowedMimeTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov'
};

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!allowedMimeTypes[file.mimetype]) {
      return cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return cb(new Error('File size too large. Maximum size is 10MB.'), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = Object.values(allowedMimeTypes);
    if (!allowedExtensions.includes(ext.substring(1))) {
      return cb(new Error('Invalid file extension.'), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Only one file at a time
  }
});

module.exports = upload;
