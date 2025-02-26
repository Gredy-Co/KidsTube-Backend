const API_URL = "http://localhost:3000/api/video"; 

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const video = new Schema({
  name: { type: String },
  url: { type: String },
  description: { type: String },
});

module.exports = mongoose.model('video', video);