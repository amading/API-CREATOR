const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const config = require("../config/config");

const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: config.RATE_LIMIT.MESSAGE },
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT] IP: ${req.ip} | Route: ${req.path}`);
    res.status(429).json(options.message);
  },
});

const authLimiter = rateLimit({
  windowMs: config.AUTH_RATE_LIMIT.WINDOW_MS,
  max: config.AUTH_RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: config.AUTH_RATE_LIMIT.MESSAGE },
  handler: (req, res, next, options) => {
    console.warn(`[AUTH LIMIT] Brute force attempt from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

const speedLimiter = slowDown({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  delayAfter: config.SLOW_DOWN.DELAY_AFTER,
  delayMs: () => config.SLOW_DOWN.DELAY_MS,
});

module.exports = { generalLimiter, authLimiter, speedLimiter };
