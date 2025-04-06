const User = require("../models/UserModel");
const { validateUserData } = require('../validations/user/validateUserData');
const validateUserPin = require('../validations/user/validateUserPin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../services/emailService');
const { generateVerificationToken, verifyToken } = require('../services/tokenService');

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

    // Validate that required fields are present
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Find the user by their email
        const user = await User.findOne({ email });

        // If the user does not exist, return a 401 Unauthorized error
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Check if the user's status is "active"
        if (user.status !== "active") {
            return res.status(403).json({ message: "Access denied. Only users with 'active' status can log in." });
        }

        // Compare the entered password with the stored (hashed) password
        const isMatch = await bcrypt.compare(password, user.password);

        // If the password does not match, return a 401 Unauthorized error
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate a JWT token for the user
        const token = jwt.sign(
            { id: user._id, email: user.email, pin: user.pin },
            'your_secret_key', // Replace this with a more secure secret key
            { expiresIn: '1h' } // Optional: set an expiration time for the token
        );

        // Return a successful response with the token and user data
        return res.status(200).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                pin: user.pin,
            },
        });
    } catch (error) {
        // Handle internal server errors
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
  
module.exports = {
    userPost,
    userLogin,
    verifyAccount,
    validateUserPin
};