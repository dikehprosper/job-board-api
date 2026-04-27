const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");
const errorHandler = require("./src/middleware/errorMiddleware");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Job Board API is running",
        baseUrl: "https://jobboardapi.tracebeta.com",
        status: "live"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Error middleware
app.use(errorHandler);

// DB + SERVER START
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("MongoDB connection failed:", err);
    });