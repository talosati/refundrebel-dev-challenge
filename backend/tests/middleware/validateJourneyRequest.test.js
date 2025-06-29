const httpMocks = require('node-mocks-http');
const validateJourneyRequest = require('../../src/middleware/validateJourneyRequest');

describe('validateJourneyRequest Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest({
      query: {
        from: '123',
        to: '456'
      }
    });
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('should call next() when all required parameters are valid', () => {
    validateJourneyRequest(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).not.toBe(400);
  });

  it('should return 400 if from parameter is missing', () => {
    delete req.query.from;
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Missing required parameters: from and to are required');
  });

  it('should return 400 if to parameter is missing', () => {
    delete req.query.to;
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Missing required parameters: from and to are required');
  });

  it('should not validate departure parameter', () => {
    delete req.query.departure;
    validateJourneyRequest(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).not.toBe(400);
  });

  it('should return 400 if from is an empty string', () => {
    req.query.from = ' ';
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Invalid from station ID');
  });

  it('should return 400 if to is an empty string', () => {
    req.query.to = ' ';
    validateJourneyRequest(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Invalid to station ID');
  });
  
  it('should not call next for empty strings', () => {
    req.query.from = '';
    req.query.to = '';
    validateJourneyRequest(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Missing required parameters: from and to are required');
  });
});
