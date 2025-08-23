"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userManagementService_1 = require("../services/userManagementService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userManagementService = new userManagementService_1.UserManagementService();
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { email, password, firstName, lastName, businessEntityId } = req.body;
        if (!email || !password || !firstName || !lastName || !businessEntityId) {
            res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
            return;
        }
        const result = await userManagementService.createUser({
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
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { businessEntityId } = req.query;
        const result = await userManagementService.getAllUsers(businessEntityId);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userManagementService.getUser(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, isActive } = req.body;
        const result = await userManagementService.updateUser(id, {
            firstName,
            lastName,
            email,
            isActive
        });
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/:id/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName } = req.body;
        const result = await userManagementService.updateUser(id, {
            firstName,
            lastName
        });
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/:id/deactivate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userManagementService.deactivateUser(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/:id/reactivate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userManagementService.reactivateUser(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Reactivate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/:id/password', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword) {
            res.status(400).json({
                success: false,
                message: 'New password is required'
            });
            return;
        }
        const result = await userManagementService.changePassword(id, newPassword);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userManagementService.deleteUser(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/stats/summary', auth_1.authenticateToken, async (req, res) => {
    try {
        const { businessEntityId } = req.query;
        const result = await userManagementService.getUserStats(businessEntityId);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/search/:query', auth_1.authenticateToken, async (req, res) => {
    try {
        const { query } = req.params;
        const { businessEntityId } = req.query;
        const result = await userManagementService.searchUsers(query, businessEntityId);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map