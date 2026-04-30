const express = require('express');
const router = express.Router();
const connectMongo = require('../config/mongo.config');

router.get('/', async (req, res) => {
    try {
        // Check MongoDB connection
        await connectMongo();
        console.log("MongoDB connected (health check)");

        // Root route
        res.status(200).json({
                message: "This app API is currently running on port",
                baseUrl: "YOUR_APP_LIVE_URL",
                status: "live"
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ status: 'error', message: 'Health check failed', error });
    }
});

module.exports = router;
