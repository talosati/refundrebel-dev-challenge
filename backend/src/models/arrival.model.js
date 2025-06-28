/**
 * Arrival model representing a train arrival at a station
 */
class Arrival {
  constructor({
    station,
    line,
    when,
    delay,
    platform,
  }) {
    this.station = station;
    this.line = line;
    this.when = when ? new Date(when) : null;
    this.delay = delay || 0;
    this.platform = platform || null;
  }

  /**
   * Create an Arrival instance from raw data
   * @param {Object} rawArrival - Raw arrival data
   * @returns {Arrival} New Arrival instance
   */
  static fromRawArrival(rawArrival) {
    return new Arrival({
      station: rawArrival.station,
      line: rawArrival.line,
      when: rawArrival.when,
      delay: rawArrival.delay,
      platform: rawArrival.platform,
    });
  }

  /**
   * Create multiple Arrival instances from an array of raw data
   * @param {Array} rawArrivals - Array of raw arrival data
   * @returns {Array} Array of Arrival instances
   */
  static fromRawArrivals(rawArrivals) {
    console.log("rawArrivals", rawArrivals)
    return rawArrivals.map(arrival => new Arrival({
        station: arrival.stop.name,
        line: arrival.line.name,
        when: arrival.when,
        delay: arrival.delay / 60,
        platform: arrival.platform,
    }));
  }
}

module.exports = Arrival;
