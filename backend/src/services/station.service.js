const {readStations} = require('db-stations');

const Station = require('../models/station.model');

class StationService {
  /**
   * Fetches all stations
   * @returns {Promise<Array>}
   */
  static async getAllStations() {
    try {
      return Station.fromRawStations(readStations);
    } catch (error) {
      console.error('Error in StationService.getAllStations:', error.message);
      throw error;
    }
  }
}

module.exports = StationService;
