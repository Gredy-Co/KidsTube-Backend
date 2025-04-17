const User = require("../models/UserModel");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { validateUserData } = require('../validations/user/validateUserData');
const validateUserPin = require('../validations/user/validateUserPin');

const { sendVerificationEmail } = require('../services/email.service');
const { generateVerificationToken, verifyToken } = require('../services/token.service');
const { sendVerificationCode } = require('../services/sms.service');

/**
 * Creates a user
 */
const userPost = async (req, res) => {
    try {
        const errors = validateUserData(req.body);
        if (errors.length > 0) {
            return res.status(422).json({ errors });
        }

        const { email, password, phoneNumber, pin, firstName, lastName, country, dateOfBirth } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already in use.' });
        }

        const user = new User({
            email,
            password,
            phoneNumber,
            pin,
            firstName,
            lastName,
            country,
            dateOfBirth: new Date(dateOfBirth),
            status: 'pending'
        });

        const savedUser = await user.save();

        // Generate token and verification link
        const verificationToken = generateVerificationToken(savedUser._id);
        const verificationLink = `${process.env.FRONTEND_URL}/user/verify/${verificationToken}`;

        // Send email (with error handling)
        try {
            await sendVerificationEmail(email, verificationLink);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Optionally: delete the user if email fails
            await User.findByIdAndDelete(savedUser._id);
            return res.status(500).json({ error: 'Could not send verification email' });
        }

        const userResponse = savedUser.toObject();
        delete userResponse.password;

        return res.status(201).json(userResponse);

    } catch (err) {
        console.error("Error while saving the user:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Verifies a user's account
 */
const verifyAccount = async (req, res) => {
    try {
        const { token } = req.params;

        const { userId } = verifyToken(token);
        
        const user = await User.findByIdAndUpdate(
            userId,
            { status: 'active' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(200).json({ message: 'Account verified successfully.' });

    } catch (err) {
        console.error("Error verifying account:", err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Verification link has expired.' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};



/**
 * Logs in a user
 */
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Attempt to find a user by the provided email
        const user = await User.findOne({ email });

        if (!user) {
            // If user is not found, return unauthorized
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Check if the user's account is active
        if (user.status !== "active") {
            return res.status(403).json({ 
                message: "Access denied. Only users with 'active' status can log in." 
            });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // If password doesn't match, return unauthorized
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate a 6-digit verification code for 2FA
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save the code and set its expiration time (valid for 5 minutes)
        user.twoFACode = code;
        user.twoFAExpires = new Date(Date.now() + 5 * 60000); // 5 minutes from now
        await user.save();

        // Send the verification code via SMS
        await sendVerificationCode(user.phoneNumber, code);

        // Respond with a success message and the user's ID
        return res.status(200).json({
            message: '2FA code sent, please enter it.',
            userId: user._id
        });

    } catch (error) {
        // Log and respond with a server error if something goes wrong
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};



/**
 * Verifies the login with 2FACode
 */
const verify2FACode = async (req, res) => {
    const { userId, code } = req.body;

    try {
        // Find the user by ID from the database
        const user = await User.findById(userId);

        if (!user) {
            // If the user is not found, return a 404 response
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify if the code matches and has not expired
        if (user.twoFACode !== code || new Date() > user.twoFAExpires) {
            // If the code is incorrect or expired, return a 400 response
            return res.status(400).json({ message: 'Invalid or expired code.' });
        }

        // Clear the 2FA code and expiration
        user.twoFACode = null;
        user.twoFAExpires = null;
        await user.save();

        // Generate a JWT (JSON Web Token) for the authenticated user
        const token = jwt.sign(
            { id: user._id, email: user.email },
            'your_secret_key', // Replace this with a more secure secret key
            { expiresIn: '1h' } // Token expiration time is set to 1 hour
        );

        // Return a successful response with the generated token
        return res.status(200).json({ message: 'Authentication completed.', token });

    } catch (error) {
        // Log any errors that occur during the verification process
        console.error("Error during 2FA verification:", error);
        // Return a 500 response if there's an internal server error
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

  
module.exports = {
    userPost,
    userLogin,
    verifyAccount,
    verify2FACode,
    validateUserPin
};