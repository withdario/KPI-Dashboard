import { Request, Response, NextFunction } from 'express';
interface SystemMetrics {
    startTime: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastHealthCheck: number;
}
export declare const requestMetrics: (_req: Request, res: Response, next: NextFunction) => void;
export declare const healthCheck: (_req: Request, res: Response) => void;
export declare const systemMetrics: (_req: Request, res: Response) => void;
export declare const getMetrics: () => SystemMetrics;
export {};
//# sourceMappingURL=monitoring.d.ts.map