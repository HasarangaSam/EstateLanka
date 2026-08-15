import { sendContactEmail } from "../utils/sendEmail.js";

// ============================================================
// SEND CONTACT US MESSAGE (PUBLIC - NO AUTH REQUIRED)
// ============================================================

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic field validations
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Your name is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Your email address is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Message subject is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Send email to admin
    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(200).json({
      message: "Thank you for contacting EstateLanka! Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Submit contact form error:", error);
    return res.status(500).json({
      message: "Something went wrong while sending your message. Please try again later.",
    });
  }
};
