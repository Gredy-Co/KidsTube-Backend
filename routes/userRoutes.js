const express = require('express');
const router = express.Router();
const { userPost, userLogin, verify2FACode, validateUserPin, verifyAccount  } = require('../controllers/UserController');
const authenticate = require('../middleware/auth');

router.post('/user', userPost);
router.post('/user/login', userLogin);
router.post('/user/verify-2fa', verify2FACode);
router.post('/user/validateUserPin', authenticate, validateUserPin);
router.get('/user/verify/:token', verifyAccount);

module.exports = router;