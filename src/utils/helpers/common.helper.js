const { sendLogs } = require('./logs.helper.js')

/**
 * Exported error handling utility
 */
module.exports = {
  handleError
}

/**
 * Handles application errors with optional transaction rollback and logging
 * 
 * Primarily used to:
 * - Rollback database transactions (if provided)
 * - Normalize error structure
 * - Log errors based on type (e.g., database vs general server error)
 * 
 * @param {Object} logEntry - Log entry containing logger instance and error info
 * @param {Object} logEntry.loggerInstance - Logger instance used for logging
 * @param {Object} logEntry.info - Metadata including error details
 * @param {Object} logEntry.info.error - Original error object
 * 
 * @param {Object} [transaction] - Optional database transaction (e.g., Sequelize transaction)
 */
function handleError (logEntry, transaction) {
  const { loggerInstance, info } = logEntry

  /**
   * Rollback the transaction if it exists
   * Ensures database consistency in case of failure
   */
  if (transaction) {
    transaction.rollback()
  }

  /**
   * Normalize error object to avoid leaking unnecessary/internal properties
   */
  const error = {
    name: info.error.name,
    message: info.error.message,
    stack: info.error.stack
  }

  info.error = error

  /**
   * Handle specific error types (e.g., Sequelize/Postgres errors)
   * Logs different messages depending on error classification
   */
  if (info.error.name === 'SequelizeDatabaseError') {
    sendLogs(loggerInstance, 'error', {
      message: 'postgres database error',
      fnc: 'handleError',
      info
    })
  } else {
    /**
     * Fallback for general server errors
     */
    sendLogs(loggerInstance, 'error', {
      message: 'server error',
      fnc: 'handleError',
      info
    })
  }
}