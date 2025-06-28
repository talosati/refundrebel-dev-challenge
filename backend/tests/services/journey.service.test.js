const axios = require('axios');

process.env.DB_VENDO_BASE_URL = 'http://test-api.com';
process.env.FRONTEND_URL = 'http://test-frontend.com';

const JourneyService = require('../../src/services/journey.service');

jest.mock('axios');

jest.mock('../../src/models/journey.model', () => {
  const originalModule = jest.requireActual('../../src/models/journey.model');
  return {
    ...originalModule,
    fromRawJourneys: jest.fn((journeys) => 
      journeys.map(j => ({
        id: j.legs[0]?.origin?.id,
        name: j.legs[0]?.origin?.name,
        destination: j.legs[0]?.destination?.name,
        line: j.legs[0]?.line?.name
      }))
    )
  };
});

describe('JourneyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getJourneys', () => {
    const mockParams = {
      from: '123',
      to: '456',
      departure: '2025-06-28T10:00:00'
    };

    it('should fetch and process journeys successfully', async () => {
      const mockResponse = {
        data: {
          journeys: [
            {
              legs: [
                {
                  origin: { 
                    id: '123',
                    name: 'Berlin Hbf',
                    type: 'station',
                    products: { national: true, regional: true }
                  },
                  destination: { name: 'Hamburg Hbf' },
                  line: { name: 'ICE 123' },
                  direction: 'Hamburg Hbf'
                }
              ]
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await JourneyService.getJourneys(mockParams);

      expect(axios.get).toHaveBeenCalledWith(
        'http://test-api.com/journeys',
        {
          params: mockParams,
          headers: {
            'Origin': 'http://test-frontend.com',
            'Accept': 'application/json'
          }
        }
      );

      expect(result).toEqual([
        {
          id: '123',
          name: 'Berlin Hbf',
          destination: 'Hamburg Hbf',
          line: 'ICE 123'
        }
      ]);
    });

    it('should filter out non-valid product types', async () => {
      const mockResponse = {
        data: {
          journeys: [
            {
              legs: [
                {
                  origin: { 
                    id: '123',
                    name: 'Berlin Hbf',
                    type: 'station',
                    products: { subway: true }
                  },
                  destination: { name: 'Hamburg Hbf' },
                  line: { name: 'U1' },
                  direction: 'Hamburg Hbf'
                }
              ]
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await JourneyService.getJourneys(mockParams);
      expect(result).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(JourneyService.getJourneys(mockParams)).rejects.toThrow('API Error');
      expect(consoleSpy).toHaveBeenCalledWith('Error in JourneyService.getJourneys:', 'API Error');
      
      consoleSpy.mockRestore();
    });

    it('should handle empty journeys array', async () => {
      const mockResponse = { data: { journeys: [] } };
      axios.get.mockResolvedValue(mockResponse);

      const result = await JourneyService.getJourneys(mockParams);
      expect(result).toEqual([]);
    });
  });
});
