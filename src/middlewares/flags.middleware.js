const { httpStatus } = require('../utils/helpers/variables.helper')
require('dotenv').config()

module.exports = {
  signUpFlag,
  loginFlag,
  googleAuthFlag,
  getUserFlag,
  forgotPasswordFlag,
  resetPasswordFlag
}

function signUpFlag (req, res, next) {
  if (process.env.FEATURE_CUSTOM_SIGNUP === 'false') return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
  next()
}

function loginFlag (req, res, next) {
  if (process.env.FEATURE_CUSTOM_LOGIN === 'false') return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
  next()
}

function googleAuthFlag (req, res, next) {
  if (process.env.FEATURE_GOOGLE_AUTH === 'false') return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
  next()
}

function getUserFlag(req, res, next) {
  if (process.env.FEATURE_GET_USER === 'false') return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
  next()
}

function forgotPasswordFlag(req, res, next) {
  if (process.env.FEATURE_FORGOT_PASSWORD === 'false') return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
  next()
}

function resetPasswordFlag(req, res, next) {
  if (process.env.FEATURE_RESET_PASSWORD === 'false') return res.status(httpStatus.SERVICE_UNAVAILABLE.code).end()
  next()
}
