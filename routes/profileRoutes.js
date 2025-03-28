const express = require('express');
const router = express.Router();
const {
  profilePost,
  profileGet,
  profilePut,
  profileDelete,
  validatePin,
  getProfileById,
} = require('../controllers/ProfileController');
const authenticate = require('../middleware/auth');

router.post('/profile', authenticate, profilePost);
router.put('/profile/:id', authenticate, profilePut);
router.get('/profile', authenticate, profileGet);
router.delete('/profile/:id', authenticate, profileDelete);
router.post('/profile/validatePin/:profileId', authenticate, validatePin);
router.get('/profile/:id', authenticate, getProfileById);

module.exports = router;