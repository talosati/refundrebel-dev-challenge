const StationService = require('../services/station.service');

/**
 * @desc    Get all stations
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} List of stations or error message
 */
const getAllStations = async (req, res) => {
  try {
    const stations = await StationService.getAllStations();
    
    res.json({
      success: true,
      data: stations
    });
    
  } catch (error) {
    console.error('Error in getAllStations controller:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error fetching stations'
    });
  }
};

module.exports = {
  getAllStations
};
