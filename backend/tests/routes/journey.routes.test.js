const request = require('supertest');
const express = require('express');
const axios = require('axios');

process.env.DB_VENDO_BASE_URL = 'http://test-api.com';
process.env.FRONTEND_URL = 'http://test-frontend.com';

const journeyRoutes = require('../../src/routes/journey.routes');

jest.mock('axios');

const app = express();
app.use(express.json());
app.use('/api/journeys', journeyRoutes);

describe('Journey Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and journey data for valid request', async () => {
    const mockResponse = {
      data: {
        journeys: [
          { id: 1, departure: '2025-06-28T10:00:00', arrival: '2025-06-28T12:00:00' }
        ]
      }
    };
    
    axios.get.mockResolvedValue(mockResponse);

    const response = await request(app)
      .get('/api/journeys')
      .query({
        from: '123',
        to: '456',
        departure: '2025-06-28T10:00:00'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse.data);
    
    expect(axios.get).toHaveBeenCalledWith(
      'http://test-api.com/journeys',
      expect.objectContaining({
        params: {
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00'
        },
        headers: {
          'Origin': 'http://test-frontend.com',
          'Accept': 'application/json'
        }
      })
    );
  });

  it('should return 400 for missing parameters', async () => {
    const response = await request(app)
      .get('/api/journeys')
      .query({
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid date format', async () => {
    const response = await request(app)
      .get('/api/journeys')
      .query({
        from: '123',
        to: '456',
        departure: 'invalid-date'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    axios.get.mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Internal server error' }
      }
    });

    const response = await request(app)
      .get('/api/journeys')
      .query({
        from: '123',
        to: '456',
        departure: '2025-06-28T10:00:00'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});
