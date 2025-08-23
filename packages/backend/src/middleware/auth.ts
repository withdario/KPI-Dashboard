import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      userId: decoded.userId!,
      email: decoded.email!
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to authenticate JWT tokens for optional routes
 */
export const optionalAuthenticateToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
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
        userId: decoded.userId!,
        email: decoded.email!
      };
    }
    next();
  } catch (error) {
    // Invalid token, continue without authentication
    next();
  }
};

/**
 * Middleware to check if user has specific role (placeholder for future role-based access)
 */
export const requireRole = (_role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // TODO: Implement role-based access control
    // For now, allow all authenticated users
    next();
  };
};
