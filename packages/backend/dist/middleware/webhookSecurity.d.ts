import { Request, Response, NextFunction } from 'express';
/**
 * Webhook-specific rate limiting
 * More permissive than general API rate limiting for webhook reliability
 */
export declare const webhookRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Webhook Authentication Middleware
 * Validates webhook tokens for n8n integration
 */
export declare const webhookAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * IP validation middleware
 * Optional: Restrict webhooks to specific IP ranges
 */
export declare const webhookIpValidation: (allowedIps?: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Webhook Payload Validation Middleware
 * Validates webhook payload size and format
 */
export declare const webhookPayloadValidation: (maxSize: string) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Webhook Signature Validation Middleware
 * Validates webhook signatures for enhanced security
 */
export declare const webhookSignatureValidation: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Webhook Monitoring Middleware
 * Logs webhook requests and responses for debugging and analytics
 */
export declare const webhookMonitoring: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=webhookSecurity.d.ts.map