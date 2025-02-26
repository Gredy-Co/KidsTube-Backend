const API_URL = "http://localhost:3000/api/user"; 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const bcrypt = require('bcryptjs'); // Para encriptar la contraseña

// Definir el esquema del usuario
const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    pin: {
        type: String
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    state: {
        type: String,
        trim: true
    }
});

// Middleware para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Encriptar la contraseña
    }
    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('user', userSchema);