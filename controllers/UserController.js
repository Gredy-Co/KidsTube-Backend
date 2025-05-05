const User = require("../models/UserModel");
const admin = require('../config/firebase');

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
    console.log("Request body:", req.body);
    try {
        const {
            email, password, phoneNumber, pin,
            firstName, lastName, country, dateOfBirth,
            isGoogleAuth, status = 'pending'
        } = req.body;

        const errors = validateUserData(req.body);
        if (errors.length > 0) {
            return res.status(422).json({ errors });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already in use.' });
        }

        const userData = {
            email,
            password: password,
            phoneNumber: isGoogleAuth ? null : phoneNumber,
            pin: isGoogleAuth ? null : pin,
            firstName: isGoogleAuth ? firstName || '' : firstName,
            lastName: isGoogleAuth ? lastName || '' : lastName,
            country: isGoogleAuth ? null : country,
            dateOfBirth: isGoogleAuth ? null : (dateOfBirth ? new Date(dateOfBirth) : null),
            status,
            isGoogleAuth
        };

        const user = new User(userData);
        const savedUser = await user.save();

        // Enviar correo solo a usuarios normales
        if (!isGoogleAuth) {
            const verificationToken = generateVerificationToken(savedUser._id);
            const verificationLink = `${process.env.FRONTEND_URL}/user/verify/${verificationToken}`;
            try {
                console.log("Sending verification email to:", email);
                await sendVerificationEmail(email, verificationLink);
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                await User.findByIdAndDelete(savedUser._id);
                return res.status(500).json({ error: 'Could not send verification email' });
            }
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
 * Logs in a user
 */
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // ✅ Login especial para Google
        if (user.isGoogleAuth) {
            const isGoogleMatch = await bcrypt.compare(password, user.password);
            if (!isGoogleMatch) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            const token = jwt.sign(
                { id: user._id, email: user.email },
                'your_secret_key',
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                message: 'Google login successful.',
                token,
                user
            });
        }

        // 🧾 Usuarios normales: verificar estado activo
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Access denied. Only users with 'active' status can log in."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // 🔐 2FA para usuarios normales
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFACode = code;
        user.twoFAExpires = new Date(Date.now() + 5 * 60000);
        await user.save();

        await sendVerificationCode(user.phoneNumber, code);

        return res.status(200).json({
            message: '2FA code sent, please enter it.',
            userId: user._id
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


/**
 * Logs in a user via Google ID token
 */
const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'Missing Google ID token.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;

        if (!email) {
            return res.status(400).json({ message: 'No email associated with Google account.' });
        }

        const user = await User.findOne({ email });

        if (!user || !user.isGoogleAuth) {
            return res.status(404).json({ message: 'Google user not found. Please sign up first.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            'your_secret_key',
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Google login successful.',
            token,
            user,
        });

    } catch (error) {
        console.error("Google login error:", error);
        return res.status(400).json({ message: 'Invalid or expired Google ID token.' });
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


const updateUserProfile = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, 'your_secret_key');
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    const userId = decoded.id;

    const {
        phoneNumber, pin,
        country, dateOfBirth,
        isGoogleAuth
    } = req.body;

    const updatedData = {
        phoneNumber, pin,
        country, dateOfBirth,
        status: 'active',
        isGoogleAuth
    };

    const errors = validateUserData({
        country, dateOfBirth, pin, phoneNumber, isGoogleAuth
    }, { isUpdate: true });

    if (errors.length > 0) {
        return res.status(422).json({ errors });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.country = country;
        user.dateOfBirth = new Date(dateOfBirth);
        user.phoneNumber = phoneNumber;
        user.pin = pin;
        user.status = 'active';

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({ message: 'Profile updated successfully', user: userResponse });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: 'Internal server error' });
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
    updateUserProfile,
    googleLogin,
    verifyAccount,
    verify2FACode,
    validateUserPin,
};