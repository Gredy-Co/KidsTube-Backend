const User = require('../../models/UserModel');

// Function to validate PIN, checking if the PIN entered matches the one stored in the database
const validateUserPin = async (req, res) => {
    try {
        const { pin } = req.body; 
        const userId = req.user.id; // Get the user ID from the authentication middleware

        // Find the user by ID
        const user = await User.findOne({ _id: userId });

        // If user not found in the database, return a 404 error
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Compare the entered PIN with the one stored in the database
        if (user.pin.toString() === pin.toString()) {
            return res.status(200).json({ success: true, user });
        } else {
            return res.status(401).json({ success: false, message: "Incorrect PIN." });
        }
    } catch (err) {
        console.error("Error validating PIN:", err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = validateUserPin;
