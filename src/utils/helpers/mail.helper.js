const ses = require("../../config/aws.config");
require('dotenv').config(),

module.exports = {
    sendMail
}

async function sendMail(options) {
    const { recipientEmail, templateData } = options;
    const { resetUrl } = templateData;

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

    const params = {
        Source: process.env.SES_SENDER,
        Destination: { ToAddresses: [recipientEmail] },
        Message: {
            Subject: { Data: `Password Reset Request`, Charset: 'UTF-8' },
            Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } }
        }
    };
  
    return ses.sendEmail(params).promise();
}
