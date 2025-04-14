const nodemailer = require("nodemailer");
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  // secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification",
    html: `Your OTP code is: <b>${otp}</b>`,
  });
};

const sendPasswordResetEmail = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset",
    html: `Click <a href="${link}">here</a> to reset your password`,
  });
};
const sendMailOrder = async (to, subject, context) => {
  console.log("sendMailOrder -> context", context);
  const templatePath = path.join(__dirname, "../views", `emailTemplate.ejs`);
  const html = await ejs.renderFile(templatePath, context);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

// send mail contact
const sendMailContact = async (contact) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New Contact Form Submission",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f7fa; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <p style="color: #555; font-size: 16px;">You have a new contact form submission. Here are the details:</p>
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold;">Name:</td>
                <td style="padding: 8px; font-size: 16px; color: #555;">${contact.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold;">Email:</td>
                <td style="padding: 8px; font-size: 16px; color: #555;">${contact.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-size: 16px; color: #333; font-weight: bold;">Message:</td>
                <td style="padding: 8px; font-size: 16px; color: #555;">${contact.message}</td>
              </tr>
            </table>
            <p style="color: #555; font-size: 16px; margin-top: 20px;">This is an automated message. Please respond accordingly.</p>
          </div>
        </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};
module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMailOrder,
  sendMailContact,
};
