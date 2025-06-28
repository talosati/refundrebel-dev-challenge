const httpMocks = require('node-mocks-http');
const axios = require('axios');
const journeyController = require('../../src/controllers/journey.controller');

jest.mock('axios');

describe('Journey Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      query: {
        from: '123',
        to: '456',
        departure: '2025-06-28T10:00:00'
      }
    });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  it('should return journey data when API call is successful', async () => {
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
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toHaveProperty('success', true);
    expect(responseData.data).toEqual([
      {
        id: '123',
        name: 'Berlin Hbf',
        destination: 'Hamburg Hbf',
        direction: 'Hamburg Hbf',
        line: 'ICE 123',
        arrival: '2025-06-28T12:00:00+02:00',
        departure: '2025-06-28T10:00:00+02:00',
        arrivalDelay: 5,
        departureDelay: 0,
        arrivalPlatform: '5',
        departurePlatform: '8'
      }
    ]);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/journeys'),
      expect.objectContaining({
        params: {
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00'
        }
      })
    );
  });

  it('should handle API errors', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: { message: 'Internal server error' }
      }
    };
    
    axios.get.mockRejectedValue(errorResponse);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData).toHaveProperty('error');
  });

  it('should handle network errors', async () => {
    const error = new Error('Network Error');
    error.request = {};
    
    axios.get.mockRejectedValue(error);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(503);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('No response received');
  });

  it('should handle request setup errors', async () => {
    const error = new Error('Request setup failed');
    
    axios.get.mockRejectedValue(error);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Request setup failed');
  });

  it('should handle 401 unauthorized responses', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
    
    axios.get.mockRejectedValue(errorResponse);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(401);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Unauthorized');
  });

  it('should handle 403 forbidden responses', async () => {
    const errorResponse = {
      response: {
        status: 403,
        data: { message: 'Forbidden' }
      }
    };
    
    axios.get.mockRejectedValue(errorResponse);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(403);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Forbidden');
  });

  it('should handle 422 validation errors', async () => {
    const errorResponse = {
      response: {
        status: 422,
        data: { 
          message: 'Validation failed',
          details: ['Invalid departure time']
        }
      }
    };
    
    axios.get.mockRejectedValue(errorResponse);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(422);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Validation failed');
    expect(responseData.details).toBeDefined();
  });

  it('should handle invalid date format in response', async () => {
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
                departure: 'invalid-date',
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
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.data[0].departure).toBe('invalid-date');
  });
});
