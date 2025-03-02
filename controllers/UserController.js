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
        const { email, password, phoneNumber, pin, firstName, lastName, country, dateOfBirth, status } = req.body;

        console.log("Hola esto es", req.body);  // Verifica los datos que el servidor está recibiendo

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
            message: "User created successfully",
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

module.exports = {
    userPost
};
