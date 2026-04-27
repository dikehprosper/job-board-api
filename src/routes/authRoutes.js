const express = require("express");
const { register, login } = require("../controllers/authController");
const { registerSchema, loginSchema } = require("../validation/authValidation");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const { jwt } = require("zod");
const crypto = require("crypto");
const { sendMailToUser } = require("../utils/mail");
const bcrypt = require("bcryptjs");

const router = express.Router();

// register
router.post("/register", (req, res, next) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error.errors[0].message
        });
    }

    next();
}, register);

router.post("/login", (req, res, next) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error.errors[0].message
        });
    }
    next();
}, login);

router.get("/me", auth, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id
        }
    });
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ success: true });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
 
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
  
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();
  
    const resetUrl = `${process.env.Domain_Frontend}/reset/${resetToken}`;
    await sendMailToUser({ recipientEmail: email, templateData: { resetUrl } });
   
    console.log("Reset URL:", resetUrl);

    res.json({ success: true });
});

router.post("/reset/:token", async (req, res) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid or expired token"
        });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.json({
        success: true,
        message: "Password updated successfully"
    });
});

module.exports = router;




