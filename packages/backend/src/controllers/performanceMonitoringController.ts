import { Request, Response } from 'express';
import PerformanceMonitoringService from '../services/performanceMonitoringService';

export class PerformanceMonitoringController {
  private performanceService: PerformanceMonitoringService;

  constructor(performanceService: PerformanceMonitoringService) {
    this.performanceService = performanceService;
  }

  async getMetrics(): Promise<any> {
    try {
      const metrics = this.performanceService.getMetrics();
      return {
        success: true,
        data: {
          metrics,
          count: metrics.length,
          type: 'all'
        }
      };
    } catch (error) {
      throw new Error('Failed to retrieve performance metrics');
    }
  }

  async getMetricsSummary(): Promise<any> {
    try {
      const summary = this.performanceService.getMetricsSummary();
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      throw new Error('Failed to retrieve metrics summary');
    }
  }

  async getMetricsByType(type: string): Promise<any> {
    try {
      const metrics = this.performanceService.getMetrics(type);
      return {
        success: true,
        data: {
          metrics,
          count: metrics.length,
          type
        }
      };
    } catch (error) {
      throw new Error('Failed to retrieve metrics by type');
    }
  }

  async getAlerts(): Promise<any> {
    try {
      const alerts = this.performanceService.getAlerts();
      return {
        success: true,
        data: {
          alerts,
          count: alerts.length,
          type: 'all'
        }
      };
    } catch (error) {
      throw new Error('Failed to retrieve performance alerts');
    }
  }

  async getConfig(): Promise<any> {
    try {
      const config = this.performanceService.getConfig();
      return {
        success: true,
        data: config
      };
    } catch (error) {
      throw new Error('Failed to retrieve monitoring configuration');
    }
  }

  async updateConfig(config: any): Promise<any> {
    try {
      const updatedConfig = this.performanceService.updateConfig(config);
      return {
        success: true,
        data: updatedConfig
      };
    } catch (error) {
      throw new Error('Failed to update monitoring configuration');
    }
  }

  async startMonitoring(): Promise<void> {
    try {
      this.performanceService.start();
    } catch (error) {
      throw new Error('Failed to start monitoring');
    }
  }

  async stopMonitoring(): Promise<void> {
    try {
      this.performanceService.stop();
    } catch (error) {
      throw new Error('Failed to stop monitoring');
    }
  }

  // Legacy methods for backward compatibility
  async getMetricsLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { type, limit = 100 } = req.query;
      const metrics = this.performanceService.getMetrics(
        type as string, 
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: {
          metrics,
          count: metrics.length,
          type: type || 'all'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getMetricsSummaryLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const summary = this.performanceService.getMetricsSummary();
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAlertsLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { type, limit = 100 } = req.query;
      const alerts = this.performanceService.getAlerts(
        type as string, 
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: {
          alerts,
          count: alerts.length,
          type: type || 'all'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve performance alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getConfigurationLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const config = this.performanceService.getConfig();
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve monitoring configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateConfigurationLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { 
        apiResponseTimeThreshold,
        databaseQueryTimeThreshold,
        frontendLoadTimeThreshold,
        systemMemoryThreshold,
        alertEnabled,
        metricsRetentionDays
      } = req.body;

      const config = this.performanceService.updateConfig({
        apiResponseTimeThreshold,
        databaseQueryTimeThreshold,
        frontendLoadTimeThreshold,
        systemMemoryThreshold,
        alertEnabled,
        metricsRetentionDays
      });

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update monitoring configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async startMonitoringLegacy(_req: Request, res: Response): Promise<void> {
    try {
      this.performanceService.start();
      
      res.json({
        success: true,
        message: 'Performance monitoring started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to start performance monitoring',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async stopMonitoringLegacy(_req: Request, res: Response): Promise<void> {
    try {
      this.performanceService.stop();
      
      res.json({
        success: true,
        message: 'Performance monitoring stopped successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to stop performance monitoring',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getMonitoringStatusLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const status = this.performanceService.getMonitoringStatus();
      
      res.json({
        success: true,
        data: {
          isMonitoring: status.isActive,
          config: this.performanceService.getConfig()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get monitoring status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
