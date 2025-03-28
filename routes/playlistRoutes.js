const express = require('express');
const router = express.Router();
const {
  playlistPost,
  playlistGetAll,
  playlistGetById,
  playlistPut,
  playlistDelete,
  playlistGetByProfileId,
} = require('../controllers/PlaylistController');
const authenticate = require('../middleware/auth');

router.post('/playlist', authenticate, playlistPost);
router.put('/playlist/:id', authenticate, playlistPut);
router.get('/playlists', authenticate, playlistGetAll);
router.get('/playlist/:id', authenticate, playlistGetById);
router.get('/playlist/profile/:profileId', authenticate, playlistGetByProfileId);
router.delete('/playlist/:id', authenticate, playlistDelete);

module.exports = router;