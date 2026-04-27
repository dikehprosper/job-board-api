const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({
    accessKeyId: process.env.AWS_SES_ACCESS_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01' })

module.exports = ses



