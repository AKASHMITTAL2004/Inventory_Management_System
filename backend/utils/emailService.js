import nodemailer from "nodemailer";

// We create a "transporter" — the engine that actually logs into an email server to send the message.
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use Outlook, AWS SES, etc.
  auth: {
    user: process.env.EMAIL_USER, // e.g., your business email
    pass: process.env.EMAIL_PASS  // An "App Password" generated in your Gmail settings
  }
});

export const sendEmailAlert = async (to, subject, text) => {
  try {
    // If you haven't set up the .env variables yet, just log it to the console so the app doesn't crash during testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      return;
    }

    await transporter.sendMail({
      from: `"Inventory System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
