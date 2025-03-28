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
            return res.status(400).json();
        }

        // Convertir la fecha de nacimiento a un objeto Date
        const birthDate = new Date(dateOfBirth);

        if (isNaN(birthDate.getTime())) {
            return res.status(400).json();
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
        res.status(201).json( userResponse
        );
    } catch (err) {
        console.error("Error while saving the user:", err);

        // Handle specific errors (e.g., validation errors)
        if (err.name === "ValidationError") {
            return res.status(422).json();
        }

        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(409).json();
        }

        // Handle generic server errors
        res.status(500).json();
    }
};

/**
 * Logs in a user
 */
const userLogin = async (req, res) => {
    const { email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json();
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json();
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json();
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, pin: user.pin }, 
            'tu_clave_secreta'        );

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
        console.error("Login error:", error);
        return res.status(500).json();
    }
};

const validateUserPin = async (req, res) => {
    try {
    const { pin } = req.body; 
    const userId = req.user.id;
    console.log('Datos recibidos:', { pin, userId });

    const user = await User.findOne({ _id: req.user.id });

    if (!user) {
        return res.status(404).json();
    }

    if (user.pin.toString() === pin.toString()) {
        return res.status(200).json({ success: true, user });
    } else {
        return res.status(401).json({ success: false, message: "PIN incorrecto." });
    }
    } catch (err) {
    console.error("Error al validar el PIN del perfil:", err);
    res.status(500).json();
    }
}
  
  
module.exports = {
    userPost,
    userLogin,
    validateUserPin
};