const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 'Too many requests. Please try again later.', 429);
  },
});

/**
 * Auth route rate limiter
 * Stricter: 10 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many authentication attempts. Please try again in 15 minutes.',
      429
    );
  },
});

/**
 * OTP Verification rate limiter
 * 5 attempts per 15 minutes (maps to OTP lockout policy)
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many OTP verification attempts. Your session is locked for 15 minutes.',
      429
    );
  },
});

module.exports = { generalLimiter, authLimiter, otpLimiter };
