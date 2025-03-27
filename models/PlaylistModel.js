const API_URL  = "http://localhost:3000/api/playlist"; 

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: { type: String, required: true },
    associatedProfiles: [{ type: Schema.Types.ObjectId, ref: 'Profile', required: true }],
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video', required: true }] 
});


module.exports = mongoose.model('Playlist', playlistSchema);
