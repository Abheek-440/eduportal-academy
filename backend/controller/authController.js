const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

const sendOtpMail = async (email, otp) => {
  console.log(`========================================`);
  console.log(`🔑 [OTP GENERATED]`);
  console.log(`Email: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`========================================`);

  const senderEmail = process.env.BREVO_SMTP_USER || process.env.EMAIL_USER;
  const key = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS || process.env.EMAIL_PASS;

  if (!senderEmail || !key) {
    const msg = "⚠️ Brevo credentials (BREVO_SMTP_USER & BREVO_SMTP_PASS) are missing in environment variables.";
    console.error(msg);
    throw new Error(msg);
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #ca8a04; text-align: center;">EduPortal Academy</h2>
      <p style="font-size: 16px; color: #374151;">Your OTP verification code is:</p>
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #92400e;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #6b7280;">This code will expire in 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  // 1. If key is Brevo API Key (xkeysib-...)
  if (key.startsWith("xkeysib-")) {
    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "EduPortal Academy", email: senderEmail },
          to: [{ email: email }],
          subject: "OTP Verification - EduPortal Academy",
          htmlContent: htmlContent,
        },
        {
          headers: {
            "api-key": key,
            "Content-Type": "application/json",
            accept: "application/json",
          },
          timeout: 10000,
        }
      );

      console.log(`✅ Email sent successfully to ${email} via Brevo API (ID: ${response.data?.messageId})`);
      return response.data;
    } catch (err) {
      const errorDetails = err.response?.data?.message || err.message;
      console.error(`⚠️ Brevo API delivery failed for ${email}:`, errorDetails);
      throw new Error(`Brevo API Error: ${errorDetails}`);
    }
  }

  // 2. If key is Brevo SMTP Key (xsmtpsib-...) or standard SMTP pass
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: senderEmail,
        pass: key,
      },
    });

    const info = await transporter.sendMail({
      from: `"EduPortal Academy" <${senderEmail}>`,
      to: email,
      subject: "OTP Verification - EduPortal Academy",
      html: htmlContent,
    });

    console.log(`✅ Email sent successfully to ${email} via Brevo SMTP (ID: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`⚠️ Brevo SMTP delivery failed for ${email}:`, err.message);
    throw new Error(`Brevo SMTP Error: ${err.message}`);
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