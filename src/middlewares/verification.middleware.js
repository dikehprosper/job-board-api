const { httpStatus } = require('../utils/helpers/variables.helper')
const { handleError } = require('../utils/helpers/common.helper')
const UserRepo = require('../repositories/User.repository')
const { sendLogs } = require('../utils/helpers/logs.helper.js')

module.exports = {
  verifyUserWithEmail
}

async function verifyUserWithEmail (req, res, next) {
  try {
    const email = req.body.email
    const options = {email}
    const user = await UserRepo.find(options)

    if (!user) {
      sendLogs(req.log, 'info', { message: 'user was not found', fnc: 'verifyUserWithEmail', info: { email } })
      return res.status(httpStatus.NOT_ALLOWED.code).end()
    }

    req.user = user
    next()
  } catch (error) {
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
