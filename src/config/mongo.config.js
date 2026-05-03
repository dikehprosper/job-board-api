const mongoose = require("mongoose");

/**
 * Establishes a connection to MongoDB using Mongoose
 * 
 * Uses the connection string defined in environment variables (MONGO_URI)
 * 
 * Success:
 * - Connects to MongoDB
 * - Logs confirmation message
 * 
 * Failure:
 * - Logs error details
 * - Throws error to be handled by caller
 * 
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
const connectMongo = async () => {
	try {
		/**
		 * Attempt to connect to MongoDB
		 */
		await mongoose.connect(process.env.MONGO_URI);

		/**
		 * Log successful connection
		 */
		console.log("MongoDB connected");
	} catch (err) {
		/**
		 * Handle connection failure
		 */
		console.error("MongoDB connection failed:", err);

		/**
		 * Re-throw error for upstream handling
		 */
		throw err;
	}
};

module.exports = connectMongo;













