"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = exports.systemMetrics = exports.healthCheck = exports.requestMetrics = void 0;
const logging_1 = require("./logging");
const metrics = {
    startTime: Date.now(),
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastHealthCheck: Date.now()
};
/**
 * Request metrics middleware
 * Tracks request counts and response times
 */
const requestMetrics = (_req, res, next) => {
    const startTime = Date.now();
    // Increment total requests
    metrics.totalRequests++;
    // Track response completion
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        // Update metrics based on response status
        if (res.statusCode >= 200 && res.statusCode < 400) {
            metrics.successfulRequests++;
        }
        else {
            metrics.failedRequests++;
        }
        // Update average response time
        metrics.averageResponseTime =
            (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;
        // Log metrics periodically
        if (metrics.totalRequests % 100 === 0) {
            logging_1.logger.info('System metrics update', {
                totalRequests: metrics.totalRequests,
                successfulRequests: metrics.successfulRequests,
                failedRequests: metrics.failedRequests,
                averageResponseTime: metrics.averageResponseTime,
                uptime: Date.now() - metrics.startTime
            });
        }
    });
    next();
};
exports.requestMetrics = requestMetrics;
/**
 * Enhanced health check endpoint
 * Returns comprehensive system health information
 */
const healthCheck = (_req, res) => {
    const currentTime = Date.now();
    const uptime = currentTime - metrics.startTime;
    // Update last health check time
    metrics.lastHealthCheck = currentTime;
    // Check system health
    const isHealthy = uptime > 0 && metrics.totalRequests >= 0;
    const healthData = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: {
            seconds: Math.floor(uptime / 1000),
            minutes: Math.floor(uptime / 60000),
            hours: Math.floor(uptime / 3600000)
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        metrics: {
            totalRequests: metrics.totalRequests,
            successfulRequests: metrics.successfulRequests,
            failedRequests: metrics.failedRequests,
            averageResponseTime: Math.round(metrics.averageResponseTime),
            lastHealthCheck: new Date(metrics.lastHealthCheck).toISOString()
        },
        system: {
            nodeVersion: process.version,
            platform: process.platform,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        }
    };
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthData);
};
exports.healthCheck = healthCheck;
/**
 * System metrics endpoint
 * Returns detailed system performance metrics
 */
const systemMetrics = (_req, res) => {
    const currentTime = Date.now();
    const uptime = currentTime - metrics.startTime;
    const metricsData = {
        timestamp: new Date().toISOString(),
        uptime: {
            milliseconds: uptime,
            seconds: Math.floor(uptime / 1000),
            minutes: Math.floor(uptime / 60000),
            hours: Math.floor(uptime / 3600000),
            days: Math.floor(uptime / 86400000)
        },
        requests: {
            total: metrics.totalRequests,
            successful: metrics.successfulRequests,
            failed: metrics.failedRequests,
            successRate: metrics.totalRequests > 0
                ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) + '%'
                : '0%'
        },
        performance: {
            averageResponseTime: Math.round(metrics.averageResponseTime),
            requestsPerMinute: uptime > 60000
                ? Math.round((metrics.totalRequests / (uptime / 60000)) * 100) / 100
                : 0
        },
        system: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            pid: process.pid
        }
    };
    res.json(metricsData);
};
exports.systemMetrics = systemMetrics;
/**
 * Get current metrics for internal use
 */
const getMetrics = () => ({ ...metrics });
exports.getMetrics = getMetrics;
//# sourceMappingURL=monitoring.js.map