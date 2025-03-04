const Video = require("../models/VideoModel");

/**
 * Creates a video
 *
 * @param {*} req
 * @param {*} res
 */
const videoPost = async (req, res) => {
    try {
        // Destructure the request body
        const { name, url, description } = req.body;

        // Validate required fields
        if (!name || !url) {
            return res.status(400).json({
                error: "Missing required fields: 'name' and 'url' are mandatory."
            });
        }

        // Create a new video instance
        const video = new Video({
            name,
            url,
            description
        });

        // Save the video to the database
        const savedVideo = await video.save();

        // Return the created video with a 201 status code
        res.status(201).json({
            message: "Video created successfully",
            data: savedVideo
        });
    } catch (err) {
        console.error("Error while saving the video:", err);

        // Handle specific errors (e.g., validation errors)
        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Validation failed",
                details: err.message
            });
        }

        // Handle generic server errors
        res.status(500).json({
            error: "Internal server error"
        });
    }
};


/**
 * Get all videos
 *
 * @param {*} req
 * @param {*} res
 */
const videoGet = async (req, res) => {
    try {
        if (req.query && req.query.id) {
            // Fetch a specific video by ID
            const video = await Video.findById(req.query.id);
            if (!video) {
                return res.status(404).json({ error: "Video not found" });
            }
            return res.status(200).json(video);
        } else {
            // Fetch all videos
            const videos = await Video.find();
            return res.status(200).json(videos);
        }
    } catch (err) {
        console.error("Error while fetching videos:", err);

        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid video ID format" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Edit video by _id
 *
 * @param {*} req
 * @param {*} res
 */
const videoPut = async (req, res) => {
    const { id } = req.params; 
    const { name, url, description} = req.body; 
  
    if (!name || !url || !description) {
        return res.status(400).json({ error: "Todos los campos son requeridos." });
    }
  
    try {
        const video = await Video.findById(id);
        
        if (!video) {
            return res.status(404).json({ error: "Curso no encontrado." });
        }
  
        video.name        = name;
        video.url         = url;
        video.description = description;
  
        await video.save();  
  
        return res.json({video });
    } catch (error) {
        console.error('Error while updating the course:', error);
        return res.status(500).json({ error: "Hubo un error al actualizar el curso." });
    }
  };

/**
 * Delete video by _id
 *
 * @param {*} req
 * @param {*} res
 */
const videoDelete = async (req, res) => {
    try {
        const { id } = req.params;  

        if (!id) {
            return res.status(400).json({ error: "You must provide a valid ID." });
        }

        const deletedVideo = await Video.findByIdAndDelete(id);

        if (!deletedVideo) {
            return res.status(404).json({ error: "Video not found." });
        }

        // Return the deleted object instead of a message
        res.status(200).json(deletedVideo);
    } catch (error) {
        console.error("Error deleting the video:", error);
        res.status(500).json({ error: "An error occurred while deleting the video." });
    }
};
  
module.exports = {
    videoPost,
    videoGet,
    videoPut,
    videoDelete
};