const { httpStatus } = require('../utils/helpers/variables.helper')
const { handleError } = require('../utils/helpers/common.helper')
const UserRepo = require('../repositories/User.repository')
const { sendLogs } = require('../utils/helpers/logs.helper.js')
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config()

/**
 * Exported authentication/verification middlewares
 */
module.exports = {
  verifyUserWithEmail,
  verifyGoogleAuthCode
}

/**
 * Middleware to verify if a user exists using email
 * 
 * Flow:
 * - Extracts email from request body
 * - Queries database for user
 * - Attaches user to req.user if found
 * - Proceeds to next middleware
 * 
 * Failure:
 * - Returns NOT_ALLOWED if user not found
 * - Logs error and returns SERVER_ERROR on exception
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function verifyUserWithEmail (req, res, next) {
  try {
    const email = req.body.email
    const options = { email }

    /**
     * Fetch user from repository
     */
    const user = await UserRepo.find(options)

    /**
     * Handle user not found
     */
    if (!user) {
      sendLogs(req.log, 'info', {
        message: 'user was not found',
        fnc: 'verifyUserWithEmail',
        info: { email }
      })

      return res.status(httpStatus.NOT_ALLOWED.code).end()
    }

    /**
     * Attach user to request for downstream usage
     */
    req.user = user

    next()
  } catch (error) {
    /**
     * Handle unexpected errors
     */
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'verifyUserWithEmail',
        error
      }
    })

    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

/**
 * Middleware to verify Google OAuth authorization code
 * 
 * Flow:
 * - Exchanges Google auth code for tokens
 * - Verifies ID token with Google
 * - Extracts user payload from token
 * - Replaces req.body with Google user payload
 * 
 * Failure:
 * - Returns UNAUTHORIZED if token/payload invalid
 * - Returns SERVER_ERROR on unexpected failure
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function verifyGoogleAuthCode(req, res, next) {
  try {
    const { googleAuthcode } = req.body

    /**
     * Initialize Google OAuth client
     */
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "postmessage"
    )

    /**
     * Exchange auth code for tokens
     */
    const { tokens } = await client.getToken(googleAuthcode)

    /**
     * Validate ID token existence
     */
    if (!tokens.id_token) {
      return res.status(httpStatus.UNAUTHORIZED.code).json({
        message: "Failed to retrieve Google ID token",
      })
    }

    /**
     * Verify ID token and extract payload
     */
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const googlePayload = ticket.getPayload()

    /**
     * Validate payload
     */
    if (!googlePayload) {
      return res.status(httpStatus.UNAUTHORIZED.code).json({
        message: "Invalid Google token payload",
      })
    }

    /**
     * Replace request body with Google user data
     */
    req.body = googlePayload

    next()
  } catch (error) {
    /**
     * Handle unexpected errors
     */
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: "verifyGoogleAuthCode",
        error,
      },
    })

    return res.status(httpStatus.SERVER_ERROR.code).json({
      message: "Google authentication failed",
    })
  }
}