const authService = require('../service/auth.service.js')
const { sendLogs } = require('../utils/helpers/logs.helper.js')
const { httpStatus } = require('../utils/helpers/variables.helper');
const { functionWrapper } = require("../utils/handlers.js");
const { handleError } = require("../utils/helpers/common.helper.js");
const { generateAvatar } = require("../utils/helpers/generateAvatar.js");
const crypto = require("crypto");
const bcrypt = require("bcrypt")
require("dotenv").config();

module.exports = {
    customLogin,
    customSignUp,
    googleLoginCallback,
    sendResetlinkToEmail,
    customResetPassword
}


/**
 * Handles user login authentication.
 *
 * @async
 * @function customLogin
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user login details
 * @param {string} req.body.email - User's email address
 * @param {Object} req.log - Logger instance for tracking events and errors
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function customLogin(req, res) {
    const {
        body: { email }, log } = req;

    try {
        /**
         * Authenticate user credentials.
         * This will throw an error internally if authentication fails.
         */
        const user = await authService.authenticateUser(req, "login");

        // Optional post-auth login processing (session tracking, last login update, etc.)
        await authService.loginUser(req, user);


        // Token payload (keep minimal for security reasons)
        const payload = { id: user.id, email: user.email };

        // Generate JWT access token and attach to response/session if needed
        const accessToken = await authService.generateAndSetUserTokens(payload);

        // Log successful authentication event
        sendLogs(log, "info", {
            message: "User login was successful",
            fnc: "customLogin",
            info: { email },
        });

        return res.status(httpStatus.OK.code).json({
            success: true,
            accessToken,
        });
    
    } catch (info) {
        /**
         * Normalize error message from service layer
         * Ensures frontend always receives a readable message
         */
        const message = info?.message || "Authentication failed";

        // Log failed login attempt for monitoring/debugging
        sendLogs(log, "info", {
            message,
            fnc: "customLogin",
            info: { email },
        });

        return res.status(httpStatus.NOT_ALLOWED.code).json({
            success: false,
            message,
        });
    }
}

/**
 * Handles user sign-up authentication.
 *
 * @async
 * @function customSignUp
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user sign-up details
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @param {string} req.body.name - User's full name
 * @param {Object} req.log - Logger instance for tracking events and errors
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function customSignUp(req, res) {
    const {
        body: { email, password, name }, log } = req;

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Avatar
        const { randomLetter, randomColor } = generateAvatar(email);

        // Check if user exists
        const options = {email}
        const existingUser = await functionWrapper(authService.findUser, [options], {
            customMessage: 'Service Error',
            codePath: 'service.findUser',
            extras: { options },
        });

        // CASE 1: Google user → set password
        if (existingUser && existingUser.googleId && !existingUser.password) {
            const updates = { password: hashedPassword };
            await functionWrapper(authService.updateUser, [existingUser, updates], {
                customMessage: 'Service Error',
                codePath: 'service.updateUser',
                extras: updates,
            });

            const payload = { id: existingUser._id, email: existingUser.email};
            const accessToken = await authService.generateAndSetUserTokens(payload);

            sendLogs(log, "info", {
                message: "Password set for Google user",
                fnc: "customSignUp",
                info: { email }
            });

            return res.status(httpStatus.OK.code).json({
                success: true,
                accessToken
            });
        }


        // CASE 2: User already exists
        if (existingUser) {
            return res.status(httpStatus.CONFLICT.code).json({
                message: "User already exists"
            });
        }

        // CASE 3: Create new user
        const userDetails = {
            email,
            password: hashedPassword,
            name,
            avatar: {
                profilePicBg: randomColor,
                profileLetter: randomLetter
            },
            subStatus: "Free",
            profilePicture: ""
        };

        const newUser = await authService.createUser(userDetails)

        const payload = {
            id: newUser._id,
            email: newUser.email
        };

        const accessToken = await authService.generateAndSetUserTokens(payload);

        sendLogs(log, "info", {
            message: "User created successfully",
            fnc: "customSignUp",
            info: { email }
        });

        return res.status(httpStatus.CREATED.code).json({
            success: true,
            accessToken
        });

    } catch (error) {
        handleError({
            loggerInstance: log,
            info: {
                fnc: "customSignUp",
                error,
                message: error.message,
                name: error.name,
                stack: error.stack
            }
        });

        return res.status(httpStatus.SERVER_ERROR.code).end();
    }
}

/**
 * Google OAuth callback handler.
 * @async
 * @function googleLoginCallback
 * @param {import("express").Request} req - Express request object containing Google payload
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>} Sends HTTP response with access token or error status
 */
async function googleLoginCallback(req, res) {
    // Extract request logger for structured logging
    const { log } = req;

    // Verified Google payload should come from middleware after Google token/code verification
    // Ideally this should be req.googlePayload instead of req.body for security
    const googlePayload = req.body;

    try {
        // Search for an existing user by verified Google email
        const options = { email: googlePayload.email };

        const user = await functionWrapper(authService.findUser, [options], {
            customMessage: "Service Error",
            codePath: "service.findUser",
            extras: { googlePayload },
        });

        let updatedUser;

        /**
         * CASE 1: USER DOES NOT EXIST → CREATE NEW ACCOUNT
         */
        if (!user) {
            // Use email as fallback source for avatar generation
            const nameSource = googlePayload?.email;

            // Generate random profile avatar settings
            const { randomLetter, randomColor } = generateAvatar(nameSource);

            // Default subscription plan for new users
            const subStatus = "Free";

            // Construct new user object from verified Google payload
            const userDetails = {
                email: googlePayload.email,
                name: googlePayload.firstName || googlePayload.name,
                googleId: googlePayload.sub,
                emailVerified: googlePayload.emailVerified,
                profilePicture: googlePayload.picture,
                subStatus,

                // Auto-generated fallback avatar
                avatar: {
                    profilePicBg: randomColor,
                    profileLetter: randomLetter,
                },
            };

            // Create new user in database
            const newUser = await authService.createUser(userDetails);

            // JWT payload for authentication token
            const payload = {
                id: newUser._id,
                email: newUser.email,
            };

            // Generate user access token
            const accessToken =
                await authService.generateAndSetUserTokens(payload);

            // Log successful registration
            const email = googlePayload.email;

            sendLogs(log, "info", {
                message: "Google auth created user successfully",
                fnc: "googleLoginCallback",
                info: { email },
            });

            // Return newly created auth token
            return res.status(httpStatus.CREATED.code).json({
                success: true,
                accessToken,
            });
        }

        /**
         * CASE 2: USER EXISTS → UPDATE GOOGLE DATA + LOGIN
         */
        if (user) {
            // Update existing user details with latest Google profile info
            const updates = {
                name: googlePayload.firstName,
                googleId: googlePayload.sub,
                emailVerified: googlePayload.emailVerified,
                profilePicture: googlePayload.picture,
            };

            // Save updates to database
            updatedUser = await functionWrapper(
                authService.updateUser,
                [user._id, updates],
                {
                    customMessage: "Service Error",
                    codePath: "service.updateUser",
                    extras: updates,
                }
            );

            // JWT payload for returning user
            const payload = {
                email: updatedUser.email,
                id: updatedUser.id,
            };

            // Generate fresh access token
            const accessToken =
                await authService.generateAndSetUserTokens(payload);

            // Log successful login
            const email = updatedUser.email;

            sendLogs(log, "info", {
                message: "Google auth updated user successfully",
                fnc: "googleLoginCallback",
                info: { email },
            });

            // Return login token
            return res.status(httpStatus.OK.code).json({
                success: true,
                accessToken,
            });
        }

        /**
         * FALLBACK CASE:
         * If neither create nor update succeeds
         */
        return res.status(httpStatus.CONFLICT.code).json({
            message: "User could not be created or updated.",
        });

    } catch (error) {
        /**
         * ERROR HANDLING
         * Logs detailed backend error for debugging
         */
        handleError({
            loggerInstance: log,
            info: {
                fnc: "googleLoginCallback",
                error,
                message: error.message,
                name: error.name,
                stack: error.stack,
            },
        });

        // Return generic server error
        res.status(httpStatus.SERVER_ERROR.code).end();
    }
}

/**
 * Sends a password reset link to the authenticated user's email address.
 *
 * @async
 * @function sendResetlinkToEmail
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.log - Logger instance
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function sendResetlinkToEmail(req, res) {
    // Extract authenticated user and logger from request
    const { user, log } = req;

    try {
        // Generate a secure random token (raw token sent to user via email)
        const resetToken = crypto.randomBytes(32).toString("hex");

        /**
         * Hash the token before storing in DB
         * This prevents attackers from using DB leaks to reset passwords
         */
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Set token expiry to 15 minutes from now
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        // Save updated user document with reset token + expiration
        await user.save();

        /**
         * Create password reset URL for frontend
         * Raw token is used here so frontend can send it back for verification
         */
        const resetUrl = `${process.env.FRONTEND_DOMAIN}/reset/${resetToken}`;
        console.log("Generated password reset URL:", resetUrl); // Debug log for generated URL

        // Prepare email payload
        const options = {
            recipientEmail: user.email,
            templateData: { resetUrl }
        };

        // Send reset email to user
        await authService.sendMailToUser(options);

        // Log successful email delivery
        sendLogs(log, "info", {
            message: "link sent successfully",
            fnc: "sendResetlinkToEmail",
            info: { resetUrl }
        });

        // Return success response
        res.status(httpStatus.OK.code).json({
            success: true
        });

    } catch (error) {
        /**
         * ERROR HANDLING:
         * Log detailed error for debugging
         */
        handleError({
            loggerInstance: log,
            info: {
                fnc: "sendResetlinkToEmail",
                error,
                user
            }
        });

        // Return generic server error response
        res.status(httpStatus.SERVER_ERROR.code).end();
    }
}

async function customResetPassword(req, res) {
    const { user, log } = req
    const {password} = req.body
    const { token } = req.params; 
    try {

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const options = { resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() }}

        const user = await authService.findUser(options)
            if (!user) {
                return res.status(httpStatus.BAD_REQUEST.code).json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendLogs(log, 'info', { message: 'Password reset successful', fnc: 'customResetPassword', info: { user } })
        res.status(httpStatus.OK.code).json({ success: true })
    } catch (error) {
        handleError({
            loggerInstance: log,
            info: {
                fnc: 'customResetPassword',
                error,
                user
            }
        })
        res.status(httpStatus.SERVER_ERROR.code).end()
    }
}








