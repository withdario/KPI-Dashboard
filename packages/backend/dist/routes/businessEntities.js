"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const businessEntityService_1 = require("../services/businessEntityService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const businessEntityService = new businessEntityService_1.BusinessEntityService();
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, description, domain } = req.body;
        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Business entity name is required'
            });
            return;
        }
        const result = await businessEntityService.createBusinessEntity({
            name,
            description,
            domain
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Create business entity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/', auth_1.authenticateToken, async (_req, res) => {
    try {
        const result = await businessEntityService.getAllBusinessEntities();
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Get all business entities error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await businessEntityService.getBusinessEntity(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Get business entity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/domain/:domain', auth_1.authenticateToken, async (req, res) => {
    try {
        const { domain } = req.params;
        const result = await businessEntityService.getAllBusinessEntities();
        if (result.success && result.businessEntities) {
            const entity = result.businessEntities.find(e => e.domain === domain);
            if (entity) {
                res.json({
                    success: true,
                    message: 'Business entity found',
                    businessEntity: entity
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: 'Business entity not found'
                });
            }
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Get business entity by domain error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, domain } = req.body;
        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Business entity name is required'
            });
            return;
        }
        const result = await businessEntityService.updateBusinessEntity(id, {
            name,
            description,
            domain
        });
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Update business entity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/:id/deactivate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await businessEntityService.deactivateBusinessEntity(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Deactivate business entity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.patch('/:id/activate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await businessEntityService.activateBusinessEntity(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Activate business entity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await businessEntityService.deleteBusinessEntity(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Delete business entity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:id/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await businessEntityService.getBusinessEntityStats(id);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(500).json(result);
        }
    }
    catch (error) {
        console.error('Get business entity stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=businessEntities.js.map