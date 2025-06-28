const { readStations } = require('db-stations');
const Station = require('../models/station.model.js');

class StationService {
  /**
   * Fetches all stations
   * @returns {Promise<Array>}
   */
  static async getAllStations() {
    try {
      const stations = [];
      for await (const station of readStations()) {
        stations.push(station);
      }
      return Station.fromRawStations(stations);
    } catch (error) {
      console.error('Error in StationService.getAllStations:', error.message);
      throw error;
    }
  }
}

module.exports = StationService;
