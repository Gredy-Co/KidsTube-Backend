const API_URL  = "http://localhost:3000/api/profile"; 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ProfileSchema = new mongoose.Schema({
  fullName: { 
    type: String,
    trim: true, 
    required: true,
    match: [/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ'-]+$/, 'Please enter a valid name'] 
  },
  pin: { 
    type: String, 
    trim: true, 
    required: true, 
    match: [/^\d{6}$/, 'The PIN must contain 6 digits.']
  },
  avatar: { 
    type: String, 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
});

module.exports = mongoose.model('Profile', ProfileSchema);