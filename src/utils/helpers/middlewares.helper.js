const { UserRepo } = require('../../repositories')
require('dotenv').config();
const jwt = require('jsonwebtoken')

/**
 * Exported authentication/token utilities
 */
module.exports = {
  getToken,
  verifyToken,
  verifyUser
}

/**
 * Extracts JWT token from Authorization header
 * 
 * Expected format:
 * Authorization: Bearer <token>
 * 
 * @param {Object} req - Express request object
 * @returns {String|null} - Extracted token or null if not present/invalid
 */
function getToken (req) {
  let token = null

  const authorizationHeader = req.headers?.authorization || null

  if (authorizationHeader) {
    // Split header into "Bearer" and token
    const [bearer, accessToken] = authorizationHeader.split(' ')

    // Validate Bearer scheme (case-insensitive)
    if (bearer && bearer.toLowerCase() === 'bearer') {
      token = accessToken || null
    }
  }

  // Return extracted token (or null if not found)
  return token
}

/**
 * Verifies a JWT token using configured secret and algorithm
 * 
 * @param {String} token - JWT token to verify
 * @returns {Promise<Object>} 
 * - { value } if valid (decoded payload)
 * - { error } if invalid/expired
 */
async function verifyToken(token) {
  try {
    const tokenKey = process.env.ACCESS_TOKEN_PRIVATE_KEY
    const algorithm = process.env.ACCESS_TOKEN_ALGORITHM

    // Verify and decode token
    const value = await jwt.verify(token, tokenKey, { algorithms: [algorithm] })
    return { value }
  } catch (error) {
    // Return error instead of throwing for controlled handling
    return { error }
  }
}

/**
 * Verifies a user exists in the database based on given criteria
 * 
 * @param {Object} options - Query conditions (e.g., { id: userId })
 * @returns {Promise<Array>} - List of matching users
 */
// Auth/service layer
async function verifyUser(options = {}) {
  return await UserRepo.find(options);
}