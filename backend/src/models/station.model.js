class Station {
  /**
   * Creates a new Station instance
   * @param {Object} data - Station data
   * @param {string} data.name - Station name
   * @param {string} data.address - Station address
   */
  constructor({ id, name, address }) {
    this.id = id;
    this.name = name;
    this.address = address;
  }

  /**
   * Creates Station instances from raw data
   * @param {Array} stations - Array of raw station data
   * @returns {Array} Array of Station instances
   */
  static fromRawStations(stations) {
    return stations.map(station => new Station({
        id: station.id,
        name: station.name,
        address: station.address.zipcode + ", " + station.address.city + ", " + station.address.street
    }));
  }
}

module.exports = Station;
