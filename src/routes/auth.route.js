const express = require("express");
const router = express.Router();

/**
 * routesWrapper
 * ----------------
 * A higher-order wrapper that executes middleware/controller chains safely.
 * Typically handles:
 * - async error catching
 * - standardized request flow
 */
const { routesWrapper } = require('../utils/handlers');

/**
 * Feature flags middleware
 * ------------------------
 * These control whether specific auth flows are enabled/allowed.
 */
const {
    signUpFlag,
    loginFlag,
    googleAuthFlag,
    forgotPasswordFlag,
    resetPasswordFlag
} = require('../middlewares/flags.middleware');

/**
 * Validation middleware
 * ---------------------
 * Ensures incoming request data is valid before reaching controllers.
 */
const {
    validateLoginData,
    validateSignUpData,
    validateGoogleLoginCallbackData,
    validateEmailSyntax,
    validatePasswordSyntax,
    validateIfPasswordMatches,
    validateTokenSyntax
} = require('../middlewares/validate.middleware');

/**
 * Auth controllers
 * ----------------
 * Core business logic for authentication flows.
 */
const {
    customLogin,
    customSignUp,
    googleLoginCallback,
    sendResetlinkToEmail,
    customResetPassword
} = require("../controllers/auth.controller");

/**
 * User verification middleware
 * ----------------------------
 * Ensures user exists/valid before sensitive operations like password reset.
 */
const { verifyUserWithEmail, verifyGoogleAuthCode } = require("../middlewares/verification.middleware");

// Rate limiting middleware for auth routes (prevents abuse like brute-force login and password reset spam)
const { authSlowDown, authLimiter, forgotPasswordLimiter } = require("../middlewares/rateLimit.middleware");

/**
 * AUTH ROUTES
 * ============
 * All authentication-related endpoints.
 */

/**
 * Login route
 * - checks feature flag
 * - validates login input
 * - executes login controller
 */
router.post('/login', routesWrapper([authSlowDown, authLimiter, loginFlag, validateLoginData, customLogin]));

/**
 * Register route
 * - checks signup feature flag
 * - validates signup payload
 * - creates new user account
 */
router.post('/register', routesWrapper([authSlowDown, authLimiter, signUpFlag, validateSignUpData, customSignUp]));

/**
 * Google OAuth callback
 * - validates Google response payload
 * - handles social login/signup
 */
router.post('/google/callback', routesWrapper([
    googleAuthFlag,
    validateGoogleLoginCallbackData,
    verifyGoogleAuthCode,
    googleLoginCallback
]));

/**
 * Forgot password
 * - validates email format
 * - verifies user exists
 * - sends password reset link
 */
router.post('/forgot-password', routesWrapper([
    forgotPasswordLimiter,
    forgotPasswordFlag,
    validateEmailSyntax,
    verifyUserWithEmail,
    sendResetlinkToEmail
]));

/**
 * Reset password
 * - validates feature flag
 * - validates token + password rules
 * - confirms password match rules
 * - updates user password
 */
router.post('/reset/:token', routesWrapper([
    resetPasswordFlag,
    validateIfPasswordMatches,
    validatePasswordSyntax,
    validateTokenSyntax,
    customResetPassword
]));

module.exports = router;