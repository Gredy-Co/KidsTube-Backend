const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Initialize Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Send an SMS with the verification code.
 * @param {string} phoneNumber - User's phone number to which the code will be sent
 * @param {string} code - Verification code to send
 */
const sendVerificationCode = async (phoneNumber, code) => {
    try {
        const message = await client.messages.create({
            body: `Your verification code is: ${code}`,
            from: TWILIO_PHONE_NUMBER,  // Twilio phone number
            to: phoneNumber  // User's phone number
        });

        console.log(`Message sent to ${phoneNumber}: ${message.sid}`);
        return message.sid;
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send verification code');
    }
};

module.exports = { sendVerificationCode };
