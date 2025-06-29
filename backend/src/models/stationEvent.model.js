class StationEvent {
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

  static fromRawStationEvent(rawStationEvent) {
    return new StationEvent({
      station: rawStationEvent.station,
      line: rawStationEvent.line,
      when: rawStationEvent.when,
      delay: rawStationEvent.delay,
      platform: rawStationEvent.platform,
    });
  }

  static fromRawStationEvents(rawStationEvents) {
    console.log("rawStationEvents", rawStationEvents)
    return rawStationEvents.map(stationEvent => new StationEvent({
        station: stationEvent.stop.name,
        line: stationEvent.line.name,
        when: stationEvent.when,
        delay: stationEvent.delay / 60,
        platform: stationEvent.platform,
    }));
  }
}

module.exports = StationEvent;
