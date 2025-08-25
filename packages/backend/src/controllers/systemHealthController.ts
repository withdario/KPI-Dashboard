import { Request, Response } from 'express';
import { SystemHealthService } from '../services/systemHealthService';
import { logger } from '../utils/logger';

export class SystemHealthController {
  private systemHealthService: SystemHealthService;

  constructor(systemHealthService: SystemHealthService) {
    this.systemHealthService = systemHealthService;
  }

  /**
   * Get current system health status
   */
  async getCurrentHealth(_req: Request, res: Response): Promise<void> {
    try {
      const health = await this.systemHealthService.getCurrentHealth();
      
      if (!health) {
        res.status(404).json({
          success: false,
          message: 'No health data available',
          data: null
        });
        return;
      }

      res.json({
        success: true,
        message: 'System health retrieved successfully',
        data: health
      });
    } catch (error) {
      logger.error('Failed to get current health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system health',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get system health history
   */
  async getHealthHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const history = await this.systemHealthService.getHealthHistory(limit);

      res.json({
        success: true,
        message: 'Health history retrieved successfully',
        data: {
          history,
          count: history.length,
          limit
        }
      });
    } catch (error) {
      logger.error('Failed to get health history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve health history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(_req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.systemHealthService.getActiveAlerts();

      res.json({
        success: true,
        message: 'Active alerts retrieved successfully',
        data: {
          alerts,
          count: alerts.length
        }
      });
    } catch (error) {
      logger.error('Failed to get active alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get health check results
   */
  async getHealthCheckResults(_req: Request, res: Response): Promise<void> {
    try {
      const results = await this.systemHealthService.getHealthCheckResults();

      res.json({
        success: true,
        message: 'Health check results retrieved successfully',
        data: {
          results,
          count: results.length
        }
      });
    } catch (error) {
      logger.error('Failed to get health check results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve health check results',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start system health monitoring
   */
  async startMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { intervalMs } = req.body;
      const interval = intervalMs || 30000; // Default to 30 seconds

      await this.systemHealthService.startMonitoring(interval);

      res.json({
        success: true,
        message: 'System health monitoring started successfully',
        data: {
          intervalMs: interval,
          status: 'monitoring'
        }
      });
    } catch (error) {
      logger.error('Failed to start monitoring:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start system health monitoring',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Stop system health monitoring
   */
  async stopMonitoring(_req: Request, res: Response): Promise<void> {
    try {
      await this.systemHealthService.stopMonitoring();

      res.json({
        success: true,
        message: 'System health monitoring stopped successfully',
        data: {
          status: 'stopped'
        }
      });
    } catch (error) {
      logger.error('Failed to stop monitoring:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop system health monitoring',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get monitoring status
   */
  async getMonitoringStatus(_req: Request, res: Response): Promise<void> {
    try {
      const isActive = this.systemHealthService.isMonitoringActive();

      res.json({
        success: true,
        message: 'Monitoring status retrieved successfully',
        data: {
          isActive,
          status: isActive ? 'monitoring' : 'stopped'
        }
      });
    } catch (error) {
      logger.error('Failed to get monitoring status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve monitoring status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Perform manual health check
   */
  async performHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const health = await this.systemHealthService.performHealthCheck();

      res.json({
        success: true,
        message: 'Health check performed successfully',
        data: health
      });
    } catch (error) {
      logger.error('Failed to perform health check:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform health check',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const {
        type,
        category,
        message,
        details,
        severity,
        source,
        businessEntityId
      } = req.body;

      // Validate required fields
      if (!type || !category || !message || !severity || !source) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: type, category, message, severity, source'
        });
        return;
      }

      const alert = await this.systemHealthService.createAlert({
        type,
        category,
        message,
        details,
        timestamp: new Date(),
        severity,
        source,
        businessEntityId
      });

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert
      });
    } catch (error) {
      logger.error('Failed to create alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { acknowledgedBy } = req.body;

      if (!acknowledgedBy) {
        res.status(400).json({
          success: false,
          message: 'acknowledgedBy field is required'
        });
        return;
      }

      const alert = await this.systemHealthService.acknowledgeAlert(alertId, acknowledgedBy);

      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Alert acknowledged successfully',
        data: alert
      });
    } catch (error) {
      logger.error('Failed to acknowledge alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get system health summary
   */
  async getHealthSummary(_req: Request, res: Response): Promise<void> {
    try {
      const [currentHealth, activeAlerts, healthCheckResults] = await Promise.all([
        this.systemHealthService.getCurrentHealth(),
        this.systemHealthService.getActiveAlerts(),
        this.systemHealthService.getHealthCheckResults()
      ]);

      const summary = {
        currentHealth,
        activeAlerts: {
          count: activeAlerts.length,
          critical: activeAlerts.filter(a => a.severity === 'critical').length,
          high: activeAlerts.filter(a => a.severity === 'high').length,
          medium: activeAlerts.filter(a => a.severity === 'medium').length,
          low: activeAlerts.filter(a => a.severity === 'low').length
        },
        healthChecks: {
          total: healthCheckResults.length,
          passed: healthCheckResults.filter(r => r.status === 'pass').length,
          warnings: healthCheckResults.filter(r => r.status === 'warn').length,
          failed: healthCheckResults.filter(r => r.status === 'fail').length
        },
        monitoringStatus: this.systemHealthService.isMonitoringActive()
      };

      res.json({
        success: true,
        message: 'Health summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      logger.error('Failed to get health summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve health summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clean up old metrics and alerts
   */
  async cleanup(_req: Request, res: Response): Promise<void> {
    try {
      await this.systemHealthService.cleanup();

      res.json({
        success: true,
        message: 'Cleanup completed successfully',
        data: {
          timestamp: new Date(),
          status: 'completed'
        }
      });
    } catch (error) {
      logger.error('Failed to perform cleanup:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform cleanup',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
