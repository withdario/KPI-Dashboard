"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.errorLogging = exports.requestLogging = void 0;
const winston_1 = __importDefault(require("winston"));
const uuid_1 = require("uuid");
// Create Winston logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: 'bi-backend' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log'
        })
    ]
});
exports.logger = logger;
/**
 * Request logging middleware
 * Adds request ID and logs all incoming requests
 */
const requestLogging = (req, res, next) => {
    // Generate unique request ID
    req.requestId = (0, uuid_1.v4)();
    // Log request
    logger.info('Incoming request', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Log response when finished
    res.on('finish', () => {
        logger.info('Request completed', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: Date.now() - Date.now(), // Will be calculated properly in production
            timestamp: new Date().toISOString()
        });
    });
    next();
};
exports.requestLogging = requestLogging;
/**
 * Error logging middleware
 * Logs all errors with request context
 */
const errorLogging = (err, req, _res, next) => {
    logger.error('Request error', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name
        },
        timestamp: new Date().toISOString()
    });
    next(err);
};
exports.errorLogging = errorLogging;
//# sourceMappingURL=logging.js.map