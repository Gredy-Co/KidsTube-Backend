const API_URL  = "http://localhost:3000/api/user"; 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt   = require('bcryptjs'); // To encrypt the password

// Define the user schema
const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true 
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number.']
    },
    pin: {
        type: String,
        match: [/^\d{4}$/, 'The PIN must contain 4 digits.']
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    country: {
        type: String,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value && value instanceof Date && value < new Date(); 
            },
            message: 'The date of birth must be valid.'
        }
    },
    status: {
        type: String,
        trim: true,
        enum: ['active', 'inactive'],
        default: 'active'
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


