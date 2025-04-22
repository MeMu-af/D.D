/**
 * @module multerMiddleware
 * @description Middleware for handling file uploads with multer
 * @requires multer
 * @requires path
 * @requires fs
 * @requires crypto
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_FILE_AGE = 24; // hours

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * Allowed MIME types and their corresponding extensions
 * @type {Object<string, string>}
 */
const allowedMimeTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov'
};

/**
 * Cleans up files older than MAX_FILE_AGE from the uploads directory
 * @function cleanupOldFiles
 * @private
 */
const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      try {
        const stats = fs.statSync(filePath);
        const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        if (fileAge > MAX_FILE_AGE) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupOldFiles, CLEANUP_INTERVAL);

/**
 * Sanitizes filenames by replacing invalid characters with underscores
 * @function sanitizeFilename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 * @private
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Multer storage configuration
 * @type {multer.StorageEngine}
 */
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

/**
 * Multer upload configuration
 * @type {multer.Multer}
 * 
 * @example
 * // In your route:
 * router.post('/upload', upload.single('file'), (req, res) => {
 *   // Handle uploaded file
 *   res.json({ filename: req.file.filename });
 * });
 */
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!allowedMimeTypes[file.mimetype]) {
      return cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return cb(new Error(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (!Object.values(allowedMimeTypes).includes(ext)) {
      return cb(new Error('Invalid file extension.'), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

module.exports = upload; 