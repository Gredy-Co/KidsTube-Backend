const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'tu_clave_secreta'); 
    console.log("Usuario decodificado:", decoded);
    req.user = decoded; 
    next(); 
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    const profileId = req.params.profileId || req.body.profileId; 

    if (!token || !profileId) {
      return res.status(401).json({ message: 'Token o ID de perfil no proporcionados.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const parentUserId = decoded.id;

      const profile = await Profile.findOne({ _id: profileId, userId: parentUserId });
      if (!profile) {
        return res.status(403).json({ message: 'Acceso denegado. El perfil no pertenece al usuario.' });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para esta acción.' });
      }

      req.profile = profile;
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
  };
};
module.exports = authMiddleware;