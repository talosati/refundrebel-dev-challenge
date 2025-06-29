const httpMocks = require('node-mocks-http');
const StationService = require('../../src/services/station.service');
const stationController = require('../../src/controllers/station.controller');

jest.mock('../../src/services/station.service', () => ({
  getAllStations: jest.fn()
}));

describe('Station Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getAllStations', () => {
    it('should return a list of stations', async () => {
      const mockStations = [
        {
          id: '123',
          name: 'Berlin Hbf',
          address: '10115, Berlin, Europaplatz 1'
        },
        {
          id: '456',
          name: 'Hamburg Hbf',
          address: '20099, Hamburg, Hachmannplatz 16'
        }
      ];
      
      StationService.getAllStations.mockResolvedValue(mockStations);

      await stationController.getAllStations(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        data: mockStations
      });
      
      expect(StationService.getAllStations).toHaveBeenCalledTimes(1);
    });

    it('should handle errors properly', async () => {
      const errorMessage = 'Failed to fetch stations';
      StationService.getAllStations.mockRejectedValue(new Error(errorMessage));

      const originalError = console.error;
      console.error = jest.fn();

      await stationController.getAllStations(req, res);

      console.error = originalError;

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        success: false,
        error: errorMessage
      });
    });
  });
});
