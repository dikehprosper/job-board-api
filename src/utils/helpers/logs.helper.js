module.exports = { sendLogs }

function sendLogs(loggerInstance, logLevel, message) {
    switch (logLevel) {
        case 'trace':
            loggerInstance.trace(message)
            break
        case 'debug':
            loggerInstance.debug(message)
            break
        case 'info':
            loggerInstance.info(message)
            break
        case 'warn':
            loggerInstance.warn(message)
            break
        case 'error':
            loggerInstance.error(message)
            break
        case 'fatal':
            loggerInstance.fatal(message)
            break
        default:
            loggerInstance.error('Invalid Log Level')
    }
}
