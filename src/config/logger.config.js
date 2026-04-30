
const pino = require('pino')
// const pinoCloudWatch = require('pino-cloudwatch')
require('dotenv').config()

// Default transport options for logging to stdout
const stdoutTransportOptions = {
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() }
        }
    },
    redact: {
        paths: ['password', 'name', 'email'],
        remove: true
    },
    timestamp: () => `,"time":"${new Date(Date.now())}"`
}


// Create Pino logger instance with default transport options
let logger = pino(stdoutTransportOptions)


// AWS CloudWatch logging is disabled for now.
// if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production') {
//     // Configure Pino CloudWatch
//     const cloudWatchStream = pinoCloudWatch({
//         streamName: process.env.CLOUDWATCH_STREAM_NAME,
//         group: process.env.CLOUDWATCH_LOG_GROUP,
//         awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
//         awsRegion: process.env.AWS_REGION
//     })
//
//     // Add Pino CloudWatch transport to logger
//     logger = pino(cloudWatchStream)
// }

module.exports = logger
