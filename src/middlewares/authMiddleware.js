const jwt = require("jsonwebtoken");

/**
 * JWT authentication middleware
 * 
 * Purpose:
 * - Extracts token from Authorization header
 * - Verifies token using JWT secret
 * - Attaches decoded payload to req.user
 * - Blocks access if token is missing or invalid
 * 
 * Expected header format:
 * Authorization: Bearer <token>
 * 
 * Success:
 * - req.user is populated with decoded token payload
 * - Calls next() to proceed
 * 
 * Failure:
 * - 401 if no token provided
 * - 401 if token is invalid/expired
 */
module.exports = (req, res, next) => {
    let token = req.headers.authorization;

    /**
     * Check if token exists in headers
     */
    if (!token) {
        return res.status(401).json({ message: "No token, not authorized" });
    }

    /**
     * Remove "Bearer " prefix if present
     */
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        /**
         * Verify token and decode payload
         */
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /**
         * Attach decoded user data to request object
         */
        req.user = decoded;

        next();
    } catch (error) {
        /**
         * Handle invalid or expired token
         */
        res.status(401).json({ message: "Token not valid" });
    }
};