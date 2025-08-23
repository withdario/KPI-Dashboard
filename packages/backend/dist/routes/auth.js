"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authService = new authService_1.AuthService();
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, businessEntityId } = req.body;
        if (!email || !password || !firstName || !lastName || !businessEntityId) {
            res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
            return;
        }
        const result = await authService.registerUser({
            email,
            password,
            firstName,
            lastName,
            businessEntityId
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }
        const result = await authService.loginUser({ email, password });
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(401).json(result);
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/refresh', auth_1.authenticateToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
            return;
        }
        const decoded = await authService.validateToken(refreshToken);
        if (!decoded.valid) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
            return;
        }
        const newToken = authService.generateJwtToken(decoded.userId, decoded.email);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }
        await authService.requestPasswordReset(email);
        res.json({
            success: true,
            message: 'If a user with this email exists, a reset link will be sent'
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
            return;
        }
        const result = await authService.resetPassword(token, newPassword);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
            return;
        }
        const result = await authService.verifyEmail(token);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map