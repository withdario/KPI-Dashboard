import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import PerformanceMonitoringService from '../services/performanceMonitoringService';

export interface PerformanceMonitoringOptions {
  service: PerformanceMonitoringService;
  excludePaths?: string[];
  includeQueryParams?: boolean;
  includeHeaders?: boolean;
}

export function performanceMonitoringMiddleware(options: PerformanceMonitoringOptions) {
  const { service, excludePaths = [], includeQueryParams = false, includeHeaders = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip monitoring for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = performance.now();
    const startHrTime = process.hrtime();

    // Capture original end method to track response time
    const originalEnd = res.end;
    const originalJson = res.json;
    const originalSend = res.send;

    // Track response end
    res.end = function(chunk?: any, encoding?: any) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackPerformance(req, res, duration, service, includeQueryParams, includeHeaders);
      
      return originalEnd.call(this, chunk, encoding);
    };

    // Track JSON responses
    res.json = function(body: any) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackPerformance(req, res, duration, service, includeQueryParams, includeHeaders);
      
      return originalJson.call(this, body);
    };

    // Track send responses
    res.send = function(body: any) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackPerformance(req, res, duration, service, includeQueryParams, includeHeaders);
      
      return originalSend.call(this, body);
    };

    next();
  };
}

function trackPerformance(
  req: Request, 
  res: Response, 
  duration: number, 
  service: PerformanceMonitoringService,
  includeQueryParams: boolean,
  includeHeaders: boolean
) {
  const metadata: Record<string, any> = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  };

  if (includeQueryParams && Object.keys(req.query).length > 0) {
    metadata.queryParams = req.query;
  }

  if (includeHeaders && Object.keys(req.headers).length > 0) {
    // Filter out sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const filteredHeaders = { ...req.headers };
    sensitiveHeaders.forEach(header => delete filteredHeaders[header]);
    metadata.headers = filteredHeaders;
  }

  // Create a meaningful name for the API call
  const apiName = `${req.method} ${req.path}`;
  
  service.trackApiCall(apiName, 0, duration, metadata);
}

export default performanceMonitoringMiddleware;
