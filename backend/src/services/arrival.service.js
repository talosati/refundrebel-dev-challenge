const axios = require('axios');
const Arrival = require('../models/stationEvent.model');

const DB_VENDO_BASE_URL = process.env.DB_VENDO_BASE_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

class ArrivalService {
  /**
   * Get arrivals by station ID
   * @param {string} stationId - The ID of the station
   * @returns {Promise<Array>} Array of Arrival instances
   */
  async getArrivalsByStationId(stationId) {
    try {
      const response = await axios.get(`${DB_VENDO_BASE_URL}/stops/${stationId}/arrivals`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Accept': 'application/json',
        }
      });

      const rawArrivals = response.data.arrivals.filter(arrival => {
        const p = arrival.stop.products;
        return p && (p.national || p.nationalExpress || p.regional || p.regionalExpress);
      });

      return Arrival.fromRawArrivals(rawArrivals);
    } catch (error) {
      console.error('Error fetching arrivals:', error);
      throw new Error('Failed to fetch arrivals');
    }
  }
}

module.exports = new ArrivalService();
