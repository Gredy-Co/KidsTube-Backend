const express = require('express');
const router = express.Router();

const { searchVideos,getPopularVideos } = require('../controllers/YoutubeController');

router.get('/search', searchVideos);
router.get('/popular', getPopularVideos);

module.exports = router;