const express = require('express');
const router = express.Router();
const {
  countriesGet,
  countriesPost
} = require('../controllers/CountryController');
const authenticate = require('../middleware/auth');


router.get('/countries', authenticate, countriesGet);
router.post('/countries', authenticate, countriesPost);


module.exports = router;
