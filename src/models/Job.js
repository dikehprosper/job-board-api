const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);