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
  const mockJourney = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/journeys', () => {
    it('should return 200 and journey data for valid request', async () => {
      const mockApiResponse = {
        data: {
          journeys: [{
            legs: [{
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
            }]
          }]
        }
      };
      
      axios.get.mockResolvedValue(mockApiResponse);

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: '123',
        name: 'Berlin Hbf',
        destination: 'Hamburg Hbf',
        line: 'ICE 123'
      });
      
      expect(axios.get).toHaveBeenCalledWith(
        'http://test-api.com/journeys',
        expect.objectContaining({
          params: {
            from: '123',
            to: '456',
            departure: '2025-06-28T10:00:00+02:00'
          },
          headers: {
            'Origin': 'http://test-frontend.com',
            'Accept': 'application/json'
          }
        })
      );
    });

    it('should return 400 if required parameters are missing', async () => {
      const response = await request(app)
        .get('/api/journeys')
        .query({ from: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle 404 responses from the API', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };
      axios.get.mockRejectedValue(errorResponse);

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Not found');
    });

    it('should handle 429 rate limit responses from the API', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' }
        }
      };
      axios.get.mockRejectedValue(errorResponse);

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Rate limit exceeded');
    });

    it('should handle empty journey responses', async () => {
      const mockApiResponse = {
        data: {
          journeys: []
        }
      };
      
      axios.get.mockResolvedValue(mockApiResponse);

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });

    it('should not make API call when required parameters are missing', async () => {
      const response = await request(app)
        .get('/api/journeys')
        .query({ from: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return 500 if the API call fails', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should filter out journeys with invalid product types', async () => {
      const mockApiResponse = {
        data: {
          journeys: [{
            legs: [{
              origin: {
                id: '123',
                name: 'Berlin Hbf',
                type: 'station',
                products: { bus: true } // Invalid product type
              },
              destination: { name: 'Hamburg Hbf' },
              direction: 'Hamburg Hbf',
              line: { name: 'Bus 123' },
              arrival: '2025-06-28T12:00:00+02:00',
              departure: '2025-06-28T10:00:00+02:00'
            }]
          }]
        }
      };

      axios.get.mockResolvedValue(mockApiResponse);

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .get('/api/journeys')
        .query({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
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
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return 500 for API errors', async () => {
      const error = new Error('API Error');
      error.response = { status: 500 };
      axios.get.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle network errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));

      const response = await request(app)
        .get('/api/journeys')
        .query({
          from: '123',
          to: '456',
          departure: '2025-06-28T10:00:00+02:00'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
