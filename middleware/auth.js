const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Obtener el token del encabezado
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Verificar si el token existe
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, 'tu_clave_secreta'); // Usa la misma clave secreta que en el login
    console.log("Usuario decodificado:", decoded); // Verifica que el token se decodifique correctamente
    req.user = decoded; // Añadir el usuario decodificado a la solicitud
    next(); // Continuar con la siguiente función middleware
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;