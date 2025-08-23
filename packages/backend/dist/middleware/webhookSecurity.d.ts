import { Request, Response, NextFunction } from 'express';
export declare const webhookRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const webhookAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const webhookIpValidation: (allowedIps?: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const webhookPayloadValidation: (maxSize: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const webhookSignatureValidation: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const webhookMonitoring: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=webhookSecurity.d.ts.map