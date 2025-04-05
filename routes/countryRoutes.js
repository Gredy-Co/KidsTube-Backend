const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/countries', async (req, res) => {
    try {
      const totalPages = 24;
      let allCountries = [];
  
      // We make requests to each page
      for (let page = 1; page <= totalPages; page++) {
        const response = await axios.get(`https://api.thecompaniesapi.com/v2/locations/countries?page=${page}`);
        const countries = response.data.countries.map(country => country.name); 
  
        allCountries = allCountries.concat(countries); 
      }
  
      allCountries.sort((a, b) => a.localeCompare(b));
  
      res.json(allCountries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting countries' });
    }
  });  

module.exports = router;
