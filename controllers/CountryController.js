const Country = require(" ../models/CountryModel");

const countriesGet = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json();
        }

        const profiles = await Country.find({ createdBy: req.user.id });

        if (profiles.length === 0) {
            return res.status(404).json({ error: "No se encontraron perfiles para este usuario" });
        }

        res.status(200).json( profiles );

    } catch (err) {
        console.error("Error al obtener los perfiles:", err);
        res.status(500).json();
    }
};

const countriesPost = async (req, res) => {
    try {
        // Extraer el nombre del país del cuerpo de la solicitud
        const { name } = req.body;

        // Validar que el campo "name" esté presente
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'El nombre del país es obligatorio y debe ser una cadena no vacía.' });
        }


        // Crear el nuevo país
        const newCountry = new Country({
            name: name.trim() // Limpiar espacios en blanco innecesarios
        });

        // Guardar el país en la base de datos
        await newCountry.save();

        // Responder con el país creado
        res.status(201).json({
            message: 'País creado exitosamente.',
            country: newCountry
        });
    } catch (error) {
        console.error('Error al crear el país:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


module.exports = {
   countriesGet,
   countriesPost
};