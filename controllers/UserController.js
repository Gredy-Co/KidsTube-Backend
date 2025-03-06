const User = require("../models/UserModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Creates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPost = async (req, res) => {
    try {
        // Destructure the request body
        const { email, password, phoneNumber, pin, firstName, lastName, country, dateOfBirth, status } = req.body;

        // Validate required fields
        if (!email || !password || !phoneNumber || !pin || !firstName || !lastName || !country || !dateOfBirth || !status) {
            return res.status(400).json({
                error: "All fields are required."
            });
        }

        // Convertir la fecha de nacimiento a un objeto Date
        const birthDate = new Date(dateOfBirth);

        if (isNaN(birthDate.getTime())) {
            return res.status(400).json({
                error: "Invalid date of birth format."
            });
        }

        // Create a new user instance
        const user = new User({
            email,
            password, // The password will be automatically encrypted thanks to the middleware in the model
            phoneNumber,
            pin,
            firstName,
            lastName,
            country,
            dateOfBirth: birthDate,
            status
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Remove the password from the response for security
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        // Return the created user with a 201 status code
        res.status(201).json({
            data: userResponse
        });
    } catch (err) {
        console.error("Error while saving the user:", err);

        // Handle specific errors (e.g., validation errors)
        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Validation error",
                details: err.message
            });
        }

        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(409).json({
                error: "The email is already registered."
            });
        }

        // Handle generic server errors
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

/**
 * Logs in a user
 */
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Search user in the database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, 'tu_clave_secreta', { expiresIn: '1h' });

        return res.status(200).json(user);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

  
  
  



module.exports = {
    userPost,
    userLogin
};
