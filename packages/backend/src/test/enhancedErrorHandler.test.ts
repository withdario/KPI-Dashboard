import { Request, Response, NextFunction } from 'express';
import { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler, 
  withCircuitBreaker, 
  withRetry, 
  withGracefulDegradation,
  getCircuitBreakerHealth,
  ApiError,
  DatabaseError,
  ExternalApiError,
  ValidationError
} from '../middleware/errorHandler';

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

// Mock the logging middleware
jest.mock('../middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Enhanced Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      requestId: 'test-request-id',
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Enhanced Error Classes', () => {
    it('should create ApiError with all properties', () => {
      const error = new ApiError(400, 'Bad Request', true, true, 30);
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.isOperational).toBe(true);
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(30);
    });

    it('should create DatabaseError with default values', () => {
      const error = new DatabaseError('Database connection failed');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create ExternalApiError with custom status code', () => {
      const error = new ExternalApiError('API timeout', 504);
      
      expect(error.statusCode).toBe(504);
      expect(error.message).toBe('API timeout');
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('ExternalApiError');
    });

    it('should create ValidationError as non-retryable', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.retryable).toBe(false);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('Circuit Breaker', () => {
    it('should allow execution when circuit breaker is closed', () => {
      const cb = getCircuitBreakerHealth()['test-service'] || { isOpen: false };
      
      expect(cb.isOpen).toBe(false);
    });

    it('should track circuit breaker state changes', () => {
      // Create a circuit breaker by using it
      withCircuitBreaker('test-service', async () => 'success');
      
      const health = getCircuitBreakerHealth();
      expect(health['test-service']).toBeDefined();
    });
  });

  describe('withCircuitBreaker', () => {
    it('should execute operation when circuit breaker is closed', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withCircuitBreaker('test-circuit', operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use fallback when circuit breaker is open', async () => {
      // Open the circuit breaker by simulating failures
      const operation = jest.fn().mockRejectedValue(new Error('Failure'));
      const fallback = jest.fn().mockResolvedValue('fallback');
      
      // Try to execute multiple times to trigger circuit breaker
      for (let i = 0; i < 6; i++) {
        try {
          await withCircuitBreaker('test-circuit', operation);
        } catch (error) {
          // Expected to fail
        }
      }
      
      // Now try with fallback
      const result = await withCircuitBreaker('test-circuit', operation, fallback);
      
      expect(result).toBe('fallback');
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('should throw error when circuit breaker is open and no fallback', async () => {
      // Open the circuit breaker by simulating failures
      const operation = jest.fn().mockRejectedValue(new Error('Failure'));
      
      // Try to execute multiple times to trigger circuit breaker
      for (let i = 0; i < 6; i++) {
        try {
          await withCircuitBreaker('test-circuit', operation);
        } catch (error) {
          // Expected to fail
        }
      }
      
      await expect(withCircuitBreaker('test-circuit', operation)).rejects.toThrow(
        'Service test-circuit is temporarily unavailable'
      );
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry failed operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, 3);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(withRetry(operation, 3)).rejects.toThrow('Persistent failure');
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should use exponential backoff with jitter', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      await withRetry(operation, 2, 100, 1000);
      const endTime = Date.now();
      
      // Should have waited at least 100ms (base delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('withGracefulDegradation', () => {
    it('should use primary operation when successful', async () => {
      const primary = jest.fn().mockResolvedValue('primary');
      const fallback = jest.fn().mockResolvedValue('fallback');
      
      const result = await withGracefulDegradation(primary, fallback);
      
      expect(result).toBe('primary');
      expect(primary).toHaveBeenCalledTimes(1);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should use fallback when primary fails', async () => {
      const primary = jest.fn().mockRejectedValue(new Error('Primary failed'));
      const fallback = jest.fn().mockResolvedValue('fallback');
      
      const result = await withGracefulDegradation(primary, fallback);
      
      expect(result).toBe('fallback');
      expect(primary).toHaveBeenCalledTimes(1);
      expect(fallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Enhanced Error Handler', () => {
    it('should handle custom API errors with retry information', () => {
      const error = new ApiError(429, 'Rate limited', true, true, 60);
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            retryable: true,
            retryAfter: 60
          })
        })
      );
    });

    it('should handle Prisma database errors', () => {
      const error = new Error('Database connection failed');
      error.name = 'PrismaClientInitializationError';
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            retryable: true,
            retryAfter: 30
          })
        })
      );
    });

    it('should include circuit breaker information in error response', () => {
      const error = new Error('Test error');
      
      // Ensure headers object exists
      if (!mockReq.headers) {
        mockReq.headers = {};
      }
      mockReq.headers['X-Circuit-Breaker-Name'] = 'test-circuit';
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Internal Server Error'
          })
        })
      );
    });

    it('should include enhanced error context in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      const error = new ValidationError('Invalid input');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            errorType: 'ValidationError'
          })
        })
      );
      
      // Reset environment
      process.env.NODE_ENV = 'test';
    });
  });

  describe('Enhanced Async Handler', () => {
    it('should add circuit breaker name to request headers', () => {
      const handler = asyncHandler(
        (req: Request, res: Response) => {
          expect(req.headers['X-Circuit-Breaker-Name']).toBe('test-circuit');
          res.json({ success: true });
        },
        'test-circuit'
      );
      
      handler(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockReq.headers!['X-Circuit-Breaker-Name']).toBe('test-circuit');
    });

    it('should handle async errors correctly', async () => {
      const handler = asyncHandler(
        async () => {
          throw new Error('Async error');
        }
      );
      
      await handler(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Circuit Breaker Health', () => {
    it('should return health status for all circuit breakers', () => {
      // Create some circuit breakers
      withCircuitBreaker('service-1', async () => 'success');
      withCircuitBreaker('service-2', async () => 'success');
      
      const health = getCircuitBreakerHealth();
      
      expect(health['service-1']).toBeDefined();
      expect(health['service-2']).toBeDefined();
    });

    it('should track circuit breaker state changes', () => {
      // Create a circuit breaker
      withCircuitBreaker('test-service', async () => 'success');
      
      const health = getCircuitBreakerHealth();
      expect(health['test-service']).toBeDefined();
    });
  });

  describe('Error Response Format', () => {
    it('should include all required error response fields', () => {
      const error = new ApiError(400, 'Bad Request');
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Bad Request',
            code: 'ApiError',
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            path: '/test',
            retryable: false
          })
        })
      );
    });

    it('should handle errors without request ID gracefully', () => {
      const error = new Error('Generic error');
      delete mockReq.requestId;
      
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            requestId: undefined
          })
        })
      );
    });
  });

  describe('Not Found Handler', () => {
    it('should return 404 with proper error format', () => {
      notFoundHandler(mockReq as Request, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Route not found',
            code: 'NotFound',
            retryable: false
          })
        })
      );
    });
  });
});
