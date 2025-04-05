const validator = require('validator');
const User = require('../../models/UserModel');

function validateUserData(data) {
    const errors = [];
    const { email, password, phoneNumber, pin, firstName, lastName, country, dateOfBirth, status } = data;

    const nameRegex = /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ'-]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const pinRegex = /^\d{6}$/;

    // First Name validation
    if (!firstName || !nameRegex.test(firstName)) errors.push("Invalid first name.");
    if (!lastName || !nameRegex.test(lastName)) errors.push("Invalid last name.");
    if (!country || !nameRegex.test(country)) errors.push("Invalid country.");

    // Date of Birth validation
    if (!dateOfBirth) {
        errors.push("Date of birth is required.");
    } else {
        const birthDate = new Date(dateOfBirth);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
        if (isNaN(birthDate.getTime()) || birthDate > minAgeDate) errors.push("You must be at least 18 years old.");
    }

    // Email validation
    if (!email || !validator.isEmail(email)) errors.push("Invalid email.");
    
    // Password validation
    if (!password || password.length < 6) errors.push("Password must be at least 6 characters.");
    
    // PIN validation
    if (!pin || !pinRegex.test(pin)) errors.push("PIN must be 6 digits.");

    // Phone Number validation
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) errors.push("Invalid phone number.");
    
    // Status validation
    if (!status || !['active', 'inactive'].includes(status)) errors.push("Status must be active or inactive.");

    return errors;
}

module.exports = { validateUserData };
