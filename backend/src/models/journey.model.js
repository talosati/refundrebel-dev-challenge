/**
 * Journey model representing a filtered and transformed journey
 */
class Journey {
  constructor({
    id,
    name,
    destination,
    direction,
    line,
    arrival,
    arrivalDelay,
    arrivalPlatform,
    departure,
    departureDelay,
    departurePlatform
  }) {
    this.id = id;
    this.name = name;
    this.destination = destination;
    this.direction = direction;
    this.line = line;
    this.arrival = arrival;
    this.arrivalDelay = arrivalDelay;
    this.arrivalPlatform = arrivalPlatform;
    this.departure = departure;
    this.departureDelay = departureDelay;
    this.departurePlatform = departurePlatform;
  }

  /**
   * Creates Journey instances from raw journey legs
   * @param {Array} journeys - Array of raw journey objects from the API
   * @returns {Array} - Array of filtered and transformed Journey instances
   */
  static fromRawJourneys(journeys) {
    return journeys.flatMap(journey => 
      journey.legs
        .map(leg => new Journey({
          id: leg.origin?.id,
          name: leg.origin?.name,
          destination: leg.destination?.name,
          direction: leg.direction,
          line: leg.line?.name,
          arrival: leg.arrival,
          departure: leg.departure,
          arrivalDelay: leg.arrivalDelay / 60,
          arrivalPlatform: leg.arrivalPlatform,
          departureDelay: leg.departureDelay / 60,
          departurePlatform: leg.departurePlatform,
        }))
        .filter(journey => 
          journey.name !== journey.destination && 
          !!journey.line && 
          !journey.line.startsWith('S ') && 
          !!journey.arrival && 
          !!journey.departure
        )
    );
  }
}

module.exports = Journey;
