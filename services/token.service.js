const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generates a verification token
 * @param {string} userId - User's ID
 * @returns {string} - JWT Token
 */
const generateVerificationToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.VERIFICATION_TOKEN_SECRET,
    { expiresIn: '1h' } // The token expires in 1 hour
  );
};

/**
 * Verifies a verification token
 * @param {string} token - Token to verify
 * @returns {Object} - Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
};

module.exports = { generateVerificationToken, verifyToken };