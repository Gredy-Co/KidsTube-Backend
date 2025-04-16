const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
require('dotenv').config();

// Create a MailerSend instance with the API key from environment variables
const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

// Function to send a verification email to a user
const sendVerificationEmail = async (email, verificationLink) => {
    try {
        // Check if the sender email is properly configured
        if (!process.env.SENDER_EMAIL || !process.env.SENDER_EMAIL.includes('@')) {
            throw new Error('Invalid sender email configuration');
        }

        // Create the sender information with a name (e.g., KidsTube)
        const sentFrom = new Sender(process.env.SENDER_EMAIL, 'KidsTube');

        // Define the recipient (the user who will receive the email)
        const recipients = [new Recipient(email)];

        // Set up the email content and parameters
        const emailParams = new EmailParams()
            .setFrom(sentFrom)                      // Who the email is from
            .setTo(recipients)                      // Who the email is going to
            .setSubject('🎉 Welcome to KidsTube! Please verify your email')  // Email subject line
            .setHtml(`
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #ff6b6b;">Hello!</h2>
                    <p>Thank you for signing up for <strong>KidsTube</strong>, a fun and safe place for kids.</p>
                    <p>To complete your registration, please verify your email by clicking the button below:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Verify my email
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all;">${verificationLink}</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 0.9em;">If you didn’t request this, you can safely ignore this email.</p>
                    <p style="font-size: 0.9em;">— The KidsTube Team</p>
                </div>
            `)
            .setText(`                          // Plain text version of the email (for clients that don't support HTML)
Hello,

Thank you for signing up for KidsTube.

To verify your account, please click the following link: ${verificationLink}

If you didn’t request this, you can safely ignore this message.

— The KidsTube Team`);

        // Send the email using MailerSend API
        const response = await mailerSend.email.send(emailParams);
        console.log('Email sent:', response);
        return true; // Return true if email was sent successfully
    } catch (error) {
        // Log detailed error information for debugging
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.body,
            stack: error.stack
        });
        // Throw a new error to indicate the failure
        throw new Error('Failed to send verification email');
    }
};

// Export the function so it can be used in other parts of your app
module.exports = { sendVerificationEmail };
