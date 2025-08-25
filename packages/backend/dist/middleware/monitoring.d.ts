import { Request, Response, NextFunction } from 'express';
interface SystemMetrics {
    startTime: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastHealthCheck: number;
}
/**
 * Request metrics middleware
 * Tracks request counts and response times
 */
export declare const requestMetrics: (_req: Request, res: Response, next: NextFunction) => void;
/**
 * Enhanced health check endpoint
 * Returns comprehensive system health information
 */
export declare const healthCheck: (_req: Request, res: Response) => void;
/**
 * System metrics endpoint
 * Returns detailed system performance metrics
 */
export declare const systemMetrics: (_req: Request, res: Response) => void;
/**
 * Get current metrics for internal use
 */
export declare const getMetrics: () => SystemMetrics;
export {};
//# sourceMappingURL=monitoring.d.ts.map