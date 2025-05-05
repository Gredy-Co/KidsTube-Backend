const API_URL  = "http://localhost:3000/api/user"; 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt   = require('bcryptjs'); // To encrypt the password

// Define the user schema
const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        match: [/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ'-]+$/, 'Please enter a valid first name']
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        match: [/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ'-]+$/, 'Please enter a valid last name']
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.']
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    pin: {
        type: String,
        match: [/^\d{6}$/, 'The PIN must contain 6 digits.']
    },
    phoneNumber: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number.']
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(value) {
                if (this.isGoogleAuth) return true; // no validar si es Google
                const minAgeDate = new Date();
                minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
                return value && value instanceof Date && value <= minAgeDate;
            },
            message: 'You must be at least 18 years old'
        }
    },
    country: {
        type: String,
        trim: true,
        match: [/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ'-]+$/, 'Please enter a valid country']
    },
    isGoogleAuth: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        trim: true,
        enum: ['active', 'pending', 'inactive'],
        default: 'pending'
    },
    twoFACode: { 
        type: String, 
        default: null 
    },
    twoFAExpires: { 
        type: Date, 
        default: null 
    }
});


// Middleware to encrypt the password before saving the user
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Encrypt the password
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('user', userSchema);


