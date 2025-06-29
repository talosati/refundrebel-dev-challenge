const axios = require('axios');

const originalEnv = { ...process.env };

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
    process.env = { ...originalEnv };
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

    it('should fetch and process journeys with additional parameters', async () => {
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
                    products: { national: true }
                  },
                  destination: { name: 'Hamburg Hbf' },
                  direction: 'Hamburg Hbf',
                  line: { name: 'ICE 123' },
                  arrival: '2025-06-28T12:00:00+02:00',
                  departure: '2025-06-28T10:00:00+02:00',
                  arrivalDelay: 300,
                  departureDelay: 0,
                  arrivalPlatform: '5',
                  departurePlatform: '8'
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
          params: {
            from: '123',
            to: '456',
            departure: '2025-06-28T10:00:00'
          },
          headers: {
            'Accept': 'application/json',
            'Origin': 'http://test-frontend.com'
          }
        }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('id', '123');
      expect(result[0]).toHaveProperty('name', 'Berlin Hbf');
      expect(result[0]).toHaveProperty('destination', 'Hamburg Hbf');
      expect(result[0]).toHaveProperty('line', 'ICE 123');
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValue(new Error(errorMessage));

      await expect(JourneyService.getJourneys(mockParams)).rejects.toThrow(errorMessage);
    });

    it('should handle empty responses', async () => {
      axios.get.mockResolvedValue({ data: {} });

      const result = await JourneyService.getJourneys(mockParams);
      expect(result).toEqual([]);
    });

    it('should handle missing journeys in response', async () => {
      axios.get.mockResolvedValue({ data: { somethingElse: [] } });

      const result = await JourneyService.getJourneys(mockParams);
      expect(result).toEqual([]);
    });
  });
});
