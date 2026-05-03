const ses = require("../../config/aws.config");
require('dotenv').config(),

/**
 * Exported mail utility
 */
module.exports = {
    sendMail
}

/**
 * Sends an email using AWS SES
 * 
 * Currently used for password reset emails
 * 
 * @param {Object} options - Mail configuration object
 * @param {String} options.recipientEmail - Recipient's email address
 * @param {Object} options.templateData - Data used to populate the email template
 * @param {String} options.templateData.resetUrl - Password reset link
 * 
 * @returns {Promise<Object>} - AWS SES sendEmail response
 */
async function sendMail(options) {
    const { recipientEmail, templateData } = options;
    const { resetUrl } = templateData;

    /**
     * HTML email body for password reset
     * Includes a call-to-action button with reset link
     */
    const htmlBody = `
         <div style="font-family: Arial, sans-serif; max-width:600px; line-height:1.4; color:#111;">
            <p>We received a request to reset your password for your account.</p>
            <p>To complete the process, please click the link below to reset your password</p>
            <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background-color:#007BFF; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
            <p style="font-size: 12px;">(This link is valid for the next 15 minutes).</p>
            <p>If you didn’t request a password reset, you can safely ignore this message — your account will remain secure.</p>
            <p>Security Team.</p>
        </div>
    `;

    /**
     * AWS SES email parameters
     */
    const params = {
        Source: process.env.SES_SENDER, // Verified SES sender email
        Destination: { ToAddresses: [recipientEmail] }, // Recipient email
        Message: {
            Subject: { Data: `Password Reset Request`, Charset: 'UTF-8' },
            Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } }
        }
    };
  
    /**
     * Send email via AWS SES
     * .promise() converts callback-based API to Promise
     */
    return ses.sendEmail(params).promise();
}