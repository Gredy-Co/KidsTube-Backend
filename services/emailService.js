const nodemailer = require('nodemailer');
require('dotenv').config();

// Enhanced transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Only for development, remove in production
  }
});

/**
 * Sends a verification email
 * @param {string} to - Recipient's email
 * @param {string} verificationLink - Full verification link
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, verificationLink) => {
  try {
    const mailOptions = {
      from: `"KidsTube" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify your account on KidsTube',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2b6cb0;">Welcome to KidsTube!</h2>
          <p>Please click the button below to verify your account:</p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4299e1; 
                    color: white; text-decoration: none; border-radius: 4px; margin: 15px 0;">
            Verify my account
          </a>
          <p>If you did not request this registration, please ignore this message.</p>
          <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #718096;">
            This link will expire in 24 hours. If you encounter issues, copy and paste this URL into your browser:<br>
            ${verificationLink}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send verification email');
  }
};

module.exports = { sendVerificationEmail };
