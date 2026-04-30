const { userSchemaParentJoiObject, httpStatus } = require('../utils/helpers/variables.helper.js')
const validatorHelper = require('../utils/helpers/validators.helper.js')
const { handleError } = require('../utils/helpers/common.helper.js')
const { sendLogs } = require('../utils/helpers/logs.helper.js')

require('dotenv').config()

module.exports = {
  validateLoginData,
  validateSignUpData,
  validateGoogleLoginCallbackData,
  validateEmailSyntax,
  validatePasswordSyntax,
  validateIfPasswordMatches,
  validateTokenSyntax
}


function validateLoginData (req, res, next) {
  try {
    const { email, password } = req.body
    const userSchema = validatorHelper.createSchemaChildJoiObject(userSchemaParentJoiObject, ['password', 'email'])
    const { error: userValidationError, value: validatedUserData } = userSchema.validate({ email, password })

    if (userValidationError) {
      sendLogs(req.log, 'info', { message: 'Login Validation Error', fnc: 'validateLoginData', info: { error: userValidationError } })
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }

    req.body.email = validatedUserData.email
    req.body.password = validatedUserData.password

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validateLoginData',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

function validateSignUpData(req, res, next) {
  try {
    const { email, password, name } = req.body
    const userSchema = validatorHelper.createSchemaChildJoiObject(userSchemaParentJoiObject, ['password', 'email', 'name'])
    const { error: userValidationError, value: validatedUserData } = userSchema.validate({ email, password, name })

    if (userValidationError) {
      sendLogs(req.log, 'info', { message: 'Signup Validation Error', fnc: 'validateSignUpData', info: { error: userValidationError } })
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }

    req.body.email = validatedUserData.email
    req.body.password = validatedUserData.password
    req.body.name = validatedUserData.name

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validateSignUpData',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

function validateGoogleLoginCallbackData(req, res, next) {
  try {
    const { email, emailVerified, firstName, picture, googleId } = req.body
    const userSchema = validatorHelper.createSchemaChildJoiObject(userSchemaParentJoiObject, ['email', 'emailVerified', 'firstName', 'picture', 'googleId'])
    const { error: userValidationError, value: validatedUserData } = userSchema.validate({ email, emailVerified, firstName, picture, googleId })

    if (userValidationError) {
      sendLogs(req.log, 'info', { message: 'Google Auth Validation Error', fnc: 'validateGoogleLoginCallbackData', info: { error: userValidationError }})
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }
    req.body = { email: validatedUserData.email, firstName: validatedUserData.firstName, picture: validatedUserData.picture, googleId: validatedUserData.googleId, emailVerified: validatedUserData.emailVerified }

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validateGoogleLoginCallbackData',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

function validateEmailSyntax(req, res, next) {

  try {
    const { email } = req.body
    const userSchema = validatorHelper.createSchemaChildJoiObject(userSchemaParentJoiObject, ['email'])
    const { error: userValidationError, value: validatedUserData } = userSchema.validate({ email })

    if (userValidationError) {
      sendLogs(req.log, 'info', { message: 'Email Validation Error', fnc: 'validateEmailSyntax', info: { error: userValidationError } })
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }

    req.body.email = validatedUserData.email

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validateEmailSyntax',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

function validatePasswordSyntax(req, res, next) {
  
  try {
    const { password } = req.body
    const userSchema = validatorHelper.createSchemaChildJoiObject(userSchemaParentJoiObject, ['password'])
    const { error: userValidationError, value: validatedUserData } = userSchema.validate({ password })

    if (userValidationError) {
      sendLogs(req.log, 'info', { message: 'Password Validation Error', fnc: 'validatePasswordSyntax', info: { error: userValidationError } })
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }

    req.body.password = validatedUserData.password

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validatePasswordSyntax',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

function validateIfPasswordMatches(req, res, next) {
  try {
    const { password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      sendLogs(req.log, 'info', { message: 'Passwords do not match', fnc: 'validateIfPasswordMatches' })
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validateIfPasswordMatches',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}

function validateTokenSyntax(req, res, next) {
  try {
    const { token } = req.params
    const userSchema = validatorHelper.createSchemaChildJoiObject(userSchemaParentJoiObject, ['token'])
    const { error: userValidationError, value: validatedUserData } = userSchema.validate({ token })

    if (userValidationError) {
      sendLogs(req.log, 'info', { message: 'Token Validation Error', fnc: 'validateTokenSyntax', info: { error: userValidationError } })
      return res.status(httpStatus.BAD_REQUEST.code).end()
    }

    req.params.token = validatedUserData.token;

    next()
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: 'validateTokenSyntax',
        error
      }
    })
    res.status(httpStatus.SERVER_ERROR.code).end()
  }
}



