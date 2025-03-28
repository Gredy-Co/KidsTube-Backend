const express = require('express');
const router = express.Router();
const { userPost, userLogin, validateUserPin } = require('../controllers/UserController');
const authenticate = require('../middleware/auth');

router.post('/user', userPost);
router.post('/user/login', userLogin);
router.post('/user/validateUserPin', authenticate, validateUserPin);

module.exports = router;