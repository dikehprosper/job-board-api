const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
// const GoogleStrategy = require('passport-google-oauth2').Strategy
// const JWTstrategy = require('passport-jwt').Strategy
// const ExtractJWT = require('passport-jwt').ExtractJwt
const UserRepo = require('../repositories/User.repository')
const bcrypt = require('bcrypt')
require('dotenv').config()

passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const options = {
                        email
                    }
                
                const user = await UserRepo.find(options)
                if (!user) {
                    return done(null, false, { message: 'User not found' })
                }

                // Check if the user signed up via Google
                if (user.googleId && !user.password) {
                    return done(null, false, { message: 'You initially signed up using Google. Please log in using Google or sign up to update password.' })
                }

                // Validate the password for local sign-ups
                const isValidPassword = await bcrypt.compare(password, user.password)

                if (!isValidPassword) {
                    return done(null, false, { message: 'Invalid Password' })
                }

                return done(null, user, { message: 'Logged in Successfully' })
            } catch (error) {
                return done(error)
            }
        }
    )
)

// passport.use(
//   'google',
//   new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID || 'your_default_client_id',
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_default_client_secret',
//     callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http//your_default_url',
//     passReqToCallback: true,
//     scope: ['profile', 'https://www.googleapis.com/auth/contacts.readonly', 'email']
//   },
//   async (req, accessToken, refreshToken, profile, done) => {
//     try {
//       return done(null, { profile, accessToken, refreshToken })
//     } catch (error) {
//       return done(error)
//     }
//   }))

// passport.use(
//     'jwt',
//     new JWTstrategy(
//         {
//             secretOrKey: process.env.AUTH_SERVER_TOKEN || 'your_auth_token',
//             jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
//         },
//         async (token, done) => {
//             try {
//                 return done(null, token)
//             } catch (error) {
//                 done(error)
//             }
//         }
//     )
// )

module.exports = passport
