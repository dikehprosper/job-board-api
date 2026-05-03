const User  = require('../models/User')

/**
 * Exported repository methods for User model
 */
module.exports = {
  create,
  updateById,
  findOne,
  find
}

/**
 * Finds a single user document based on provided query options
 * 
 * @param {Object} options - Query conditions (e.g., { email: 'test@example.com' })
 * @returns {Promise<Object|null>} - Matching user document or null
 */
async function findOne(options) {
  return User.findOne(options)
}

/**
 * Finds user(s) based on provided query options
 * 
 * NOTE:
 * Currently uses findOne (returns a single document).
 * Intended for multiple results, but implementation returns only one.
 * 
 * @param {Object} options - Query conditions
 * @returns {Promise<Object|null>} - Matching user document or null
 */
async function find(options) {
  return User.findOne(options)
}

/**
 * Updates a user document by its ID
 * 
 * @param {String} userId - Unique user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated user document or null if not found
 */
async function updateById(userId, updates) {
  return User.findByIdAndUpdate(
    userId,
    { $set: updates }, // Apply updates using $set operator
    { new: true }      // Return updated document instead of original
  );
}

/**
 * Creates a new user document
 * 
 * @param {Object} options - User data to be stored
 * @returns {Promise<Object>} - Created user document
 */
async function create(options) {
  return User.create(options)
}