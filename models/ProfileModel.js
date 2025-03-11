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
    minlength: 6, 
    maxlength: 6 
  },
  avatar: { 
    type: String, 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  } 
});

module.exports = mongoose.model('Profile', ProfileSchema);