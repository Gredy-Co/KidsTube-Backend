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

    // Validar que se proporcionen email y contraseña
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Buscar al usuario en la base de datos
        const user = await User.findOne({ email });

        // Verificar si el usuario existe
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Comparar la contraseña proporcionada con la almacenada
        const isMatch = await bcrypt.compare(password, user.password);

        // Verificar si la contraseña es correcta
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email }, // Datos que quieres incluir en el token
            'tu_clave_secreta', // Clave secreta (debe ser la misma que usas para verificar el token)
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // Devolver el token y los datos del usuario
        return res.status(200).json({
            token, // Token JWT
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                // Incluye otros datos que quieras devolver
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

  
  
  



module.exports = {
    userPost,
    userLogin
};
