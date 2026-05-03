const passport = require('passport')
const jwt = require('jsonwebtoken')
const { UserRepo } = require('../repositories')
const { v4: uuidv4 } = require('uuid')
const { sendMail } = require('../utils/helpers/mail.helper')
require('dotenv').config(),

  /**
   * Exported service methods related to user authentication and management
   */
  module.exports = {
    authenticateUser,
    loginUser,
    findUser,
    generateAndSetUserTokens,
    updateUser,
    createUser,
    sendMailToUser
  }

/**
 * Authenticates a user using a given passport strategy
 * 
 * @param {Object} req - Express request object
 * @param {String} type - Passport strategy type (e.g., 'jwt', 'local')
 * @returns {Promise<Object>} - Resolves with authenticated user object
 */
async function authenticateUser(req, type) {
  return new Promise((resolve, reject) => {
    passport.authenticate(type, { session: false }, async (err, user, info) => {
      if (err) {
        reject(err)
      } else if (!user) {
        // Authentication failed, pass reason (info)
        reject(info)
      } else {
        // Authentication successful
        resolve(user)
      }
    })(req, null, () => { })
  })
}

/**
 * Logs a user into the request context without creating a session
 * 
 * @param {Object} req - Express request object
 * @param {Object} user - Authenticated user object
 * @returns {Promise<void>}
 */
async function loginUser(req, user) {
  return new Promise((resolve, reject) => {
    req.login(user, { session: false }, async (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Finds a single user based on provided query options
 * 
 * @param {Object} options - Query criteria (e.g., { email: 'test@example.com' })
 * @returns {Promise<Object|null>} - Found user or null
 */
async function findUser(options) {
  return UserRepo.findOne(options)
}

/**
 * Generates a JWT access token for a user
 * 
 * @param {Object} payload - Data to encode in the token (e.g., user ID, roles)
 * @returns {Promise<String>} - Signed JWT access token
 */
async function generateAndSetUserTokens(payload) {
  const accessToken = await jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_PRIVATE_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      algorithm: process.env.ACCESS_TOKEN_ALGORITHM
    }
  )
  return accessToken
}

/**
 * Updates a user by ID with provided fields
 * 
 * @param {String} userId - Unique user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated user object
 */
async function updateUser(userId, updates) {
  return UserRepo.updateById(userId, updates);
}

/**
 * Creates a new user with a generated UUID
 * 
 * @param {Object} userDetails - User data (e.g., name, email, password)
 * @returns {Promise<Object>} - Created user object
 */
async function createUser(userDetails) {
  const options = {
    id: uuidv4(), // Generate unique user ID
    ...userDetails
  }
  return UserRepo.create(options)
}

/**
 * Sends an email to a user using a helper utility
 * 
 * @param {Object} options - Mail options (to, subject, body, etc.)
 * @returns {Promise<void>}
 */
async function sendMailToUser(options) {
  return sendMail(options)
}