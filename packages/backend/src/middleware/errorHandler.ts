import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

// Enhanced error classes for different error types
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public retryable: boolean;
  public retryAfter?: number;

  constructor(statusCode: number, message: string, isOperational = true, retryable = false, retryAfter?: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.retryable = retryable;
    if (retryAfter !== undefined) {
      this.retryAfter = retryAfter;
    }
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, retryable = true) {
    super(500, message, true, retryable);
    this.name = 'DatabaseError';
  }
}

export class ExternalApiError extends ApiError {
  constructor(message: string, statusCode = 502, retryable = true) {
    super(statusCode, message, true, retryable);
    this.name = 'ExternalApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message, true, false);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(401, message, true, false);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(403, message, true, false);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(404, message, true, false);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, true, false);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string, retryAfter?: number) {
    super(429, message, true, true, retryAfter);
    this.name = 'RateLimitError';
  }
}

// Circuit breaker state management
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  threshold: number;
  timeout: number;
}

class CircuitBreaker {
  private state: CircuitBreakerState;
  private readonly name: string;

  constructor(name: string, threshold = 5, timeout = 60000) {
    this.name = name;
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      threshold,
      timeout
    };
  }

  canExecute(): boolean {
    if (!this.state.isOpen) return true;
    
    if (Date.now() >= this.state.nextAttemptTime) {
      this.state.isOpen = false;
      this.state.failureCount = 0;
      return true;
    }
    
    return false;
  }

  onSuccess(): void {
    this.state.failureCount = 0;
    this.state.isOpen = false;
  }

  onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();
    
    if (this.state.failureCount >= this.state.threshold) {
      this.state.isOpen = true;
      this.state.nextAttemptTime = Date.now() + this.state.timeout;
      
      logger.warn(`Circuit breaker opened for ${this.name}`, {
        failureCount: this.state.failureCount,
        threshold: this.state.threshold,
        nextAttemptTime: new Date(this.state.nextAttemptTime).toISOString()
      });
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Global circuit breaker instances
const circuitBreakers = new Map<string, CircuitBreaker>();

export const getCircuitBreaker = (name: string): CircuitBreaker => {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name));
  }
  return circuitBreakers.get(name)!;
};

// Enhanced error response format
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    requestId: string;
    timestamp: string;
    path: string;
    retryable: boolean;
    retryAfter?: number;
  };
  details?: any;
  circuitBreaker?: {
    name: string;
    state: string;
    nextAttemptTime?: string;
  };
}

/**
 * Enhanced error handling middleware with circuit breaker support
 * Provides standardized error responses, proper logging, and circuit breaker management
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  let retryable = false;
  let retryAfter: number | undefined;

  // Handle custom API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    retryable = err.retryable;
    retryAfter = err.retryAfter;
  }

  // Handle specific error types with enhanced logic
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    retryable = false;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    retryable = false;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    retryable = false;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    retryable = false;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    retryable = false;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
    retryable = false;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
    retryable = false;
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
    retryable = false;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
    retryable = true;
  } else if (err.name === 'PrismaClientUnknownRequestError') {
    statusCode = 500;
    message = 'Unknown database error';
    retryable = true;
  } else if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Database validation error';
    retryable = false;
  } else if (err.name === 'PrismaClientInitializationError') {
    statusCode = 503;
    message = 'Database connection failed';
    retryable = true;
    retryAfter = 30; // Retry after 30 seconds
  }

  // Log error with enhanced context
  logger.error('Error occurred', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
    isOperational,
    retryable,
    retryAfter,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    referer: req.get('Referer')
  });

  // Create enhanced error response
  const errorResponse: ErrorResponse = {
    error: {
      message,
      code: err.name || 'InternalError',
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      retryable,
      ...(retryAfter !== undefined && { retryAfter })
    }
  };

  // Add circuit breaker information if available
  const circuitBreakerName = req.get('X-Circuit-Breaker-Name');
  if (circuitBreakerName && circuitBreakers.has(circuitBreakerName)) {
    const cb = circuitBreakers.get(circuitBreakerName)!;
    const state = cb.getState();
    errorResponse.circuitBreaker = {
      name: circuitBreakerName,
      state: state.isOpen ? 'open' : 'closed',
      ...(state.isOpen && { nextAttemptTime: new Date(state.nextAttemptTime).toISOString() })
    };
  }

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: err.stack,
      originalMessage: err.message,
      errorType: err.constructor.name
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: {
      message: 'Route not found',
      code: 'NotFound',
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      retryable: false
    }
  };

  res.status(404).json(errorResponse);
};

/**
 * Enhanced async error wrapper with circuit breaker support
 * Catches async errors and passes them to error handler
 */
export const asyncHandler = (fn: Function, circuitBreakerName?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add circuit breaker name to request headers for error context
    if (circuitBreakerName) {
      req.headers['X-Circuit-Breaker-Name'] = circuitBreakerName;
    }

    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Circuit breaker wrapper for external API calls
 */
export const withCircuitBreaker = <T>(
  name: string,
  operation: () => Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<T> => {
  const cb = getCircuitBreaker(name);
  
  if (!cb.canExecute()) {
    logger.warn(`Circuit breaker ${name} is open, using fallback or failing`);
    if (fallback) {
      return Promise.resolve(fallback());
    }
    throw new ExternalApiError(`Service ${name} is temporarily unavailable`, 503, true);
  }

  return operation()
    .then(result => {
      cb.onSuccess();
      return result;
    })
    .catch(error => {
      cb.onFailure();
      throw error;
    });
};

/**
 * Retry wrapper with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 30000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
      const totalDelay = delay + jitter;
      
      logger.info(`Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay}ms`, {
        attempt: attempt + 1,
        maxRetries,
        delay: totalDelay,
        error: lastError.message
      });
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError!;
};

/**
 * Graceful degradation wrapper
 */
export const withGracefulDegradation = <T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  circuitBreakerName?: string
): Promise<T> => {
  return withCircuitBreaker(
    circuitBreakerName || 'graceful-degradation',
    primaryOperation,
    fallbackOperation
  );
};

/**
 * Health check for circuit breakers
 */
export const getCircuitBreakerHealth = () => {
  const health: Record<string, any> = {};
  
  for (const [name, cb] of circuitBreakers) {
    const state = cb.getState();
    health[name] = {
      isOpen: state.isOpen,
      failureCount: state.failureCount,
      threshold: state.threshold,
      lastFailureTime: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : null,
      nextAttemptTime: state.nextAttemptTime ? new Date(state.nextAttemptTime).toISOString() : null
    };
  }
  
  return health;
};
