const arrivalAndDepartureService = require('../services/arrivalAndDeparture.service');


class ArrivalAndDepartureController {
  /**
   * Get arrivals by station ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getArrivalsAndDeparturesByStationId(req, res) {
    try {
      const { stationId } = req.params;
      
      if (!stationId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Station ID is required' 
        });
      }

      const arrivalsAndDepartures = await arrivalAndDepartureService.getArrivalsAndDeparturesByStationId(stationId);
      
      return res.json(arrivalsAndDepartures);
    } catch (error) {
      console.error('Error in getArrivalsAndDeparturesByStationId:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new ArrivalAndDepartureController();
