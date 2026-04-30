const User  = require('../models/User')

module.exports = {
  create,
  update,
  findOne,
  find
}

async function findOne(options) {
  return User.findOne(options)
}

async function find(options) {
  return User.findOne(options)
}

async function update(user, updates) {
  return user.update(updates);
}

async function create(options) {
  return User.create(options)
}
