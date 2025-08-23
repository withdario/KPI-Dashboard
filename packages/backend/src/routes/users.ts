import { Router, Request, Response } from 'express';
import { UserManagementService } from '../services/userManagementService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userManagementService = new UserManagementService();

// Create new user
router.post('/', authenticateToken, async (req: Request, res: Response) => {
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
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { businessEntityId } = req.query;

    const result = await userManagementService.getAllUsers(
      businessEntityId as string
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userManagementService.getUser(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
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
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile (limited fields)
router.patch('/:id/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    const result = await userManagementService.updateUser(id, {
      firstName,
      lastName
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Deactivate user
router.patch('/:id/deactivate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userManagementService.deactivateUser(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reactivate user
router.patch('/:id/reactivate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userManagementService.reactivateUser(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change user password
router.patch('/:id/password', authenticateToken, async (req: Request, res: Response) => {
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
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await userManagementService.deleteUser(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user stats
router.get('/stats/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { businessEntityId } = req.query;

    const result = await userManagementService.getUserStats(
      businessEntityId as string
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search users
router.get('/search/:query', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { businessEntityId } = req.query;

    const result = await userManagementService.searchUsers(
      query,
      businessEntityId as string
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
