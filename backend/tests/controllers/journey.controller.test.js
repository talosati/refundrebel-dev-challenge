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
          { id: 1, departure: '2025-06-28T10:00:00', arrival: '2025-06-28T12:00:00' }
        ]
      }
    };
    
    axios.get.mockResolvedValue(mockResponse);
    
    await journeyController.getJourneys(req, res);
    
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockResponse.data);
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
    expect(responseData.error).toContain('setting up request');
  });
});
