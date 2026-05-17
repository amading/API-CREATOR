// ============================================================
// RATE LIMITER MIDDLEWARE — Anti-spam at Anti-DDoS
// Awtomatiko itong gumagana, hindi mo na kailangang baguhin
// ============================================================

const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const config = require("../config/config");

// -------------------------------------------------------
// PANGKARANIWANG RATE LIMITER — Para sa lahat ng routes
// -------------------------------------------------------
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: config.RATE_LIMIT.MESSAGE,
    retryAfter: "15 minuto",
  },
  // Isulat sa console kung sino ang na-rate limit
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT] IP: ${req.ip} | Route: ${req.path}`);
    res.status(429).json(options.message);
  },
});

// -------------------------------------------------------
// AUTH RATE LIMITER — Para sa /login at /register (mas mahigpit)
// -------------------------------------------------------
const authLimiter = rateLimit({
  windowMs: config.AUTH_RATE_LIMIT.WINDOW_MS,
  max: config.AUTH_RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: config.AUTH_RATE_LIMIT.MESSAGE,
  },
  handler: (req, res, next, options) => {
    console.warn(`[AUTH LIMIT] Brute force attempt from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// -------------------------------------------------------
// SPEED LIMITER — Pabagalin ang mabilis na requests (Anti-DDoS)
// -------------------------------------------------------
const speedLimiter = slowDown({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  delayAfter: config.SLOW_DOWN.DELAY_AFTER,
  delayMs: () => config.SLOW_DOWN.DELAY_MS,
});

module.exports = { generalLimiter, authLimiter, speedLimiter };
