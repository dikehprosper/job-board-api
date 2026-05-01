const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

/**
 * GLOBAL RATE LIMITER
 * -------------------
 * Applies general request limits across the entire API.
 *
 * Purpose:
 * - Prevents abuse, spam, and accidental overload of the server.
 * - Acts as a first layer of defense against DDoS-like behavior.
 *
 * Behavior:
 * - Allows up to 300 requests per IP within a 15-minute window.
 * - After the limit is exceeded, further requests are blocked temporarily.
 *
 * Notes:
 * - `standardHeaders`: Enables modern rate limit headers (recommended).
 * - `legacyHeaders`: Disables deprecated headers for cleaner responses.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
});

/**
 * AUTH RATE LIMITER
 * -----------------
 * Strict limiter for authentication-related endpoints (login, signup).
 *
 * Purpose:
 * - Prevents brute-force attacks (e.g., password guessing).
 * - Protects user accounts from repeated login attempts.
 *
 * Behavior:
 * - Allows only 10 requests per IP within a 15-minute window.
 * - Blocks further attempts once the limit is reached.
 *
 * Recommended Usage:
 * - Apply to routes like `/login`, `/register`, `/google/callback`.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // strict for login/signup
    message: {
        success: false,
        message: "Too many authentication attempts. Try again later.",
    },
});

/**
 * AUTH SLOW DOWN (THROTTLING)
 * ---------------------------
 * Gradually delays responses instead of blocking immediately.
 *
 * Purpose:
 * - Adds friction for repeated requests without harshly blocking users.
 * - Reduces server load and discourages automated abuse.
 *
 * Behavior:
 * - First 5 requests are processed normally.
 * - After that, each request is delayed progressively:
 *   delay = number of hits * 500ms
 *
 * Example:
 * - 6th request → 3 seconds delay
 * - 10th request → 5 seconds delay
 *
 * Recommended Usage:
 * - Combine with `authLimiter` for layered protection.
 */
const authSlowDown = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 5, // allow 5 requests fast
    delayMs: (hits) => hits * 500, // gradually slow down
});

/**
 * FORGOT PASSWORD LIMITER
 * -----------------------
 * Very strict limiter for password reset requests.
 *
 * Purpose:
 * - Prevents abuse of the password reset system.
 * - Stops attackers from spamming reset emails to users.
 *
 * Behavior:
 * - Allows only 5 requests per IP within 1 hour.
 * - Blocks further requests once the limit is exceeded.
 *
 * Recommended Usage:
 * - Apply to `/forgot-password` endpoint only.
 */
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: "Too many reset requests. Try again later.",
    },
});

module.exports = {
    globalLimiter,
    authLimiter,
    authSlowDown,
    forgotPasswordLimiter,
};