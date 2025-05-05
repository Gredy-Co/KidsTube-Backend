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
            return res.status(400).json();
        }

        // Create a new video instance
        const video = new Video({
            name,
            url,
            description,
            createdBy: req.user.id, 
        });

        // Save the video to the database
        const savedVideo = await video.save();

        // Return the created video with a 201 status code
        res.status(201).json( savedVideo
        );
    } catch (err) {
        console.error("Error while saving the video:", err);

        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Validation failed",
                details: err.message
            });
        }

        res.status(500).json();
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
      const { id } = req.query;
  
      const { user } = req;
      if (!user) {
        return res.status(401).json({ error: "No autorizado" });
      }
  
      if (id) {
        const video = await Video.findOne({ _id: id, createdBy: user.id });
  
        if (!video) {
          return res.status(404).json({ error: "Video no encontrado o no tienes permisos" });
        }
  
        return res.status(200).json(video);
      }
  
      const videos = await Video.find({ createdBy: user.id });
  
      return res.status(200).json(videos);
    } catch (err) {
      console.error("Error while fetching videos:", err);
  
      if (err.name === "CastError") {
        return res.status(400).json({ error: "ID inválido" });
      }
  
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };


const videoGetById = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json();
        }

        res.status(200).json(video);
    } catch (err) {
        console.error("Error while fetching video by ID:", err);

        if (err.name === "CastError") {
            return res.status(400).json();
        }

        res.status(500).json();
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
    const updateData = req.body;

    try {
        // Verificar si el video existe
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json();
        }

        // Actualizar solo los campos proporcionados en el cuerpo de la solicitud
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] !== undefined) {
                video[key] = updateData[key];
            }
        });

        // Guardar los cambios en la base de datos
        const updatedVideo = await video.save();

        // Devolver el video actualizado
        res.status(200).json(updatedVideo);
    } catch (error) {
        console.error("Error while updating the video:", error);

        if (error.name === "ValidationError") {
            return res.status(422).json({
                error: "Validation failed",
                details: error.message
            });
        }

        return res.status(500).json();
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
            return res.status(400).json();
        }

        const deletedVideo = await Video.findByIdAndDelete(id);

        if (!deletedVideo) {
            return res.status(404).json();
        }

        res.status(200).json(deletedVideo);
    } catch (error) {
        console.error("Error deleting the video:", error);
        res.status(500).json();
    }
};
  
const videoGetByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const videos = await Video.find({ createdBy: userId });

        if (!videos || videos.length === 0) {
            return res.status(404).json({ message: "No videos found for this user." });
        }

        res.status(200).json(videos);
    } catch (err) {
        console.error("Error while fetching videos by user ID:", err);

        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid user ID format." });
        }

        res.status(500).json({ message: "Internal server error." });
    }
};
module.exports = {
    videoPost,
    videoGet,
    videoGetById,
    videoPut,
    videoDelete,
    videoGetByUser
};