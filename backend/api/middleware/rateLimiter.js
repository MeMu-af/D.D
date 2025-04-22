const rateLimit = require("express-rate-limit");

// Whitelist for development
const whitelist = process.env.RATE_LIMIT_WHITELIST ? 
  process.env.RATE_LIMIT_WHITELIST.split(',') : 
  ['127.0.0.1', '::1'];

// Default limiter
const defaultLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for whitelisted IPs
    if (whitelist.includes(req.ip)) return true;
    // Skip rate limiting for health checks
    if (req.path === '/health') return true;
    return false;
  }
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    success: false,
    error: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (whitelist.includes(req.ip)) return true;
    return false;
  }
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    error: "Too many uploads, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (whitelist.includes(req.ip)) return true;
    return false;
  }
});

module.exports = {
  default: defaultLimiter,
  auth: authLimiter,
  upload: uploadLimiter
};
