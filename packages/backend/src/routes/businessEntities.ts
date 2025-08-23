import { Router, Request, Response } from 'express';
import { BusinessEntityService } from '../services/businessEntityService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const businessEntityService = new BusinessEntityService();

// Create new business entity
router.post('/', authenticateToken, async (req: Request, res: Response) => {
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
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create business entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all business entities
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const result = await businessEntityService.getAllBusinessEntities();

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get all business entities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get business entity by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await businessEntityService.getBusinessEntity(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get business entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get business entity by domain
router.get('/domain/:domain', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;

    // Find by domain
    const result = await businessEntityService.getAllBusinessEntities();
    
    if (result.success && result.businessEntities) {
      const entity = result.businessEntities.find(e => e.domain === domain);
      
      if (entity) {
        res.json({
          success: true,
          message: 'Business entity found',
          businessEntity: entity
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Business entity not found'
        });
      }
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get business entity by domain error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update business entity
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
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
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update business entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Deactivate business entity
router.patch('/:id/deactivate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await businessEntityService.deactivateBusinessEntity(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Deactivate business entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Activate business entity
router.patch('/:id/activate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await businessEntityService.activateBusinessEntity(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Activate business entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete business entity
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await businessEntityService.deleteBusinessEntity(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Delete business entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get business entity stats
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await businessEntityService.getBusinessEntityStats(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get business entity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
