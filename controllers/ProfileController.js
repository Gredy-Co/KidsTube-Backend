const Profile = require("../models/ProfileModel");

const profileGet = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); 
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const profiles = await Profile.find({ createdBy: req.user.id });

        if (profiles.length === 0) {
            return res.status(404).json({ error: "No se encontraron perfiles para este usuario" });
        }

        res.status(200).json({ data: profiles });

    } catch (err) {
        console.error("Error al obtener los perfiles:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


// Create a profile
const profilePost = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); 

        const { fullName, pin, avatar } = req.body;

        if (!fullName || !pin || !avatar) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios."
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

        res.status(201).json({
            data: populatedProfile
        });
    } catch (err) {
        console.error("Error al guardar el perfil:", err);

        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Error de validación",
                details: err.message
            });
        }

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};

const profilePut = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); 

        const { id } = req.params; 
        const { fullName, pin, avatar } = req.body;

        if (!fullName || !pin || !avatar) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios."
            });
        }

        if (pin.length !== 6 || !/^\d+$/.test(pin)) {
            return res.status(400).json({
                error: "El PIN debe ser un número de 6 dígitos."
            });
        }

        const profile = await Profile.findOne({ _id: id, createdBy: req.user.id });
        if (!profile) {
            return res.status(404).json({
                error: "Perfil no encontrado o no tienes permisos para editarlo."
            });
        }

        profile.fullName = fullName;
        profile.pin = pin;
        profile.avatar = avatar;

        const updatedProfile = await profile.save();

        const populatedProfile = await Profile.findById(updatedProfile._id).populate('createdBy');

        res.status(200).json({
            data: populatedProfile
        });
    } catch (err) {
        console.error("Error al actualizar el perfil:", err);

        if (err.name === "ValidationError") {
            return res.status(422).json({
                error: "Error de validación",
                details: err.message
            });
        }

        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};

const profileDelete = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); 
        console.log("id:", req.params); 

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const { id } = req.params; 
        const profile = await Profile.findOneAndDelete({ _id: id, createdBy: req.user.id });
        console.log("profile:", profile); 

        if (!profile) {
            return res.status(404).json({ error: "Perfil no encontrado o no tienes permisos para eliminarlo" });
        }

        res.status(200).json(profile);

    } catch (err) {
        console.error("Error al eliminar el perfil:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

const validatePin = async (req, res) => {
    try {
      const { profileId } = req.params; 
      const { pin } = req.body; 
      const userId = req.user.id;
      console.log('Datos recibidos:', { profileId, pin, userId });

      const profile = await Profile.findOne({ _id: profileId, createdBy: req.user.id });
  
      if (!profile) {
        return res.status(404).json({ error: "Perfil no encontrado o no pertenece al usuario." });
      }
  
      if (profile.pin.toString() === pin.toString()) {
        return res.status(200).json({ success: true, profile });
      } else {
        return res.status(401).json({ success: false, message: "PIN incorrecto." });
      }
    } catch (err) {
      console.error("Error al validar el PIN del perfil:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
}


module.exports = {
    profilePost,
    profileGet,
    profilePut,
    profileDelete,
    validatePin
};
