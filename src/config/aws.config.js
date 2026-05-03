const AWS = require('aws-sdk')
require('dotenv').config()

/**
 * Configure AWS SDK with SES credentials
 * 
 * Environment variables used:
 * - AWS_SES_ACCESS_ID
 * - AWS_SES_SECRET_ACCESS_KEY
 * - AWS_REGION
 */
AWS.config.update({
    accessKeyId: process.env.AWS_SES_ACCESS_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

/**
 * Create AWS SES (Simple Email Service) instance
 * 
 * API Version:
 * - 2010-12-01 (stable SES API version)
 */
const ses = new AWS.SES({ apiVersion: '2010-12-01' })

/**
 * Export configured SES instance
 * 
 * Used for:
 * - Sending transactional emails (e.g., password reset)
 */
module.exports = ses


