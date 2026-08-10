const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dns = require("dns");

const sendOtpMail = async (email, otp) => {
  console.log(`========================================`);
  console.log(`🔑 [OTP GENERATED]`);
  console.log(`Email: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`========================================`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ EMAIL_USER or EMAIL_PASS environment variables are missing. Skipping SMTP email delivery.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      requireTLS: true,
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
      },
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.replace(/\s+/g, ""), // Remove any accidental spaces in App Password
      },
      connectionTimeout: 8000,
      socketTimeout: 8000,
    });

    await transporter.sendMail({
      from: `"EduPortal Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification - EduPortal Academy",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });
    console.log(`✅ Email sent successfully to ${email}`);
  } catch (err) {
    console.error(`⚠️ Email delivery failed for ${email}:`, err.message);
    if (err.message.includes("Invalid login") || err.message.includes("535")) {
      console.error("💡 HINT: Check that EMAIL_USER matches the exact Gmail account that generated the 16-character App Password.");
    }
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["admin", "instructor", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.otp = otp;
      existingUser.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        otp,
        otpExpire: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    await sendOtpMail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully. Please verify your email.",
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);
    res.status(500).json({
      message: error.message || "Register failed",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpire || user.otpExpire < new Date()) {
      return res.status(400).json({ message: "OTP expired. Register again." });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "OTP verification failed",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    
    await user.save();

    await sendOtpMail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error.message);
    res.status(500).json({
      message: error.message || "Failed to process forgot password",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpire || user.otpExpire < new Date()) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error.message);
    res.status(500).json({
      message: error.message || "Failed to reset password",
    });
  }
};