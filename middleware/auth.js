const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key'); 
    console.log("Decoded user:", decoded);
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
      return res.status(401).json({ message: 'Token or profile ID not provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const parentUserId = decoded.id;

      const profile = await Profile.findOne({ _id: profileId, userId: parentUserId });
      if (!profile) {
        return res.status(403).json({ message: 'Access denied. The profile does not belong to the user.' });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ message: 'Access denied. You do not have permission to perform this action.' });
      }

      req.profile = profile;
      next();
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
  };
};
module.exports = authMiddleware, authorizeRole;