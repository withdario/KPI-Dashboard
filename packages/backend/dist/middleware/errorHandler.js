"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCircuitBreakerHealth = exports.withGracefulDegradation = exports.withRetry = exports.withCircuitBreaker = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.getCircuitBreaker = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ExternalApiError = exports.DatabaseError = exports.ApiError = void 0;
const logging_1 = require("./logging");
class ApiError extends Error {
    statusCode;
    isOperational;
    retryable;
    retryAfter;
    constructor(statusCode, message, isOperational = true, retryable = false, retryAfter) {
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
exports.ApiError = ApiError;
class DatabaseError extends ApiError {
    constructor(message, retryable = true) {
        super(500, message, true, retryable);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class ExternalApiError extends ApiError {
    constructor(message, statusCode = 502, retryable = true) {
        super(statusCode, message, true, retryable);
        this.name = 'ExternalApiError';
    }
}
exports.ExternalApiError = ExternalApiError;
class ValidationError extends ApiError {
    constructor(message) {
        super(400, message, true, false);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ApiError {
    constructor(message) {
        super(401, message, true, false);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApiError {
    constructor(message) {
        super(403, message, true, false);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ApiError {
    constructor(message) {
        super(404, message, true, false);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApiError {
    constructor(message) {
        super(409, message, true, false);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends ApiError {
    constructor(message, retryAfter) {
        super(429, message, true, true, retryAfter);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class CircuitBreaker {
    state;
    name;
    constructor(name, threshold = 5, timeout = 60000) {
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
    canExecute() {
        if (!this.state.isOpen)
            return true;
        if (Date.now() >= this.state.nextAttemptTime) {
            this.state.isOpen = false;
            this.state.failureCount = 0;
            return true;
        }
        return false;
    }
    onSuccess() {
        this.state.failureCount = 0;
        this.state.isOpen = false;
    }
    onFailure() {
        this.state.failureCount++;
        this.state.lastFailureTime = Date.now();
        if (this.state.failureCount >= this.state.threshold) {
            this.state.isOpen = true;
            this.state.nextAttemptTime = Date.now() + this.state.timeout;
            logging_1.logger.warn(`Circuit breaker opened for ${this.name}`, {
                failureCount: this.state.failureCount,
                threshold: this.state.threshold,
                nextAttemptTime: new Date(this.state.nextAttemptTime).toISOString()
            });
        }
    }
    getState() {
        return { ...this.state };
    }
}
const circuitBreakers = new Map();
const getCircuitBreaker = (name) => {
    if (!circuitBreakers.has(name)) {
        circuitBreakers.set(name, new CircuitBreaker(name));
    }
    return circuitBreakers.get(name);
};
exports.getCircuitBreaker = getCircuitBreaker;
const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    let retryable = false;
    let retryAfter;
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
        retryable = err.retryable;
        retryAfter = err.retryAfter;
    }
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        retryable = false;
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        retryable = false;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        retryable = false;
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        retryable = false;
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
        retryable = false;
    }
    else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
        retryable = false;
    }
    else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
        retryable = false;
    }
    else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
        retryable = false;
    }
    else if (err.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        message = 'Database operation failed';
        retryable = true;
    }
    else if (err.name === 'PrismaClientUnknownRequestError') {
        statusCode = 500;
        message = 'Unknown database error';
        retryable = true;
    }
    else if (err.name === 'PrismaClientValidationError') {
        statusCode = 400;
        message = 'Database validation error';
        retryable = false;
    }
    else if (err.name === 'PrismaClientInitializationError') {
        statusCode = 503;
        message = 'Database connection failed';
        retryable = true;
        retryAfter = 30;
    }
    logging_1.logger.error('Error occurred', {
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
    const errorResponse = {
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
    const circuitBreakerName = req.get('X-Circuit-Breaker-Name');
    if (circuitBreakerName && circuitBreakers.has(circuitBreakerName)) {
        const cb = circuitBreakers.get(circuitBreakerName);
        const state = cb.getState();
        errorResponse.circuitBreaker = {
            name: circuitBreakerName,
            state: state.isOpen ? 'open' : 'closed',
            ...(state.isOpen && { nextAttemptTime: new Date(state.nextAttemptTime).toISOString() })
        };
    }
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = {
            stack: err.stack,
            originalMessage: err.message,
            errorType: err.constructor.name
        };
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const errorResponse = {
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
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn, circuitBreakerName) => {
    return (req, res, next) => {
        if (circuitBreakerName) {
            req.headers['X-Circuit-Breaker-Name'] = circuitBreakerName;
        }
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const withCircuitBreaker = (name, operation, fallback) => {
    const cb = (0, exports.getCircuitBreaker)(name);
    if (!cb.canExecute()) {
        logging_1.logger.warn(`Circuit breaker ${name} is open, using fallback or failing`);
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
exports.withCircuitBreaker = withCircuitBreaker;
const withRetry = async (operation, maxRetries = 3, baseDelay = 1000, maxDelay = 30000) => {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                break;
            }
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            const jitter = Math.random() * 0.1 * delay;
            const totalDelay = delay + jitter;
            logging_1.logger.info(`Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay}ms`, {
                attempt: attempt + 1,
                maxRetries,
                delay: totalDelay,
                error: lastError.message
            });
            await new Promise(resolve => setTimeout(resolve, totalDelay));
        }
    }
    throw lastError;
};
exports.withRetry = withRetry;
const withGracefulDegradation = (primaryOperation, fallbackOperation, circuitBreakerName) => {
    return (0, exports.withCircuitBreaker)(circuitBreakerName || 'graceful-degradation', primaryOperation, fallbackOperation);
};
exports.withGracefulDegradation = withGracefulDegradation;
const getCircuitBreakerHealth = () => {
    const health = {};
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
exports.getCircuitBreakerHealth = getCircuitBreakerHealth;
//# sourceMappingURL=errorHandler.js.map