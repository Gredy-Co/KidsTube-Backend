const Profile = require("../models/ProfileModel");

const profileGet = async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user); // Verificar que req.user esté definido

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No autorizado" });
        }

        // Buscar todos los perfiles creados por el usuario autenticado
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
        console.log("Usuario autenticado:", req.user); // Verificar que req.user esté definido

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
        console.log("Usuario autenticado:", req.user); // Verificar que req.user esté definido

        const { id } = req.params; // Obtener el ID del perfil desde los parámetros de la URL
        const { fullName, pin, avatar } = req.body;

        // Validar que todos los campos obligatorios estén presentes
        if (!fullName || !pin || !avatar) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios."
            });
        }

        // Validar que el PIN sea un número de 6 dígitos
        if (pin.length !== 6 || !/^\d+$/.test(pin)) {
            return res.status(400).json({
                error: "El PIN debe ser un número de 6 dígitos."
            });
        }

        // Verificar que el perfil pertenezca al usuario autenticado
        const profile = await Profile.findOne({ _id: id, createdBy: req.user.id });
        if (!profile) {
            return res.status(404).json({
                error: "Perfil no encontrado o no tienes permisos para editarlo."
            });
        }

        // Actualizar el perfil
        profile.fullName = fullName;
        profile.pin = pin;
        profile.avatar = avatar;

        const updatedProfile = await profile.save();

        // Poblar el campo createdBy para devolver el perfil actualizado con los datos del usuario
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

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const { id } = req.params; 
        const profile = await Profile.findOneAndDelete({ _id: id, createdBy: req.user.id });

        if (!profile) {
            return res.status(404).json({ error: "Perfil no encontrado o no tienes permisos para eliminarlo" });
        }

        res.status(200).json({ message: "Perfil eliminado exitosamente" });

    } catch (err) {
        console.error("Error al eliminar el perfil:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = {
    profilePost,
    profileGet,
    profilePut,
    profileDelete
};
