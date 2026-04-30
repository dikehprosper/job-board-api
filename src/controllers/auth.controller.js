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

async function googleLoginCallback(req, res) {
    const { transaction, log } = req;
    const userData = req.body;
    try {
        const options = { email: userData.email}
        const user = await functionWrapper(authService.findUser, [options], {
            customMessage: 'Service Error',
            codePath: 'service.findUser',
            extras: { userData },
        });

        let updatedUser;

        if (!user) {
            const { randomLetter, randomColor } = generateAvatar(userData);

            const subStatus = 'Free';
            const userDetails = {
                email: userData.email,
                firstName: userData.firstName,
                googleId: userData.googleId,
                emailVerified: userData.emailVerified,
                profilePicture: userData.picture,
                subStatus,
                username: "",
                avatar: {
                    profilePicBg: randomColor,
                    profileLetter: randomLetter
                }
            };

            const [createdUser, created] = await authService.createUser(userDetails);

            const payload = { email: createdUser.dataValues.email, id: createdUser.dataValues.id };
            if (created) {
                const accessToken = await authService.generateAndSetUserTokens(payload);
                const email = userData.email;
                sendLogs(log, 'info', { message: 'Google auth created user successfully', fnc: 'customSignUp', info: { email } });
                await transaction.commit();
                return res.status(httpStatus.CREATED.code).json({ accessToken });
            }
        }

        if (user) {
            const updates = {
                firstName: userData.firstName,
                googleId: userData.googleId,
                emailVerified: userData.emailVerified,
                profilePicture: userData.picture,
            };

            updatedUser = await functionWrapper(authService.updateUser, [user, updates], {
                customMessage: 'Service Error',
                codePath: 'service.updateUser',
                extras: updates,
            });

            const payload = { email: updatedUser.email, id: updatedUser.id };
            const accessToken = await authService.generateAndSetUserTokens(payload);
            const email = updatedUser.email;
            sendLogs(log, 'info', { message: 'Google auth created user successfully', fnc: 'customSignUp', info: { email } });
            return res.status(httpStatus.OK.code).json({ success: true, accessToken });
        }

        // If neither user is created nor updated, rollback
        return res.status(httpStatus.CONFLICT.code).json({ message: 'User could not be created or updated.' });
    } catch (error) {
        handleError({
            loggerInstance: log,
            info: {
                fnc: 'googleLoginCallback',
                error,
                message: error.message,
                name: error.name,
                stack: error.stack,
            },
        });
        res.status(httpStatus.SERVER_ERROR.code).end();
    }
}

async function sendResetlinkToEmail(req, res) {
    const { user, log } = req

    try {
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_DOMAIN}/reset/${resetToken}`;

        const options = { recipientEmail: user.email, templateData: { resetUrl } }
        await authService.sendMailToUser(options)
        sendLogs(log, 'info', { message: 'link sent successfully', fnc: 'sendResetlinkToEmail', info: { resetUrl } })
        res.status(httpStatus.OK.code).json({ success: true })
    } catch (error) {
        handleError({
            loggerInstance: log,
            info: {
                fnc: 'sendResetlinkToEmail',
                error,
                user
            }
        })
        res.status(httpStatus.SERVER_ERROR.code).end()
    }
}

async function customResetPassword(req, res) {
    const { user, log } = req
    const {password} = req.body

    try {
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
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








