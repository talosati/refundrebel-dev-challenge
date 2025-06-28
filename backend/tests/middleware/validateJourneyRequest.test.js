const httpMocks = require('node-mocks-http');
const validateJourneyRequest = require('../../src/middleware/validateJourneyRequest');

describe('validateJourneyRequest Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest({
      query: {
        from: '123',
        to: '456',
        departure: '2025-06-28T10:00:00'
      }
    });
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('should call next() when all parameters are valid', () => {
    validateJourneyRequest(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).not.toBe(400);
  });

  it('should return 400 if from parameter is missing', () => {
    delete req.query.from;
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should return 400 if to parameter is missing', () => {
    delete req.query.to;
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should return 400 if departure parameter is missing', () => {
    delete req.query.departure;
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should return 400 if departure is not in ISO 8601 format', () => {
    req.query.departure = 'invalid-date';
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should return 400 if from is an empty string', () => {
    req.query.from = '';
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('should return 400 if to is an empty string', () => {
    req.query.to = '';
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});
