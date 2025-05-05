const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const searchVideos = async (req, res) => {
  try {
    const query = req.query.q; 
    console.log('YouTube API Key:', YOUTUBE_API_KEY);
    if (!query) {
      return res.status(400).json({ error: 'El parámetro "q" es requerido.' });
    }

    const url = `https://www.googleapis.com/youtube/v3/search`;
    
    const response = await axios.get(url, {
      params: {
        part: 'snippet',
        q: query,
        key: YOUTUBE_API_KEY,
        type: 'video', 
        maxResults: 10, 
      },
    });

    const videos = response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    }));

    res.json(videos);
  } catch (error) {
    console.error('Error al consumir la API de YouTube:', error.message);
    res.status(500).json({ error: 'Error al consumir la API de YouTube' });
  }
};
const getPopularVideos = async (req, res) => {
    console.error('getPopularVideos');

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos`;
  
      const response = await axios.get(url, {
        params: {
          part: 'snippet',
          chart: 'mostPopular', 
          key: YOUTUBE_API_KEY,
          maxResults: 12, 
          videoCategoryId: 10,
          safeSearch: 'strict',
          q: 'para niños',
        },
      });
  
      const videos = response.data.items.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
      }));
  
      res.json(videos);
    } catch (error) {
      console.error('Error al consumir la API de YouTube:', error.message);
      res.status(500).json({ error: 'Error al consumir la API de YouTube' });
    }
  };
module.exports = {
  searchVideos,
  getPopularVideos,
};