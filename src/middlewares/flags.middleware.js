const { httpStatus } = require('../utils/helpers/variables.helper')
require('dotenv').config()

/**
 * Exported feature flag middlewares
 */
module.exports = {
  signUpFlag,
  loginFlag,
  googleAuthFlag,
  getUserFlag,
  forgotPasswordFlag,
  resetPasswordFlag
}

/**
 * Middleware to control custom signup feature availability
 * Blocks request if FEATURE_CUSTOM_SIGNUP is disabled
 */
function signUpFlag (req, res, next) {
    if (process.env.FEATURE_CUSTOM_SIGNUP === 'false') {
        return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
    }
  next()
}

/**
 * Middleware to control custom login feature availability
 * Blocks request if FEATURE_CUSTOM_LOGIN is disabled
 */
function loginFlag (req, res, next) {
    if (process.env.FEATURE_CUSTOM_LOGIN === 'false') {
        return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
    }
  next()
}

/**
 * Middleware to control Google authentication feature availability
 * Blocks request if FEATURE_GOOGLE_AUTH is disabled
 */
function googleAuthFlag (req, res, next) {
    if (process.env.FEATURE_GOOGLE_AUTH === 'false') {
        return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
    }
  next()
}

/**
 * Middleware to control user retrieval feature availability
 * Blocks request if FEATURE_GET_USER is disabled
 */
function getUserFlag(req, res, next) {
    if (process.env.FEATURE_GET_USER === 'false') {
        return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
    }
  next()
}

/**
 * Middleware to control forgot password feature availability
 * Blocks request if FEATURE_FORGOT_PASSWORD is disabled
 */
function forgotPasswordFlag(req, res, next) {
    if (process.env.FEATURE_FORGOT_PASSWORD === 'false') {
        return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
    }
  next()
}

/**
 * Middleware to control reset password feature availability
 * Blocks request if FEATURE_RESET_PASSWORD is disabled
 */
function resetPasswordFlag(req, res, next) {
    if (process.env.FEATURE_RESET_PASSWORD === 'false') {
        return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
    }
  next()
}