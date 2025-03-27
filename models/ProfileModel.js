const API_URL  = "http://localhost:3000/api/profile"; 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ProfileSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  pin: { 
    type: String, 
    required: true, 
    minlength: 4
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
  role: { type: String, enum: ['parent', 'profile'], default: 'profile' }

});

module.exports = mongoose.model('Profile', ProfileSchema);