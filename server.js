const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");
const errorHandler = require("./src/middleware/errorMiddleware");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ERROR HANDLER 
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});
app.use(errorHandler);

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(5001, () => console.log("Server running on port 5001"));
    })
    .catch(err => console.log(err));