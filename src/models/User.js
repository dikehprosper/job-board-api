const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);