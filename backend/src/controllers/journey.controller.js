const axios = require('axios');

const DB_VENDO_BASE_URL = process.env.DB_VENDO_BASE_URL || 'http://localhost:3001';

/**
 * @desc    Get journey information between two stations
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Journey data or error message
 */const getJourneys = async (req, res) => {
  try {
    const { from, to, departure } = req.query;

    const response = await axios.get(`${DB_VENDO_BASE_URL}/journeys`, {
      params: {
        from,
        to,
        departure
      },
      headers: {
        'Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
        'Accept': 'application/json',
      }
    });

    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching journey data:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data?.message || 'Error from DB Vendo API',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'No response received from DB Vendo API'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Error setting up request to DB Vendo API'
      });
    }
  }
};

module.exports = {
  getJourneys
};
