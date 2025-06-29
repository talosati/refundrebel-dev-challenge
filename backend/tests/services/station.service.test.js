const StationService = require('../../src/services/station.service');
const Station = require('../../src/models/station.model');

jest.mock('db-stations', () => {
  const mockStations = [
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

  async function* createAsyncIterator() {
    for (const station of mockStations) {
      yield station;
    }
  }

  return {
    readStations: jest.fn(() => ({
      [Symbol.asyncIterator]: createAsyncIterator
    }))
  };
});

jest.mock('../../src/models/station.model', () => {
  return {
    fromRawStations: jest.fn((stations) => 
      stations.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address ? `${s.address.zipcode}, ${s.address.city}, ${s.address.street}` : ''
      }))
    )
  };
});

describe('StationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStations', () => {
    it('should return an array of stations', async () => {
      const result = await StationService.getAllStations();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      
      expect(Station.fromRawStations).toHaveBeenCalledTimes(1);
      
      expect(result[0]).toHaveProperty('id', '123');
      expect(result[0]).toHaveProperty('name', 'Berlin Hbf');
      expect(result[0]).toHaveProperty('address', '10115, Berlin, Europaplatz 1');
      
      expect(result[1]).toHaveProperty('id', '456');
      expect(result[1]).toHaveProperty('name', 'Hamburg Hbf');
      expect(result[1]).toHaveProperty('address', '20099, Hamburg, Hachmannplatz 16');
    });

    it('should handle errors properly', async () => {
      const originalFromRawStations = Station.fromRawStations;
      
      const errorMessage = 'Failed to process stations';
      Station.fromRawStations.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const originalError = console.error;
      console.error = jest.fn();

      try {
        await expect(StationService.getAllStations()).rejects.toThrow(errorMessage);
      } finally {
        Station.fromRawStations = originalFromRawStations;
        console.error = originalError;
      }
    });
  });
});
