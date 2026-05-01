const { httpStatus } = require('../utils/helpers/variables.helper')
const { handleError } = require('../utils/helpers/common.helper')
const UserRepo = require('../repositories/User.repository')
const { sendLogs } = require('../utils/helpers/logs.helper.js')
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config()

module.exports = {
  verifyUserWithEmail,
  verifyGoogleAuthCode
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







// async function verifyGoogleAuthCode(req, res, next) {
//   try {
//     const { googleAuthcode } = req.body;

//     const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


//     const ticket = await client.verifyIdToken({
//       idToken: googleAuthcode,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     console.log("TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", ticket);
//     const payload = ticket.getPayload();

//     if (!payload) {
//       sendLogs(req.log, "info", {
//         message: "Invalid Google token payload",
//         fnc: "verifyGoogleAuthCode",
//       });

//       return res.status(httpStatus.UNAUTHORIZED.code).json({
//         message: "Invalid Google token",
//       });
//     }

//     // Attach verified Google payload to request
//     req.googlePayload = payload;


//     // next();
//   } catch (error) {
//     handleError({
//       loggerInstance: req.log,
//       info: {
//         fnc: "verifyGoogleAuthCode",
//         error,
//       },
//     });

//     return res.status(httpStatus.SERVER_ERROR.code).json({
//       message: "Google authentication failed",
//     });
//   }
// }




async function verifyGoogleAuthCode(req, res, next) {
  try {
    const { googleAuthcode } = req.body;
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "postmessage"
    );

    const { tokens } = await client.getToken(googleAuthcode);

    if (!tokens.id_token) {
      return res.status(httpStatus.UNAUTHORIZED.code).json({
        message: "Failed to retrieve Google ID token",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();

    if (!googlePayload) {
      return res.status(httpStatus.UNAUTHORIZED.code).json({
        message: "Invalid Google token payload",
      });
    }

    req.body = googlePayload;
    next();
  } catch (error) {
    handleError({
      loggerInstance: req.log,
      info: {
        fnc: "verifyGoogleAuthCode",
        error,
      },
    });

    return res.status(httpStatus.SERVER_ERROR.code).json({
      message: "Google authentication failed",
    });
  }
}