const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const UserRepo = require('../repositories/User.repository')
const bcrypt = require('bcrypt')
require('dotenv').config()

/**
 * Configure Passport Local Strategy for user login
 * 
 * Strategy name: 'login'
 * 
 * Authentication flow:
 * 1. Retrieve user by email
 * 2. Check if user exists
 * 3. Handle Google-auth users attempting local login
 * 4. Compare provided password with stored hashed password
 * 5. Return authenticated user or failure message
 */
passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',   // Use email instead of default 'username'
            passwordField: 'password' // Field for password
        },
        /**
         * Local strategy verification callback
         * 
         * @param {String} email - User's email
         * @param {String} password - User's password
         * @param {Function} done - Passport callback
         */
        async (email, password, done) => {
            try {
                const options = { email }

                /**
                 * Fetch user from database
                 */
                const user = await UserRepo.find(options)

                /**
                 * Handle user not found
                 */
                if (!user) {
                    return done(null, false, { message: 'User not found' })
                }

                /**
                 * Handle users registered via Google OAuth
                 * Prevent local login if no password exists
                 */
                if (user.googleId && !user.password) {
                    return done(null, false, {
                        message: 'You initially signed up using Google. Please log in using Google or sign up to update password.'
                    })
                }

                /**
                 * Validate password using bcrypt
                 */
                const isValidPassword = await bcrypt.compare(password, user.password)

                /**
                 * Handle invalid password
                 */
                if (!isValidPassword) {
                    return done(null, false, { message: 'Invalid Password' })
                }

                /**
                 * Successful authentication
                 */
                return done(null, user, { message: 'Logged in Successfully' })
            } catch (error) {
                /**
                 * Handle unexpected errors
                 */
                return done(error)
            }
        }
    )
)

/**
 * Export configured passport instance
 */
module.exports = passport