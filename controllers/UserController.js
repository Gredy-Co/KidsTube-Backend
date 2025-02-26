const User = require("../models/UserModel");

/**
 * Creates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPost = async (req, res) => {
    try {
        // Destructure the request body
        const { email, password, confirmPassword, phoneNumber, pin, firstName, lastName, country, dateOfBirth, state } = req.body;

        // Validate required fields
        if (!email || !password || !confirmPassword || !phoneNumber || !pin || !firstName || !lastName || !country || !dateOfBirth || !state) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios."
            });
        }

        // Validate that passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                error: "Las contraseñas no coinciden."
            });
        }

        // Create a new user instance
        const user = new User({
            email,
            password, // La contraseña se encriptará automáticamente gracias al middleware en el modelo
            phoneNumber,
            pin,
            firstName,
            lastName,
            country,
            dateOfBirth,
            state
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Remove the password from the response for security
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        // Return the created user with a 201 status code
        res.status(201).json({
            message: "Usuario creado exitosamente",
            data: userResponse
        });
    } catch (err) {
        console.error("Error while saving the user:", err);

        // Handle specific errors (e.g., validation errors)
        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Error de validación",
                details: err.message
            });
        }

        // Handle duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({
                error: "El correo electrónico ya está registrado."
            });
        }

        // Handle generic server errors
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};

module.exports = {
    userPost
};