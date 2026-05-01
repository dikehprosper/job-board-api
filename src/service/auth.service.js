const passport = require('passport')
const jwt = require('jsonwebtoken')
const { UserRepo } = require('../repositories')
const { v4: uuidv4 } = require('uuid')
const { sendMail } = require('../utils/helpers/mail.helper')
require('dotenv').config(),

module.exports = {
  authenticateUser,
  loginUser,
  findUser,
  generateAndSetUserTokens,
  updateUser,
  createUser,
  sendMailToUser
}

async function authenticateUser(req, type) {
  return new Promise((resolve, reject) => {
    passport.authenticate(type, { session: false }, async (err, user, info) => {
      if (err) {
        reject(err)
      } else if (!user) {
        reject(info)}
        else {
        resolve(user)
      }
    })(req, null, () => { })
  })
}

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

async function findUser(options) {
  return UserRepo.findOne(options)
}

async function generateAndSetUserTokens(payload) {
  const accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION, algorithm: process.env.ACCESS_TOKEN_ALGORITHM })
  return accessToken
}

async function updateUser(userId, updates) {
  return UserRepo.updateById(userId, updates);
}

async function createUser(userDetails) {
  const options = {
      id: uuidv4(),
      ...userDetails
  }
  return UserRepo.create(options)
}

async function sendMailToUser(options) {
  return sendMail(options)
}
