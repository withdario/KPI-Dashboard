import { Request, Response, NextFunction } from 'express';
/**
 * Handle validation errors
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * User registration validation rules
 */
export declare const validateRegistration: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
/**
 * User login validation rules
 */
export declare const validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
/**
 * Password reset request validation
 */
export declare const validatePasswordResetRequest: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
/**
 * Password reset confirmation validation
 */
export declare const validatePasswordResetConfirm: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
/**
 * Email verification validation
 */
export declare const validateEmailVerification: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
//# sourceMappingURL=validation.d.ts.map