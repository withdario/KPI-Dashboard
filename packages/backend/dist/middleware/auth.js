"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuthenticateToken = exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
const authService = new authService_1.AuthService();
/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    try {
        const decoded = await authService.validateToken(token);
        if (!decoded.valid) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to authenticate JWT tokens for optional routes
 */
const optionalAuthenticateToken = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        // No token provided, continue without authentication
        next();
        return;
    }
    try {
        const decoded = await authService.validateToken(token);
        if (decoded.valid) {
            req.user = {
                userId: decoded.userId,
                email: decoded.email
            };
        }
        next();
    }
    catch (error) {
        // Invalid token, continue without authentication
        next();
    }
};
exports.optionalAuthenticateToken = optionalAuthenticateToken;
/**
 * Middleware to check if user has specific role (placeholder for future role-based access)
 */
const requireRole = (_role) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // TODO: Implement role-based access control
        // For now, allow all authenticated users
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map