import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate business entity access
 * This is a simplified implementation - in production you would check user permissions
 */
export const validateBusinessEntityAccess = async (
  req: Request, 
  businessEntityId: string
): Promise<void> => {
  // For now, we'll just validate that the business entity ID exists
  // In a real implementation, you would check if the authenticated user has access to this entity
  
  if (!businessEntityId) {
    throw new Error('Business entity ID is required');
  }
  
  // Basic validation - ensure it's a valid string
  if (typeof businessEntityId !== 'string' || businessEntityId.trim().length === 0) {
    throw new Error('Invalid business entity ID');
  }
  
  // In production, you would:
  // 1. Get the user from req.user (set by auth middleware)
  // 2. Check if user has access to this business entity
  // 3. Query database or authorization service
  // 4. Throw error if access denied
  
  // For now, we'll allow all requests through
  return;
};

/**
 * Express middleware wrapper for business entity access validation
 */
export const businessEntityAccessMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const businessEntityId = req.body.businessEntityId || req.params.businessEntityId || req.query.businessEntityId;
    
    if (businessEntityId) {
      validateBusinessEntityAccess(req, businessEntityId as string)
        .then(() => next())
        .catch((error) => {
          res.status(403).json({
            error: 'Access denied',
            message: error.message
          });
        });
    } else {
      // If no business entity ID is provided, allow the request to proceed
      // This might be appropriate for some routes that don't require entity-specific access
      next();
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate business entity access'
    });
  }
};
