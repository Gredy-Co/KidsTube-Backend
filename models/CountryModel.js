const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the country schema
const countrySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
});

module.exports = mongoose.model('Countries', countrySchema);