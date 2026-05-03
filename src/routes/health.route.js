const express = require('express');
const router = express.Router();
const connectMongo = require('../config/mongo.config');

/**
 * @route   GET /
 * @desc    Health check endpoint for the application
 * 
 * Purpose:
 * - Verifies that the server is running
 * - Confirms MongoDB connection is successful
 * - Returns basic API status information
 * 
 * Response (Success):
 * - status: 200
 * - message: API is running
 * - baseUrl: Application base URL
 * - status: "live"
 * 
 * Response (Failure):
 * - status: 500
 * - message: Health check failed
 * - error: Error details
 */
router.get('/', async (req, res) => {
    try {
        /**
         * Attempt to establish MongoDB connection
         * Used here as part of the health check validation
         */
        await connectMongo();
        console.log("MongoDB connected (health check)");

        /**
         * Successful health check response
         */
        res.status(200).json({
            message: "This app API is currently running on port",
            baseUrl: "YOUR_APP_LIVE_URL",
            status: "live"
        });
    } catch (error) {
        /**
         * Handle health check failure
         */
        console.error('Health check failed:', error);

        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error
        });
    }
});

module.exports = router;