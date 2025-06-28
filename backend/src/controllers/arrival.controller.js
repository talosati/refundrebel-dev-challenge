const arrivalService = require('../services/arrival.service');

/**
 * Controller for handling arrival-related HTTP requests
 */
class ArrivalController {
  /**
   * Get arrivals by station ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getArrivalsByStationId(req, res) {
    try {
      const { stationId } = req.params;
      
      if (!stationId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Station ID is required' 
        });
      }

      const arrivals = await arrivalService.getArrivalsByStationId(stationId);
      
      return res.status(200).json({
        success: true,
        data: arrivals
      });
    } catch (error) {
      console.error('Error in getArrivalsByStationId:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new ArrivalController();
