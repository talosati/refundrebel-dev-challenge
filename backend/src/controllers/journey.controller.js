const JourneyService = require('../services/journey.service');

/**
 * @desc    Get journey information between two stations
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Filtered and transformed journey data or error message
 */
const getJourneys = async (req, res) => {
  try {
    const { from, to, departure } = req.query;
    
    const journeys = await JourneyService.getJourneys({ from, to, departure });
    
    res.json({
      success: true,
      data: journeys
    });
    
  } catch (error) {
    console.error('Error in getJourneys controller:', error.message);
    
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
        error: error.message || 'Error processing journey request'
      });
    }
  }
};

module.exports = {
  getJourneys
};
