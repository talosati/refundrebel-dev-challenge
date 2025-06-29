const Station = require('../../src/models/station.model');

describe('Station Model', () => {
  describe('fromRawStations', () => {
    it('should convert raw station data to Station instances', () => {
      const rawStations = [
        {
          id: '123',
          name: 'Berlin Hbf',
          address: {
            zipcode: '10115',
            city: 'Berlin',
            street: 'Europaplatz 1'
          }
        },
        {
          id: '456',
          name: 'Hamburg Hbf',
          address: {
            zipcode: '20099',
            city: 'Hamburg',
            street: 'Hachmannplatz 16'
          }
        }
      ];

      const stations = Station.fromRawStations(rawStations);

      expect(stations).toHaveLength(2);
      expect(stations[0]).toBeInstanceOf(Station);
      expect(stations[0]).toHaveProperty('id', '123');
      expect(stations[0]).toHaveProperty('name', 'Berlin Hbf');
      expect(stations[0]).toHaveProperty('address', '10115, Berlin, Europaplatz 1');
      
      expect(stations[1]).toHaveProperty('id', '456');
      expect(stations[1]).toHaveProperty('name', 'Hamburg Hbf');
      expect(stations[1]).toHaveProperty('address', '20099, Hamburg, Hachmannplatz 16');
    });

    it('should handle empty input', () => {
      const stations = Station.fromRawStations([]);
      expect(stations).toEqual([]);
    });
  });
});
