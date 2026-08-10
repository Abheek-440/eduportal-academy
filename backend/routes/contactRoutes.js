const express = require("express");
const { Resend } = require("resend");
const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("Contact message received (no RESEND_API_KEY):", { name, email, message });
      return res.status(200).json({ message: "Message received successfully!" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "EduPortal Academy <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL || "sahilshaw2004002@gmail.com"],
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

    if (error) {
      console.error("Contact Form Mail Error:", error);
      return res.status(500).json({ message: "Failed to send message. Please try again later.", error: error.message });
    }

    console.log(`✅ Contact email sent (ID: ${data.id})`);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact Form Mail Error:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later.", error: error.message });
  }
});

module.exports = router;

