"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookMonitoring = exports.webhookSignatureValidation = exports.webhookPayloadValidation = exports.webhookIpValidation = exports.webhookAuth = exports.webhookRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Webhook-specific rate limiting
 * More permissive than general API rate limiting for webhook reliability
 */
exports.webhookRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Allow up to 1000 webhooks per 15 minutes per IP
    message: {
        error: 'Too many webhook requests from this IP, please try again later.',
        retryAfter: 15 // minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests for webhook monitoring
    keyGenerator: (req) => {
        // Use IP address for rate limiting
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});
/**
 * Webhook Authentication Middleware
 * Validates webhook tokens for n8n integration
 */
const webhookAuth = async (req, res, next) => {
    try {
        const token = req.headers['x-webhook-token'] || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Webhook token required' });
            return;
        }
        // Find integration by token
        const integration = await prisma.n8nIntegration.findFirst({
            where: {
                webhookToken: token,
                isActive: true
            }
        });
        if (!integration) {
            res.status(401).json({ error: 'Invalid webhook token' });
            return;
        }
        // Attach integration to request for later use
        req.n8nIntegration = integration;
        next();
    }
    catch (error) {
        console.error('Webhook authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.webhookAuth = webhookAuth;
/**
 * IP validation middleware
 * Optional: Restrict webhooks to specific IP ranges
 */
const webhookIpValidation = (allowedIps) => {
    return (req, res, next) => {
        // Skip IP validation if no IPs are configured or if all IPs are empty strings
        if (!allowedIps || allowedIps.length === 0 || allowedIps.every(ip => !ip.trim())) {
            // No IP restrictions configured
            return next();
        }
        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!clientIp) {
            return res.status(400).json({
                error: 'IP validation failed',
                message: 'Unable to determine client IP address'
            });
        }
        // Check if client IP is in allowed list
        const isAllowed = allowedIps.some(allowedIp => {
            // Support CIDR notation (e.g., "192.168.1.0/24")
            if (allowedIp.includes('/')) {
                return isIpInCidr(clientIp, allowedIp);
            }
            // Exact IP match
            return clientIp === allowedIp;
        });
        if (!isAllowed) {
            console.warn(`Webhook rejected from unauthorized IP: ${clientIp}`);
            return res.status(403).json({
                error: 'IP not authorized',
                message: 'Webhook requests from this IP address are not allowed'
            });
        }
        next();
    };
};
exports.webhookIpValidation = webhookIpValidation;
/**
 * Webhook Payload Validation Middleware
 * Validates webhook payload size and format
 */
const webhookPayloadValidation = (maxSize) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSizeBytes = parseSize(maxSize);
        if (contentLength > maxSizeBytes) {
            res.status(413).json({
                error: 'Payload too large',
                maxSize,
                actualSize: `${contentLength} bytes`
            });
            return;
        }
        next();
    };
};
exports.webhookPayloadValidation = webhookPayloadValidation;
/**
 * Webhook Signature Validation Middleware
 * Validates webhook signatures for enhanced security
 */
const webhookSignatureValidation = (req, res, next) => {
    const signatureSecret = process.env.WEBHOOK_SIGNATURE_SECRET;
    // Skip signature validation if not configured or if it's a placeholder value
    if (!signatureSecret || signatureSecret === 'your-webhook-signature-secret') {
        // Skip signature validation if not configured
        return next();
    }
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
        return res.status(401).json({ error: 'Webhook signature required' });
    }
    // Basic signature validation (can be enhanced with crypto)
    const expectedSignature = `sha256=${Buffer.from(signatureSecret).toString('hex')}`;
    if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    next();
};
exports.webhookSignatureValidation = webhookSignatureValidation;
/**
 * Helper function to check if IP is in CIDR range
 */
function isIpInCidr(ip, cidr) {
    try {
        const [network, bits] = cidr.split('/');
        const mask = ~((1 << (32 - parseInt(bits))) - 1);
        const ipNum = ipToNumber(ip);
        const networkNum = ipToNumber(network);
        return (ipNum & mask) === (networkNum & mask);
    }
    catch {
        return false;
    }
}
/**
 * Helper function to convert IP string to number
 */
function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
/**
 * Helper function to parse size string (e.g., "1mb" -> 1048576)
 */
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
    if (!match) {
        return 1024 * 1024; // Default to 1MB
    }
    const value = parseFloat(match[1]);
    const unit = match[2];
    return Math.floor(value * units[unit]);
}
/**
 * Webhook Monitoring Middleware
 * Logs webhook requests and responses for debugging and analytics
 */
const webhookMonitoring = (req, res, next) => {
    const startTime = Date.now();
    const originalEnd = res.end;
    // Override res.end to capture response data
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        // Log webhook request/response
        console.log(`Webhook ${req.method} ${req.path} - Status: ${statusCode}, Duration: ${duration}ms`);
        // Call original end function
        originalEnd.call(this, chunk, encoding);
        return this;
    };
    next();
};
exports.webhookMonitoring = webhookMonitoring;
//# sourceMappingURL=webhookSecurity.js.map