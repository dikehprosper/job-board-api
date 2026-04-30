const { sendLogs } = require('./logs.helper.js')

module.exports = {
  handleError
}

function handleError (logEntry, transaction) {
  const { loggerInstance, info } = logEntry
  // Rollback the transaction if it exists
  if (transaction) {
    transaction.rollback()
  }

  const error = {
    name: info.error.name,
    message: info.error.message,
    stack: info.error.stack
  }

  info.error = error

  // Check the type of error and handle accordingly
  if (info.error.name === 'SequelizeDatabaseError') {
    sendLogs(loggerInstance, 'error', {
      message: 'postgres database error',
      fnc: 'handleError',
      info
    })
  } else {
    sendLogs(loggerInstance, 'error', {
      message: 'server error',
      fnc: 'handleError',
      info
    })
  }
}
