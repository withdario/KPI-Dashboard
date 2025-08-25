"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookMonitoring = exports.webhookSignatureValidation = exports.webhookPayloadValidation = exports.webhookIpValidation = exports.webhookAuth = exports.webhookRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.webhookRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        error: 'Too many webhook requests from this IP, please try again later.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});
const webhookAuth = async (req, res, next) => {
    try {
        const token = req.headers['x-webhook-token'] || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Webhook token required' });
            return;
        }
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
        req.n8nIntegration = integration;
        next();
    }
    catch (error) {
        console.error('Webhook authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.webhookAuth = webhookAuth;
const webhookIpValidation = (allowedIps) => {
    return (req, res, next) => {
        if (!allowedIps || allowedIps.length === 0 || allowedIps.every(ip => !ip.trim())) {
            return next();
        }
        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!clientIp) {
            return res.status(400).json({
                error: 'IP validation failed',
                message: 'Unable to determine client IP address'
            });
        }
        const isAllowed = allowedIps.some(allowedIp => {
            if (allowedIp.includes('/')) {
                return isIpInCidr(clientIp, allowedIp);
            }
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
const webhookSignatureValidation = (req, res, next) => {
    const signatureSecret = process.env.WEBHOOK_SIGNATURE_SECRET;
    if (!signatureSecret || signatureSecret === 'your-webhook-signature-secret') {
        return next();
    }
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
        return res.status(401).json({ error: 'Webhook signature required' });
    }
    const expectedSignature = `sha256=${Buffer.from(signatureSecret).toString('hex')}`;
    if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    next();
};
exports.webhookSignatureValidation = webhookSignatureValidation;
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
function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
    if (!match) {
        return 1024 * 1024;
    }
    const value = parseFloat(match[1]);
    const unit = match[2];
    return Math.floor(value * units[unit]);
}
const webhookMonitoring = (req, res, next) => {
    const startTime = Date.now();
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        console.log(`Webhook ${req.method} ${req.path} - Status: ${statusCode}, Duration: ${duration}ms`);
        originalEnd.call(this, chunk, encoding);
        return this;
    };
    next();
};
exports.webhookMonitoring = webhookMonitoring;
//# sourceMappingURL=webhookSecurity.js.map