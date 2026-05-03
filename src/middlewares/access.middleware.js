const { httpStatus } = require('../utils/helpers/variables.helper.js')
const { handleError } = require('../utils/helpers/common.helper.js')
const { verifyToken, getToken, verifyUser } = require('../utils/helpers/middlewares.helper.js')
const { sendLogs } = require('../utils/helpers/logs.helper.js')

/**
 * Exported authentication middleware
 */
module.exports = {
    authenticateUser
}

/**
 * Middleware to authenticate a user via JWT access token
 * 
 * Flow:
 * 1. Extract token from request headers
 * 2. Verify token validity
 * 3. Fetch user from database using decoded token payload
 * 4. Attach user to req.user if valid
 * 
 * Failure cases:
 * - No token provided → 401 Unauthorized
 * - Invalid/expired token → 401 Unauthorized
 * - Token valid but user not found → 401 Unauthorized
 * - Unexpected error → 500 Server Error
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authenticateUser(req, res, next) {
    const { log } = req

    try {
        /**
         * Extract access token from request
         */
        const accessToken = getToken(req)

        /**
         * Handle missing token
         */
        if (accessToken === null) {
            sendLogs(log, 'info', {
                message: 'validation failed',
                fnc: 'authenticateUser',
                info: { accessToken, tokenError: 'no access token provided' }
            })

            return res.status(httpStatus.UNAUTHORIZED.code).end()
        }

        /**
         * Verify token
         */
        const verifiedAccessToken = await verifyToken(accessToken)
        console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', verifiedAccessToken) // Debug log for token extraction
        if (!verifiedAccessToken.error) {
            /**
             * Optional: token validity check against stored refresh token
             * (currently commented out)
             */

            /**
             * Fetch user based on token payload
             */
            const user = await verifyUser({
                _id: verifiedAccessToken.value.id
            })

            /**
             * Handle case where user no longer exists
             */
            if (!user) {
                sendLogs(log, 'info', {
                    message: 'access token is valid, but user does not exist',
                    fnc: 'authenticateUser',
                    info: { accessToken }
                })

                return res.status(httpStatus.UNAUTHORIZED.code).end()
            }

            /**
             * Attach user to request object
             */
            req.user = user

            return next()
        }

        /**
         * Handle invalid token
         */
        sendLogs(log, 'info', {
            message: 'validation failed',
            fnc: 'authenticateUser',
            info: { accessToken, tokenError: verifiedAccessToken.error }
        })

        return res.status(httpStatus.UNAUTHORIZED.code).end()
    } catch (error) {
        /**
         * Handle unexpected errors
         */
        handleError({
            loggerInstance: log,
            info: { fnc: 'authenticateUser', error }
        })

        res.status(httpStatus.SERVER_ERROR.code).end()
    }
}