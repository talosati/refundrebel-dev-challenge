const Journey = require('../../src/models/journey.model');

describe('Journey Model', () => {
  describe('fromRawJourneys', () => {
    it('should transform and filter raw journey data correctly', () => {
      const mockRawJourneys = [
        {
          legs: [
            {
              origin: { id: '123', name: 'Berlin Hbf' },
              destination: { name: 'Hamburg Hbf' },
              direction: 'Hamburg Hbf',
              line: { name: 'ICE 123' },
              arrival: '2025-06-28T12:00:00+02:00',
              departure: '2025-06-28T10:00:00+02:00',
              arrivalDelay: 120,
              departureDelay: 60,
              arrivalPlatform: '5',
              departurePlatform: '8'
            }
          ]
        },
        {
          legs: [
            {
              origin: { id: '123', name: 'Berlin Hbf' },
              destination: { name: 'Hamburg Hbf' },
              direction: 'Hamburg Hbf',
              line: { name: 'S1' },
              arrival: '2025-06-28T12:00:00+02:00',
              departure: '2025-06-28T10:00:00+02:00'
            }
          ]
        },
        {
          legs: [
            {
              origin: { id: '123', name: 'Same Station' },
              destination: { name: 'Same Station' },
              direction: 'Same Station',
              line: { name: 'ICE 456' },
              arrival: '2025-06-28T12:00:00+02:00',
              departure: '2025-06-28T10:00:00+02:00'
            }
          ]
        }
      ];

      const result = Journey.fromRawJourneys(mockRawJourneys);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Journey);
      expect(result[0]).toMatchObject({
        id: '123',
        name: 'Berlin Hbf',
        destination: 'Hamburg Hbf',
        direction: 'Hamburg Hbf',
        line: 'ICE 123',
        arrival: '2025-06-28T12:00:00+02:00',
        departure: '2025-06-28T10:00:00+02:00',
        arrivalDelay: 2,
        departureDelay: 1,
        arrivalPlatform: '5',
        departurePlatform: '8'
      });
      expect(result[1]).toMatchObject({
        id: '123',
        name: 'Berlin Hbf',
        destination: 'Hamburg Hbf',
        line: 'S1'
      });
    });

    it('should handle empty input', () => {
      expect(Journey.fromRawJourneys([])).toEqual([]);
      expect(() => Journey.fromRawJourneys(null)).toThrow();
      expect(() => Journey.fromRawJourneys(undefined)).toThrow();
    });
  });
});
