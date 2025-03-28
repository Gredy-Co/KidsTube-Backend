const mongoose = require('mongoose');
const Playlist = require("../models/PlaylistModel");

/**
 * Creates a playlist
 *
 * @param {*} req
 * @param {*} res
 */
const playlistPost = async (req, res) => {
    try {
        // Destructure the request body
        const { name, associatedProfiles, videos } = req.body;

        // Validate required fields
        if (!name || !associatedProfiles || !Array.isArray(associatedProfiles) || associatedProfiles.length === 0) {
            return res.status(400).json({
                error: "Missing required fields: 'name' and at least one 'associatedProfiles' are mandatory."
            });
        }

        const createdBy = req.user.id;

        // Create a new playlist instance
        const playlist = new Playlist({
            name,
            associatedProfiles,
            videos: videos || [],
            createdBy
        });

        // Save the playlist to the database
        const savedPlaylist = await playlist.save();

        // Return the created playlist with a 201 status code
        res.status(201).json( savedPlaylist );
    } catch (err) {
        console.error("Error while saving the playlist:", err);

        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Validation failed",
                details: err.message
            });
        }

        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get all playlists or a single playlist by ID for the authenticated user
 *
 * @param {*} req
 * @param {*} res
 */
const playlistGetAll = async (req, res) => {
    try {
    
        const playlists = await Playlist.find({ createdBy: req.user.id })
          .populate('associatedProfiles')
          .populate('videos');
    
        if (!playlists || playlists.length === 0) {
          return res.status(404).json({ error: "No playlists found for this profile" });
        }
    
        return res.status(200).json(playlists);
      } catch (err) {
        console.error("Error while fetching playlists by profile ID:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
};




/**
 * Edit playlist by _id
 *
 * @param {*} req
 * @param {*} res
 */
const playlistPut = async (req, res) => {
    const { id } = req.params;
    const createdBy = req.user.id;
    const { name, associatedProfiles, videos } = req.body;

    // Validación de campos
    if (!name || !associatedProfiles || !Array.isArray(associatedProfiles) || associatedProfiles.length === 0) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Verificar que los IDs de associatedProfiles sean válidos (ObjectId)
    const isValidObjectId = mongoose.Types.ObjectId.isValid;
    if (!associatedProfiles.every(id => isValidObjectId(id))) {
        return res.status(400).json({ error: "Invalid profile ID in associatedProfiles." });
    }

    try {
        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found." });
        }

        playlist.name = name;
        playlist.associatedProfiles = associatedProfiles;
        playlist.videos = videos || [];
        playlist.createdBy = createdBy;

        await playlist.save();

        return res.json(playlist);
    } catch (error) {
        console.error('Error while updating the playlist:', error);
        return res.status(500).json({ error: "An error occurred while updating the playlist." });
    }
};

/**
 * Delete playlist by _id
 *
 * @param {*} req
 * @param {*} res
 */
const playlistDelete = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json();
        }

        const deletedPlaylist = await Playlist.findByIdAndDelete(id);

        if (!deletedPlaylist) {
            return res.status(404).json();
        }

        res.status(200).json(deletedPlaylist);
    } catch (error) {
        console.error("Error deleting the playlist:", error);
        res.status(500).json({ error: "An error occurred while deleting the playlist." });
    }
};


const playlistGetById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("id:", req.params); 

        
        const playlist = await Playlist.findById(id).populate('videos');
        console.log("playlist:", playlist); 

        if (!playlist) {
            return res.status(404).json();
        }
        return res.status(200).json(playlist);
    } catch (err) {
        console.error("Error while fetching playlist by ID:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const playlistGetByProfileId = async (req, res) => {
    try {
      const { profileId } = req.params;
  
      const playlists = await Playlist.find({ associatedProfiles: profileId })
        .populate('associatedProfiles')
        .populate('videos');
  
      if (!playlists || playlists.length === 0) {
        return res.status(404).json({ error: "No playlists found for this profile" });
      }
  
      return res.status(200).json(playlists);
    } catch (err) {
      console.error("Error while fetching playlists by profile ID:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  
module.exports = {
    playlistPost,
    playlistGetAll,
    playlistGetById,
    playlistPut,
    playlistDelete,
    playlistGetByProfileId
};