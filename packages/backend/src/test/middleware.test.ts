import { Request, Response, NextFunction } from 'express';
import { requestLogging, errorLogging } from '../middleware/logging';
import { errorHandler, notFoundHandler, ApiError, asyncHandler } from '../middleware/errorHandler';
import { requestMetrics, healthCheck, systemMetrics } from '../middleware/monitoring';

// Mock Winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

describe('Logging Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
      requestId: 'test-request-id'
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('requestLogging', () => {
    it('should add request ID to request object', () => {
      const req = mockReq as Request;
      requestLogging(req, mockRes as Response, mockNext);
      
      expect(req.requestId).toBeDefined();
      expect(typeof req.requestId).toBe('string');
      expect(req.requestId.length).toBeGreaterThan(0);
    });

    it('should call next()', () => {
      requestLogging(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set up response finish listener', () => {
      const res = mockRes as Response;
      requestLogging(mockReq as Request, res, mockNext);
      
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });

  describe('errorLogging', () => {
    it('should call next with error', () => {
      const error = new Error('Test error');
      errorLogging(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

describe('Error Handling Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      requestId: 'test-request-id',
      method: 'GET',
      originalUrl: '/test'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('ApiError class', () => {
    it('should create error with correct properties', () => {
      const error = new ApiError(400, 'Bad Request');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.isOperational).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should create non-operational error', () => {
      const error = new ApiError(500, 'Internal Error', false);
      
      expect(error.isOperational).toBe(false);
    });
  });

  describe('errorHandler', () => {
    it('should handle ApiError correctly', () => {
      const error = new ApiError(400, 'Bad Request');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Bad Request',
            code: 'Error' // ApiError instances have name 'Error' by default
          })
        })
      );
    });

    it('should handle ValidationError correctly', () => {
      const error = new Error('Validation Error');
      error.name = 'ValidationError';
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Validation Error',
            code: 'ValidationError'
          })
        })
      );
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            stack: error.stack
          })
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with correct error format', () => {
      notFoundHandler(mockReq as Request, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Route not found',
            code: 'NotFound',
            requestId: 'test-request-id'
          })
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('should wrap async function and catch errors', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFn = asyncHandler(asyncFn);
      
      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should pass through successful async function', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);
      
      await wrappedFn(mockReq as Request, mockRes as Response, mockNext);
      
      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

describe('Monitoring Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/test'
    };
    mockRes = {
      statusCode: 200,
      on: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('requestMetrics', () => {
    it('should increment total requests', () => {
      const res = mockRes as Response;
      requestMetrics(mockReq as Request, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should track successful requests', () => {
      const res = mockRes as Response;
      res.statusCode = 200;
      
      requestMetrics(mockReq as Request, res, mockNext);
      
      // Simulate response finish
      const finishCallback = (res.on as jest.Mock).mock.calls[0][1];
      finishCallback();
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should track failed requests', () => {
      const res = mockRes as Response;
      res.statusCode = 500;
      
      requestMetrics(mockReq as Request, res, mockNext);
      
      // Simulate response finish
      const finishCallback = (res.on as jest.Mock).mock.calls[0][1];
      finishCallback();
      
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      healthCheck(mockReq as Request, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Object),
          environment: expect.any(String),
          version: expect.any(String),
          metrics: expect.any(Object),
          system: expect.any(Object)
        })
      );
    });
  });

  describe('systemMetrics', () => {
    it('should return system metrics', () => {
      systemMetrics(mockReq as Request, mockRes as Response);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          uptime: expect.any(Object),
          requests: expect.any(Object),
          performance: expect.any(Object),
          system: expect.any(Object)
        })
      );
    });
  });
});
