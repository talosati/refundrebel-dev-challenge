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
      to: '456'
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
                    products: { regional: true, bus: false, subway: false },
                    station: { id: '123' }
                  },
                  destination: { id: '456', name: 'Hamburg Hbf' },
                  line: { name: 'ICE 123', mode: 'train', productName: 'ICE' },
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
            to: '456'
          },
          headers: {
            'Origin': 'http://test-frontend.com',
            'Accept': 'application/json'
          }
        }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
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
                    products: { subway: true, bus: false },
                    station: { id: '123' }
                  },
                  destination: { id: '456', name: 'Hamburg Hbf' },
                  line: { name: 'U1', mode: 'subway', productName: 'U-Bahn' },
                }
              ]
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await JourneyService.getJourneys(mockParams);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0); 
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
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
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
                    products: { regional: true, bus: false, subway: false },
                    station: { id: '123' }
                  },
                  destination: { id: '456', name: 'Hamburg Hbf' },
                  line: { name: 'ICE 123', mode: 'train', productName: 'ICE' },
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
            to: '456'
          },
          headers: {
            'Accept': 'application/json',
            'Origin': 'http://test-frontend.com'
          }
        }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      const error = new Error(errorMessage);
      axios.get.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(JourneyService.getJourneys(mockParams)).rejects.toThrow(errorMessage);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in JourneyService.getJourneys:', 
        expect.anything()
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle empty responses', async () => {
      axios.get.mockResolvedValue({ 
        data: { 
          journeys: [] 
        } 
      });

      const result = await JourneyService.getJourneys(mockParams);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle missing journeys in response', async () => {
      axios.get.mockResolvedValue({ 
        data: { 
          journeys: [] 
        } 
      });

      const result = await JourneyService.getJourneys(mockParams);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
