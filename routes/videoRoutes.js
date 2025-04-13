const express = require('express');
const router = express.Router();
const {
  videoPost,
  videoGet,
  videoGetById,
  videoPut,
  videoDelete,
  videoGetByUser,
} = require('../controllers/VideoController');
const authenticate = require('../middleware/auth');

router.post('/video', authenticate, videoPost);
router.put('/video/:id', authenticate, videoPut);
router.get('/video', authenticate, videoGet);
router.get('/video/user', authenticate, videoGetByUser);
router.get('/video/:id', authenticate, videoGetById);
router.delete('/video/:id', authenticate, videoDelete);

module.exports = router;