const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Contact message received (no EMAIL_USER/EMAIL_PASS):", { name, email, message });
      return res.status(200).json({ message: "Message received successfully!" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"EduPortal Academy" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || "sahilshaw2004002@gmail.com",
      replyTo: email,
      subject: `New Contact Us Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ca8a04; border-radius: 8px;">
          <h2 style="color: #ca8a04;">New Contact Us Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background: #f4f4f4; padding: 10px; border-left: 4px solid #ca8a04;">
            ${message}
          </blockquote>
        </div>
      `,
    });

    console.log(`✅ Contact email sent (ID: ${info.messageId})`);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Form Mail Error:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later.", error: error.message });
  }
});

module.exports = router;

