import { Request, Response, NextFunction } from 'express';
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
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to authenticate JWT tokens for optional routes
 */
export declare const optionalAuthenticateToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if user has specific role (placeholder for future role-based access)
 */
export declare const requireRole: (_role: string) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map