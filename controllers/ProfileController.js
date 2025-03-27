const Profile = require("../models/ProfileModel");

const profileGet = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); // Verifica que el usuario esté decodificado correctamente
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

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No autorizado" });
        }
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

        res.status(201).json(populatedProfile);
    } catch (err) {
        console.error("Error al guardar el perfil:", err);

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
        profile.pin      = pin;
        profile.avatar   = avatar;

        const updatedProfile = await profile.save();

        const populatedProfile = await Profile.findById(updatedProfile._id).populate('createdBy');

        res.status(200).json(populatedProfile
        );
    } catch (err) {
        console.error("Error al actualizar el perfil:", err);

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
      if (!req.user || !req.user.id) {
        return res.status(401).json();
    }
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

const getProfileById = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user);
        
        // Verificar autenticación
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No autorizado" });
        }

        // Obtener el ID del perfil de los parámetros de la ruta
        const profileId = req.params.id;
        
        // Validar el ID
        if (!profileId) {
            return res.status(400).json({ error: "Se requiere el ID del perfil" });
        }

        // Buscar el perfil (verificando que pertenezca al usuario)
        const profile = await Profile.findOne({
            _id: profileId,
            createdBy: req.user.id
        });

        if (!profile) {
            return res.status(404).json({ 
                error: "Perfil no encontrado o no tienes permisos para acceder a él" 
            });
        }

        // Devolver el perfil encontrado
        res.status(200).json(profile);

    } catch (err) {
        console.error("Error al obtener el perfil:", err);
        
        // Manejar específicamente errores de ID inválido
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "ID de perfil inválido" });
        }
        
        res.status(500).json({ error: "Error interno del servidor" });
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
