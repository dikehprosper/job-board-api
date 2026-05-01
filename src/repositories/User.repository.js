const User  = require('../models/User')

module.exports = {
  create,
  updateById,
  findOne,
  find
}

async function findOne(options) {
  return User.findOne(options)
}

async function find(options) {
  return User.findOne(options)
}

async function updateById(userId, updates) {
  return User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true } 
  );
}
async function create(options) {
  return User.create(options)
}
