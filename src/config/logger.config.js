const pino = require('pino')
// const pinoCloudWatch = require('pino-cloudwatch')
require('dotenv').config()

/**
 * Default transport options for Pino logger (stdout)
 * 
 * Features:
 * - Configurable log level via environment variable
 * - Uppercase log levels for consistency
 * - Redacts sensitive fields from logs
 * - Custom timestamp format
 */
const stdoutTransportOptions = {
    level: process.env.PINO_LOG_LEVEL || 'info',

    /**
     * Format log level output (e.g., INFO, ERROR)
     */
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() }
        }
    },

    /**
     * Redact sensitive information from logs
     * Prevents accidental exposure of user data
     */
    redact: {
        paths: ['password', 'name', 'email'],
        remove: true
    },

    /**
     * Custom timestamp format
     */
    timestamp: () => `,"time":"${new Date(Date.now())}"`
}

/**
 * Initialize Pino logger with stdout transport
 */
let logger = pino(stdoutTransportOptions)

/**
 * Optional: AWS CloudWatch integration (currently disabled)
 * 
 * Intended for production environments to stream logs to AWS CloudWatch
 * Uncomment and configure when needed
 */
// if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production') {
//     const cloudWatchStream = pinoCloudWatch({
//         streamName: process.env.CLOUDWATCH_STREAM_NAME,
//         group: process.env.CLOUDWATCH_LOG_GROUP,
//         awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
//         awsRegion: process.env.AWS_REGION
//     })
//
//     /**
//      * Replace logger with CloudWatch transport
//      */
//     logger = pino(cloudWatchStream)
// }

/**
 * Export configured logger instance
 */
module.exports = logger