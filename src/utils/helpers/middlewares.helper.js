const {  UserRepo } = require('../../repositories')
require('dotenv').config();
const jwt = require('jsonwebtoken')

module.exports = {
  getToken,
  verifyToken,
  verifyUser
}

function getToken (req) {
  let token = null

  const authorizationHeader = req.headers?.authorization || null

  if (authorizationHeader) {
    const [bearer, accessToken] = authorizationHeader.split(' ') // Split at the space to get the token without "Bearer"

    if (bearer && bearer.toLowerCase() === 'bearer') { // Check if the "Bearer" part is case-insensitive
      token = accessToken || null
    }
  }

  // Return the extracted token
  return token
}

async function verifyToken(token) {
  try {
    const tokenKey = process.env.ACCESS_TOKEN_PRIVATE_KEY
    const algorithm = process.env.ACCESS_TOKEN_ALGORITHM

    const value = await jwt.verify(token, tokenKey, { algorithms: [algorithm] })
    return { value }
  } catch (error) {
    return { error }
  }
}


async function verifyUser(options) {
  const option = {
    attributes: { exclude: [] },
    where: options
  }
  return UserRepo.find(option)
}
