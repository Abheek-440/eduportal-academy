const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");
const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const senderEmail = process.env.BREVO_SMTP_USER || process.env.EMAIL_USER;
    const key = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS || process.env.EMAIL_PASS;

    if (!senderEmail || !key) {
      console.log("Contact message received (no Brevo credentials):", { name, email, message });
      return res.status(200).json({ message: "Message received successfully!" });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ca8a04; border-radius: 8px;">
        <h2 style="color: #ca8a04;">New Contact Us Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f4f4f4; padding: 10px; border-left: 4px solid #ca8a04;">
          ${message}
        </blockquote>
      </div>
    `;

    if (key.startsWith("xkeysib-")) {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "EduPortal Academy", email: senderEmail },
          to: [{ email: process.env.CONTACT_EMAIL || "sahilshaw2004002@gmail.com" }],
          replyTo: { email: email, name: name },
          subject: `New Contact Us Message from ${name}`,
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

      console.log(`✅ Contact email sent via API (ID: ${response.data?.messageId})`);
      return res.status(200).json({ message: "Message sent successfully!" });
    }

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
      to: process.env.CONTACT_EMAIL || "sahilshaw2004002@gmail.com",
      replyTo: email,
      subject: `New Contact Us Message from ${name}`,
      html: htmlContent,
    });

    console.log(`✅ Contact email sent via SMTP (ID: ${info.messageId})`);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    const errorDetails = error.response?.data?.message || error.message;
    console.error("Contact Form Mail Error:", errorDetails);
    res.status(500).json({ message: "Failed to send message. Please try again later.", error: errorDetails });
  }
});

module.exports = router;

