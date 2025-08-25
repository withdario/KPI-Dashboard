import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export interface SystemHealthMetrics {
  systemStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: {
    current: number;
    average: number;
    percentage: number;
  };
  databaseStatus: 'connected' | 'disconnected' | 'slow' | 'error';
  apiStatus: 'operational' | 'degraded' | 'down' | 'error';
  lastHealthCheck: Date;
  activeAlerts: number;
  performanceScore: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'error';
  category: 'system' | 'performance' | 'database' | 'api' | 'security';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  businessEntityId?: string;
}

export interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: Date;
  responseTime: number;
  details?: Record<string, any>;
}

export interface SystemMetrics {
  timestamp: Date;
  metrics: SystemHealthMetrics;
  alerts: SystemAlert[];
}

export class SystemHealthService extends EventEmitter {
  private prisma: PrismaClient;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsHistory: SystemMetrics[] = [];
  private activeAlerts: Map<string, SystemAlert> = new Map();
  private healthCheckResults: Map<string, HealthCheckResult> = new Map();
  private isMonitoring: boolean = false;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  /**
   * Start system health monitoring
   */
  async startMonitoring(intervalMs: number = 30000): Promise<void> {
    if (this.isMonitoring) {
      logger.info('System health monitoring is already running');
      return;
    }

    try {
      logger.info('Starting system health monitoring');
      this.isMonitoring = true;

      // Perform initial health check
      await this.performHealthCheck();

      // Set up periodic health checks
      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthCheck();
      }, intervalMs);

      this.emit('monitoringStarted', { timestamp: new Date() });
      logger.info('System health monitoring started successfully');
    } catch (error) {
      logger.error('Failed to start system health monitoring:', error);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Stop system health monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      logger.info('System health monitoring is not running');
      return;
    }

    try {
      logger.info('Stopping system health monitoring');
      this.isMonitoring = false;

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      this.emit('monitoringStopped', { timestamp: new Date() });
      logger.info('System health monitoring stopped successfully');
    } catch (error) {
      logger.error('Failed to stop system health monitoring:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive system health check
   */
  async performHealthCheck(): Promise<SystemHealthMetrics> {
    const startTime = Date.now();
    const timestamp = new Date();

    try {
      logger.debug('Performing system health check');

      // Collect system metrics
      const metrics = await this.collectSystemMetrics();
      
      // Perform health checks
      const healthChecks = await this.runHealthChecks();
      
      // Calculate performance score first
      const performanceScore = this.calculatePerformanceScore(metrics, healthChecks);
      
      // Analyze health status
      const systemStatus = this.analyzeSystemStatus(metrics, healthChecks);
      
      // Generate alerts for issues
      await this.generateAlerts(metrics, healthChecks);
      
      // Create final metrics object
      const healthMetrics: SystemHealthMetrics = {
        ...metrics,
        systemStatus,
        performanceScore,
        lastHealthCheck: timestamp,
        activeAlerts: this.activeAlerts.size
      };

      // Store metrics in history
      this.metricsHistory.push({
        timestamp,
        metrics: healthMetrics,
        alerts: Array.from(this.activeAlerts.values())
      });

      // Keep only last 1000 metrics
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000);
      }

      const responseTime = Date.now() - startTime;
      logger.debug(`Health check completed in ${responseTime}ms`);

      this.emit('healthCheckCompleted', { metrics: healthMetrics, responseTime });
      return healthMetrics;

    } catch (error) {
      logger.error('Health check failed:', error);
      const errorMetrics: SystemHealthMetrics = {
        systemStatus: 'critical',
        uptime: process.uptime(),
        memoryUsage: { used: 0, total: 0, percentage: 0 },
        cpuUsage: { current: 0, average: 0, percentage: 0 },
        databaseStatus: 'error',
        apiStatus: 'error',
        lastHealthCheck: timestamp,
        activeAlerts: this.activeAlerts.size,
        performanceScore: 0
      };

      this.emit('healthCheckFailed', { error, metrics: errorMetrics });
      return errorMetrics;
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<Omit<SystemHealthMetrics, 'systemStatus' | 'performanceScore' | 'lastHealthCheck' | 'activeAlerts'>> {
    const uptime = process.uptime();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // CPU usage (simplified - in production you might want more sophisticated CPU monitoring)
    const cpuUsage = {
      current: 0, // Would need external library for real CPU monitoring
      average: 0,
      percentage: 0
    };

    // Database status
    let databaseStatus: 'connected' | 'disconnected' | 'slow' | 'error' = 'connected';
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 1000) {
        databaseStatus = 'slow';
      }
    } catch (error) {
      databaseStatus = 'error';
    }

    // API status (simplified - would check actual API endpoints)
    const apiStatus: 'operational' | 'degraded' | 'down' | 'error' = 'operational';

    return {
      uptime,
      memoryUsage: {
        used: usedMemory,
        total: totalMemory,
        percentage: memoryPercentage
      },
      cpuUsage,
      databaseStatus,
      apiStatus
    };
  }

  /**
   * Run health checks
   */
  private async runHealthChecks(): Promise<Map<string, HealthCheckResult>> {
    const healthChecks = new Map<string, HealthCheckResult>();
    const timestamp = new Date();

    // Database health check
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      healthChecks.set('database', {
        status: responseTime < 100 ? 'pass' : responseTime < 1000 ? 'warn' : 'fail',
        message: `Database response time: ${responseTime}ms`,
        timestamp,
        responseTime,
        details: { responseTime, threshold: 1000 }
      });
    } catch (error) {
      healthChecks.set('database', {
        status: 'fail',
        message: 'Database connection failed',
        timestamp,
        responseTime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    // Memory health check
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    healthChecks.set('memory', {
      status: memoryPercentage < 80 ? 'pass' : memoryPercentage < 90 ? 'warn' : 'fail',
      message: `Memory usage: ${memoryPercentage.toFixed(2)}%`,
      timestamp,
      responseTime: 0,
      details: { percentage: memoryPercentage, threshold: 80 }
    });

    // Uptime health check
    const uptime = process.uptime();
    healthChecks.set('uptime', {
      status: uptime > 60 ? 'pass' : 'warn', // 1 minute for testing
      message: `System uptime: ${this.formatUptime(uptime)}`,
      timestamp,
      responseTime: 0,
      details: { uptime, threshold: 60 }
    });

    this.healthCheckResults = healthChecks;
    return healthChecks;
  }

  /**
   * Analyze system status based on metrics and health checks
   */
  private analyzeSystemStatus(
    metrics: Omit<SystemHealthMetrics, 'systemStatus' | 'performanceScore' | 'lastHealthCheck' | 'activeAlerts'>,
    healthChecks: Map<string, HealthCheckResult>
  ): 'healthy' | 'warning' | 'critical' | 'unknown' {
    const criticalChecks = Array.from(healthChecks.values()).filter(check => check.status === 'fail');
    const warningChecks = Array.from(healthChecks.values()).filter(check => check.status === 'warn');

    if (criticalChecks.length > 0) {
      return 'critical';
    }

    if (warningChecks.length > 0 || metrics.databaseStatus === 'slow' || metrics.memoryUsage.percentage > 80) {
      return 'warning';
    }

    if (metrics.databaseStatus === 'connected' && metrics.apiStatus === 'operational') {
      return 'healthy';
    }

    return 'unknown';
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(
    metrics: Omit<SystemHealthMetrics, 'systemStatus' | 'performanceScore' | 'lastHealthCheck' | 'activeAlerts'>,
    healthChecks: Map<string, HealthCheckResult>
  ): number {
    let score = 100;

    // Deduct points for health check failures
    const failedChecks = Array.from(healthChecks.values()).filter(check => check.status === 'fail');
    const warningChecks = Array.from(healthChecks.values()).filter(check => check.status === 'warn');

    score -= failedChecks.length * 25; // -25 points per failure
    score -= warningChecks.length * 10; // -10 points per warning

    // Deduct points for memory usage
    if (metrics.memoryUsage.percentage > 90) {
      score -= 20;
    } else if (metrics.memoryUsage.percentage > 80) {
      score -= 10;
    }

    // Deduct points for database issues
    if (metrics.databaseStatus === 'error') {
      score -= 30;
    } else if (metrics.databaseStatus === 'slow') {
      score -= 15;
    }

    // Deduct points for API issues
    if (metrics.apiStatus === 'down') {
      score -= 25;
    } else if (metrics.apiStatus === 'degraded') {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Generate alerts for issues
   */
  private async generateAlerts(
    metrics: Omit<SystemHealthMetrics, 'systemStatus' | 'performanceScore' | 'lastHealthCheck' | 'activeAlerts'>,
    healthChecks: Map<string, HealthCheckResult>
  ): Promise<void> {
    const timestamp = new Date();

          // Check for critical issues
      const criticalChecks = Array.from(healthChecks.values()).filter(check => check.status === 'fail');
      for (const check of criticalChecks) {
        await this.createAlert({
          type: 'critical',
          category: 'system',
          message: `Critical health check failure: ${check.message}`,
          details: check.details || {},
          timestamp,
          severity: 'critical',
          source: 'health-check'
        });
      }

      // Check for warning issues
      const warningChecks = Array.from(healthChecks.values()).filter(check => check.status === 'warn');
      for (const check of warningChecks) {
        await this.createAlert({
          type: 'warning',
          category: 'system',
          message: `Warning health check: ${check.message}`,
          details: check.details || {},
          timestamp,
          severity: 'medium',
          source: 'health-check'
        });
      }

    // Check memory usage
    if (metrics.memoryUsage.percentage > 90) {
      await this.createAlert({
        type: 'critical',
        category: 'performance',
        message: `Critical memory usage: ${metrics.memoryUsage.percentage.toFixed(2)}%`,
        details: { percentage: metrics.memoryUsage.percentage, threshold: 90 },
        timestamp,
        severity: 'critical',
        source: 'memory-monitor'
      });
    } else if (metrics.memoryUsage.percentage > 80) {
      await this.createAlert({
        type: 'warning',
        category: 'performance',
        message: `High memory usage: ${metrics.memoryUsage.percentage.toFixed(2)}%`,
        details: { percentage: metrics.memoryUsage.percentage, threshold: 80 },
        timestamp,
        severity: 'high',
        source: 'memory-monitor'
      });
    }

    // Check database status
    if (metrics.databaseStatus === 'error') {
      await this.createAlert({
        type: 'critical',
        category: 'database',
        message: 'Database connection error',
        details: { status: metrics.databaseStatus },
        timestamp,
        severity: 'critical',
        source: 'database-monitor'
      });
    } else if (metrics.databaseStatus === 'slow') {
      await this.createAlert({
        type: 'warning',
        category: 'database',
        message: 'Database performance degradation',
        details: { status: metrics.databaseStatus },
        timestamp,
        severity: 'medium',
        source: 'database-monitor'
      });
    }
  }

  /**
   * Create a new alert
   */
  async createAlert(alertData: Omit<SystemAlert, 'id' | 'acknowledged'>): Promise<SystemAlert> {
    const alert: SystemAlert = {
      ...alertData,
      id: this.generateAlertId(),
      acknowledged: false
    };

    this.activeAlerts.set(alert.id, alert);
    this.emit('alertCreated', alert);

    // Store alert in database if needed
    try {
      // This would store the alert in the database
      // await this.prisma.systemAlert.create({ data: alert });
    } catch (error) {
      logger.error('Failed to store alert in database:', error);
    }

    return alert;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<SystemAlert | null> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return null;
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    this.emit('alertAcknowledged', alert);
    return alert;
  }

  /**
   * Get current system health metrics
   */
  async getCurrentHealth(): Promise<SystemHealthMetrics | null> {
    if (this.metricsHistory.length === 0) {
      return null;
    }
    return this.metricsHistory[this.metricsHistory.length - 1].metrics;
  }

  /**
   * Get health metrics history
   */
  async getHealthHistory(limit: number = 100): Promise<SystemMetrics[]> {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<SystemAlert[]> {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get health check results
   */
  async getHealthCheckResults(): Promise<HealthCheckResult[]> {
    return Array.from(this.healthCheckResults.values());
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format uptime in human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else if (minutes > 0) {
      return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else {
      return `${Math.floor(seconds)}s`;
    }
  }

  /**
   * Clean up old metrics and alerts
   */
  async cleanup(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Remove old metrics
    this.metricsHistory = this.metricsHistory.filter(
      metric => metric.timestamp > oneDayAgo
    );

    // Remove old acknowledged alerts
    for (const [id, alert] of this.activeAlerts.entries()) {
      if (alert.acknowledged && alert.acknowledgedAt && alert.acknowledgedAt < oneDayAgo) {
        this.activeAlerts.delete(id);
      }
    }

    logger.debug('System health service cleanup completed');
  }
}
