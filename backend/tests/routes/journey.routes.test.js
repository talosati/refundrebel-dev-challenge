const request = require('supertest');
const express = require('express');
const journeyRoutes = require('../../src/routes/journey.routes');
const journeyService = require('../../src/services/journey.service');
const { validateJourneyRequest } = require('../../src/middleware/validateJourneyRequest');

jest.mock('../../src/middleware/validateJourneyRequest');
jest.mock('../../src/services/journey.service');

const app = express();
app.use(express.json());
app.use('/api/journeys', journeyRoutes);

describe('Journey Routes', () => {
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    validateJourneyRequest.mockImplementation((req, res, next) => {
      next();
    });
    
    mockNext = jest.fn();
  });

  it('should return 200 and journey data for valid request', async () => {
    const mockJourneys = [
      {
        id: '1',
        name: 'Berlin Hbf',
        destination: 'Munich Hbf',
        departure: '2025-06-28T10:00:00',
        arrival: '2025-06-28T16:30:00',
        line: 'ICE 123'
      }
    ];
    
    journeyService.fetchJourneys.mockResolvedValue(mockJourneys);

    const response = await request(app)
      .get('/api/journeys')
      .query({
        from: '8000105', // Berlin Hbf
        to: '8010330',   // Munich Hbf
        departure: '2025-06-28T10:00:00'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: mockJourneys
    });
    
    expect(journeyService.fetchJourneys).toHaveBeenCalledWith({
      from: '8000105',
      to: '8010330',
      departure: '2025-06-28T10:00:00'
    });
  });

  it('should return 400 for missing parameters', async () => {
    validateJourneyRequest.mockImplementation((req, res, next) => {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    });

    const response = await request(app)
      .get('/api/journeys')
      .query({}); // Missing required parameters

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'Missing required parameters'
    });
    expect(journeyService.fetchJourneys).not.toHaveBeenCalled();
  });

  it('should return 500 for service errors', async () => {
    const error = new Error('Service error');
    journeyService.fetchJourneys.mockRejectedValue(error);

    const response = await request(app)
      .get('/api/journeys')
      .query({
        from: '8000105',
        to: '8010330',
        departure: '2025-06-28T10:00:00'
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: 'Failed to fetch journeys: Service error'
    });
  });

  it('should handle validation errors from service', async () => {
    const error = new Error('Invalid parameters');
    error.status = 400;
    journeyService.fetchJourneys.mockRejectedValue(error);

    const response = await request(app)
      .get('/api/journeys')
      .query({
        from: '8000105',
        to: '8010330',
        departure: '2025-06-28T10:00:00'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'Invalid parameters'
    });
  });
});
