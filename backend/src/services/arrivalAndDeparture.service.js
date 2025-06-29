const axios = require('axios');
const StationEvent = require('../models/stationEvent.model');

const DB_VENDO_BASE_URL = process.env.DB_VENDO_BASE_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

class ArrivalAndDepartureService {
  /**
   * Get arrivals by station ID
   * @param {string} stationId - The ID of the station
   * @returns {Promise<Array>} Array of Arrival instances
   */
  async getArrivalsAndDeparturesByStationId(stationId) {
    try {
      const arrivalsResponse = await axios.get(`${DB_VENDO_BASE_URL}/stops/${stationId}/arrivals`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Accept': 'application/json',
        }
      });

      const departuresResponse = await axios.get(`${DB_VENDO_BASE_URL}/stops/${stationId}/departures`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Accept': 'application/json',
        }
      });

      const rawArrivals = arrivalsResponse.data.arrivals.filter(arrival => {
        if (arrival.line.mode === 'bus' || arrival.line.productName === 'BUS') return false;

        const products = arrival.stop.products;
        const unwantedProducts = ['suburban', 'subway', 'tram', 'bus', 'taxi', 'ferry'];
        return unwantedProducts.every(product => products[product] === false);
      });

      const rawDepartures = departuresResponse.data.departures.filter(departure => {
        if (departure.line.mode === 'bus' || departure.line.productName === 'BUS') return false;

        const products = departure.stop.products;
        const unwantedProducts = ['suburban', 'subway', 'tram', 'bus', 'taxi', 'ferry'];
        return unwantedProducts.every(product => products[product] === false);
      });
      
      const arrivals = await StationEvent.fromRawStationEvents(rawArrivals);
      const departures = await StationEvent.fromRawStationEvents(rawDepartures);
      
      return {
        arrivals,
        departures,
      };
    } catch (error) {
      console.error('Error fetching arrivals and departures:', error);
      throw new Error('Failed to fetch arrivals and departures');
    }
  }
}

module.exports = new ArrivalAndDepartureService();
