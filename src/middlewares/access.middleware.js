const { httpStatus } = require('../utils/helpers/variables.helper.js')
const { handleError } = require('../utils/helpers/common.helper.js')
const { verifyToken, getToken, verifyUser } = require('../utils/helpers/middlewares.helper.js')
const { sendLogs } = require('../utils/helpers/logs.helper.js')

module.exports = {
    authenticateUser
}

async function authenticateUser(req, res, next) {
    const { log } = req
    try {
        const accessToken = getToken(req)
        // Log the access token to verify it's being retrieved correctly
        if (accessToken === null) {
            sendLogs(log, 'info', {
                message: 'validation failed',
                fnc: 'authenticateUser',
                info: { accessToken, tokenError: 'no access token provided' }
            })

            return res.status(httpStatus.UNAUTHORIZED.code).end()
        }

        const verifiedAccessToken = await verifyToken(accessToken)

        if (!verifiedAccessToken.error) {
            // const { isTokenValid, refreshToken } = await checkTokenValidity(accessToken)

            // if (!isTokenValid) {
            //     sendLogs(log, 'info', {
            //         message: refreshToken ? 'access token is valid but is not equal to current refresh token' : 'refresh token does not exist',
            //         fnc: 'authenticateUser',
            //         info: { isTokenValid, accessToken, refreshToken }
            //     })
            //     return res.status(httpStatus.UNAUTHORIZED.code).end()
            // }

            const user = await verifyUser({
                id: verifiedAccessToken.value.id,
                email: verifiedAccessToken.value.email
            })

            if (!user) {
                sendLogs(log, 'info', {
                    message: 'access token is valid, but user does not exist',
                    fnc: 'authenticateUser',
                    info: { accessToken }
                })
                return res.status(httpStatus.UNAUTHORIZED.code).end()
            }

            req.user = user

            return next()
        }

        sendLogs(log, 'info', {
            message: 'validation failed',
            fnc: 'authenticateUser',
            info: { accessToken, tokenError: verifiedAccessToken.error }
        })

        return res.status(httpStatus.UNAUTHORIZED.code).end()
    } catch (error) {
        handleError({ loggerInstance: log, info: { fnc: 'authenticateUser', error } })
        res.status(httpStatus.SERVER_ERROR.code).end()
    }
}
