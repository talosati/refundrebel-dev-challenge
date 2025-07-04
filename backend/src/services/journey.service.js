const axios = require('axios');
const Journey = require('../models/journey.model');

const DB_VENDO_BASE_URL = process.env.DB_VENDO_BASE_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

class JourneyService {
  /**
   * Fetches and processes journeys based on the given parameters
   * @param {Object} params - Journey search parameters
   * @param {string} params.from - Origin station ID
   * @param {string} params.to - Destination station ID
   * @returns {Promise<Array>} - Array of processed journeys
   */
  static async getJourneys({ from, to }) {
    try {
      const response = await axios.get(`${DB_VENDO_BASE_URL}/journeys`, {
        params: { from, to },
        headers: {
          'Origin': FRONTEND_URL,
          'Accept': 'application/json',
        }
      });
      const filteredJourneys = response.data.journeys.filter(journey => {

        const origin = journey.legs[0].origin;
        const destination = journey.legs[0].destination;
        const line = journey.legs[0].line;
    
        if (origin?.station?.id !== from || destination?.id !== to || line.mode === 'bus' || line.productName === 'BUS' || line.productName === 'S' ) return false;

        const products = origin.products;
        const unwantedProducts = ['suburban', 'subway', 'tram', 'bus', 'taxi', 'ferry'];
        return unwantedProducts.every(product => products[product] === false);
      });

      return Journey.fromRawJourneys(filteredJourneys);
    } catch (error) {
      console.error('Error in JourneyService.getJourneys:', error.message);
      throw error;
    }
  }
}

module.exports = JourneyService;
