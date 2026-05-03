const express = require("express");
const router = express.Router();
const { routesWrapper } = require('../utils/handlers')
const { getUserFlag } = require('../middlewares/flags.middleware')
const { getUserData } = require('../controllers/user.controller')

/**
 * @route   GET /
 * @desc    Retrieve user data with pre-processing middleware
 */
router.route('/').get(
  routesWrapper([
    getUserFlag,  // Pre-processing middleware (e.g., feature flags, permissions)
    getUserData   // Final controller to handle response
  ])
)

module.exports = router;