import { PrismaClient } from '@prisma/client';
import PerformanceMonitoringService from './performanceMonitoringService';

export class DatabaseMonitoringService {
  private performanceService: PerformanceMonitoringService;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient, performanceService: PerformanceMonitoringService) {
    this.prisma = prisma;
    this.performanceService = performanceService;
    this.setupQueryMonitoring();
  }

  private setupQueryMonitoring(): void {
    // Monitor query performance using Prisma middleware
    this.prisma.$use(async (params, next) => {
      const startTime = performance.now();
      
      try {
        const result = await next(params);
        const endTime = performance.now();
        
        // Track successful query
        this.performanceService.trackDatabaseQuery(
          `${params.model}.${params.action}`,
          startTime,
          endTime,
          {
            model: params.model,
            action: params.action,
            args: this.sanitizeArgs(params.args),
            resultCount: this.getResultCount(result, params.action)
          }
        );
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        
        // Track failed query
        this.performanceService.trackDatabaseQuery(
          `${params.model}.${params.action}`,
          startTime,
          endTime,
          {
            model: params.model,
            action: params.action,
            args: this.sanitizeArgs(params.args),
            error: error instanceof Error ? error.message : 'Unknown error',
            failed: true
          }
        );
        
        throw error;
      }
    });
  }

  private sanitizeArgs(args: any): any {
    if (!args) return args;
    
    // Create a safe copy of args for logging
    const safeArgs = { ...args };
    
    // Remove sensitive fields that might contain passwords or tokens
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeObject(value);
        }
      }
      return sanitized;
    };
    
    return sanitizeObject(safeArgs);
  }

  private getResultCount(result: any, action: string): number {
    if (!result) return 0;
    
    switch (action) {
      case 'findMany':
        return Array.isArray(result) ? result.length : 0;
      case 'findFirst':
      case 'findUnique':
        return result ? 1 : 0;
      case 'create':
      case 'createMany':
        return Array.isArray(result) ? result.length : 1;
      case 'update':
      case 'updateMany':
        return result?.count || 0;
      case 'delete':
      case 'deleteMany':
        return result?.count || 0;
      case 'count':
        return result || 0;
      case 'aggregate':
        return result?._count || 0;
      default:
        return 0;
    }
  }

  // Method to get database performance statistics
  async getDatabaseStats(): Promise<Record<string, any>> {
    try {
      // Get recent database metrics
      const dbMetrics = this.performanceService.getMetrics('database', 100);
      
      // Calculate statistics
      const totalQueries = dbMetrics.length;
      const failedQueries = dbMetrics.filter(m => m.metadata?.failed).length;
      const successRate = totalQueries > 0 ? ((totalQueries - failedQueries) / totalQueries) * 100 : 100;
      
      // Group by model and action
      const modelStats: Record<string, any> = {};
      dbMetrics.forEach(metric => {
        const [model, action] = metric.name.split('.');
        if (!modelStats[model]) {
          modelStats[model] = {};
        }
        if (!modelStats[model][action]) {
          modelStats[model][action] = {
            count: 0,
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
            failedCount: 0
          };
        }
        
        const stats = modelStats[model][action];
        stats.count++;
        stats.totalTime += metric.value;
        stats.minTime = Math.min(stats.minTime, metric.value);
        stats.maxTime = Math.max(stats.maxTime, metric.value);
        
        if (metric.metadata?.failed) {
          stats.failedCount++;
        }
      });
      
      // Calculate averages
      Object.values(modelStats).forEach((modelActions: any) => {
        Object.values(modelActions).forEach((actionStats: any) => {
          actionStats.avgTime = actionStats.count > 0 ? 
            Math.round(actionStats.totalTime / actionStats.count) : 0;
        });
      });
      
      return {
        totalQueries,
        failedQueries,
        successRate: Math.round(successRate * 100) / 100,
        averageQueryTime: this.calculateAverage(dbMetrics),
        slowestQuery: this.findSlowestQuery(dbMetrics),
        modelStats,
        recentMetrics: dbMetrics.slice(-10)
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        error: 'Failed to retrieve database statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private calculateAverage(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return Math.round(sum / metrics.length);
  }

  private findSlowestQuery(metrics: any[]): any {
    if (metrics.length === 0) return null;
    return metrics.reduce((slowest, current) => 
      current.value > slowest.value ? current : slowest
    );
  }

  // Method to get slow queries (queries that exceed threshold)
  getSlowQueries(threshold: number = 100): any[] {
    const dbMetrics = this.performanceService.getMetrics('database', 1000);
    return dbMetrics.filter(metric => metric.value > threshold);
  }

  // Method to get query patterns
  getQueryPatterns(): Record<string, any> {
    const dbMetrics = this.performanceService.getMetrics('database', 1000);
    const patterns: Record<string, any> = {};
    
    dbMetrics.forEach(metric => {
      const [model, action] = metric.name.split('.');
      const key = `${model}.${action}`;
      
      if (!patterns[key]) {
        patterns[key] = {
          count: 0,
          totalTime: 0,
          avgTime: 0,
          minTime: Infinity,
          maxTime: 0
        };
      }
      
      patterns[key].count++;
      patterns[key].totalTime += metric.value;
      patterns[key].minTime = Math.min(patterns[key].minTime, metric.value);
      patterns[key].maxTime = Math.max(patterns[key].maxTime, metric.value);
    });
    
    // Calculate averages
    Object.values(patterns).forEach((pattern: any) => {
      pattern.avgTime = pattern.count > 0 ? 
        Math.round(pattern.totalTime / pattern.count) : 0;
    });
    
    return patterns;
  }
}

export default DatabaseMonitoringService;
