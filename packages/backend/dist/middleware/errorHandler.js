"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.ApiError = void 0;
const logging_1 = require("./logging");
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    }
    else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
    }
    else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
    }
    logging_1.logger.error('Error occurred', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message: err.message,
        stack: err.stack,
        isOperational,
        timestamp: new Date().toISOString()
    });
    const errorResponse = {
        error: {
            message,
            code: err.name || 'InternalError',
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        }
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = {
            stack: err.stack,
            originalMessage: err.message
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
            path: req.originalUrl
        }
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map