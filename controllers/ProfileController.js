const Profile = require("../models/ProfileModel");

const profileGet = async (req, res) => {
    try {
        console.log("Authenticated user:", req.user);
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const profiles = await Profile.find({ createdBy: req.user.id });

        if (profiles.length === 0) {
            return res.status(404).json({ error: "No profiles were found for this user" });
        }

        res.status(200).json({ data: profiles });

    } catch (err) {
        console.error("Error getting profiles:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Create a profile
const profilePost = async (req, res) => {
    try {

        const { fullName, pin, avatar } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!fullName || !pin || !avatar) {
            return res.status(400).json({
                error: "All fields are required."
            });
        }

        const createdBy = req.user.id;

        const profile = new Profile({
            fullName,
            pin,
            avatar,
            createdBy 
        });

        const savedProfile = await profile.save();

        const populatedProfile = await Profile.findById(savedProfile._id).populate('createdBy');

        res.status(201).json(populatedProfile);
    } catch (err) {
        console.error("Error saving profile:", err);

        if (err.name === "ValidationError") {
            return res.status(422).json();
        }

        res.status(500).json();
    }
};

const profilePut = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json();
        }
        const { id } = req.params; 
        const { fullName, pin, avatar } = req.body;

        if (!fullName || !pin || !avatar) {
            return res.status(400).json();
        }

        if (pin.length !== 6 || !/^\d+$/.test(pin)) {
            return res.status(400).json({
                error: "The PIN must be a 6-digit number."
            });
        }

        const profile = await Profile.findOne({ _id: id, createdBy: req.user.id });
        if (!profile) {
            return res.status(404).json({
                error: "Profile not found or you do not have permission to edit it."
            });
        }

        profile.fullName = fullName;
        profile.pin      = pin;
        profile.avatar   = avatar;

        const updatedProfile = await profile.save();

        const populatedProfile = await Profile.findById(updatedProfile._id).populate('createdBy');

        res.status(200).json(populatedProfile
        );
    } catch (err) {
        console.error("Error updating profile:", err);

        if (err.name === "ValidationError") {
            return res.status(422).json();
        }

        res.status(500).json();
    }
};

const profileDelete = async (req, res) => {
    try {
        
        if (!req.user || !req.user.id) {
            return res.status(401).json();
        }

        const { id } = req.params; 
        const profile = await Profile.findOneAndDelete({ _id: id, createdBy: req.user.id });
        console.log("profile:", profile); 

        if (!profile) {
            return res.status(404).json({ error: "Profile not found or you do not have permission to delete it" });
        }

        res.status(200).json(profile);

    } catch (err) {
        console.error("Error deleting profile:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const validatePin = async (req, res) => {
    try {
      const { profileId } = req.params; 
      const { pin } = req.body; 
      const userId = req.user.id;
      if (!req.user || !req.user.id) {
        return res.status(401).json();
    }
      const profile = await Profile.findOne({ _id: profileId, createdBy: req.user.id });
  
      if (!profile) {
        return res.status(404).json({ error: "Profile not found or does not belong to the user." });
      }
  
      if (profile.pin.toString() === pin.toString()) {
        return res.status(200).json({ success: true, profile });
      } else {
        return res.status(401).json({ success: false, message: "Incorrect PIN." });
      }
    } catch (err) {
      console.error("Error validating profile PIN:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

const getProfileById = async (req, res) => {
    try {
        console.log("Authenticated user:", req.user);
        
        // Verificar autenticación
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Obtener el ID del perfil de los parámetros de la ruta
        const profileId = req.params.id;
        
        // Validar el ID
        if (!profileId) {
            return res.status(400).json({ error: "Profile ID is required" });
        }

        // Buscar el perfil (verificando que pertenezca al usuario)
        const profile = await Profile.findOne({
            _id: profileId,
            createdBy: req.user.id
        });

        if (!profile) {
            return res.status(404).json({ 
                error: "Profile not found or you do not have permission to access it" 
            });
        }

        // Devolver el perfil encontrado
        res.status(200).json(profile);

    } catch (err) {
        console.error("Error getting profile:", err);
        
        // Manejar específicamente errores de ID inválido
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid profile ID" });
        }
        
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = {
    profilePost,
    profileGet,
    profilePut,
    profileDelete,
    validatePin,
    getProfileById
};