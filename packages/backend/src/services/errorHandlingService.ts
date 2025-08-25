import { logger } from '../middleware/logging';
import { getCircuitBreakerHealth, withCircuitBreaker, withRetry, withGracefulDegradation } from '../middleware/errorHandler';
import { ExternalApiError } from '../middleware/errorHandler';

// Error alerting and notification system
interface ErrorAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  error: Error;
  timestamp: Date;
  context: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByLevel: Record<string, number>;
  errorsByService: Record<string, number>;
  averageResponseTime: number;
  circuitBreakerStatus: Record<string, any>;
  lastUpdated: Date;
}

export class ErrorHandlingService {
  private alerts: Map<string, ErrorAlert> = new Map();
  private metrics: ErrorMetrics;
  private alertThresholds: Record<string, number> = {
    low: 10,      // Alert after 10 low-level errors
    medium: 5,    // Alert after 5 medium-level errors
    high: 3,      // Alert after 3 high-level errors
    critical: 1   // Alert immediately for critical errors
  };
  private errorCounts: Record<string, number> = {};

  constructor() {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByLevel: {},
      errorsByService: {},
      averageResponseTime: 0,
      circuitBreakerStatus: {},
      lastUpdated: new Date()
    };
  }

  /**
   * Initialize the error handling service
   */
  async initialize(): Promise<void> {
    try {
      // Set up periodic metrics collection
      setInterval(() => this.updateMetrics(), 60000); // Update every minute
      
      // Set up circuit breaker health monitoring
      setInterval(() => this.monitorCircuitBreakers(), 30000); // Check every 30 seconds
      
      logger.info('Error handling service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize error handling service', { error });
      throw error;
    }
  }

  /**
   * Record an error and determine if alerting is needed
   */
  recordError(
    error: Error,
    context: Record<string, any> = {},
    level: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    try {
      // Update error counts
      this.metrics.totalErrors++;
      this.metrics.errorsByType[error.constructor.name] = (this.metrics.errorsByType[error.constructor.name] || 0) + 1;
      this.metrics.errorsByLevel[level] = (this.metrics.errorsByLevel[level] || 0) + 1;
      
      if (context.service) {
        this.metrics.errorsByService[context.service] = (this.metrics.errorsByService[context.service] || 0) + 1;
      }

      // Check if alerting is needed
      this.checkAlertThresholds(error, context, level);
      
      // Update metrics timestamp
      this.metrics.lastUpdated = new Date();
      
      logger.info('Error recorded', {
        errorType: error.constructor.name,
        level,
        context,
        totalErrors: this.metrics.totalErrors
      });
    } catch (alertError) {
      logger.error('Failed to record error', { originalError: error, alertError });
    }
  }

  /**
   * Check if error thresholds are met and create alerts
   */
  private checkAlertThresholds(
    error: Error,
    context: Record<string, any>,
    level: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const errorKey = `${error.constructor.name}:${context.service || 'unknown'}`;
    this.errorCounts[errorKey] = (this.errorCounts[errorKey] || 0) + 1;
    
    const threshold = this.alertThresholds[level];
    if (this.errorCounts[errorKey] >= threshold) {
      this.createAlert(error, context, level);
      this.errorCounts[errorKey] = 0; // Reset counter after alert
    }
  }

  /**
   * Create an error alert
   */
  private createAlert(
    error: Error,
    context: Record<string, any>,
    level: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: ErrorAlert = {
      id: alertId,
      level,
      message: `Error threshold exceeded: ${error.message}`,
      error,
      timestamp: new Date(),
      context,
      acknowledged: false
    };

    this.alerts.set(alertId, alert);
    
    // Log the alert
    logger.warn('Error alert created', {
      alertId,
      level,
      message: alert.message,
      context
    });

    // Send notification based on level
    this.sendNotification(alert);
  }

  /**
   * Send notification for error alerts
   */
  private async sendNotification(alert: ErrorAlert): Promise<void> {
    try {
      // For now, we'll use logging as notification
      // In production, this could integrate with:
      // - Email services (SendGrid, AWS SES)
      // - Slack/Teams webhooks
      // - PagerDuty
      // - SMS services
      
      const notificationMessage = `🚨 ERROR ALERT [${alert.level.toUpperCase()}]: ${alert.message}`;
      
      if (alert.level === 'critical') {
        logger.error(notificationMessage, { alert });
        // TODO: Implement critical alert escalation
      } else if (alert.level === 'high') {
        logger.error(notificationMessage, { alert });
        // TODO: Implement high priority notification
      } else if (alert.level === 'medium') {
        logger.warn(notificationMessage, { alert });
        // TODO: Implement medium priority notification
      } else {
        logger.info(notificationMessage, { alert });
      }
    } catch (notificationError) {
      logger.error('Failed to send notification', { alert, notificationError });
    }
  }

  /**
   * Acknowledge an error alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    logger.info('Error alert acknowledged', { alertId, acknowledgedBy });
    return true;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): ErrorAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  /**
   * Get error metrics
   */
  getErrorMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Update metrics with current system state
   */
  private updateMetrics(): void {
    try {
      // Update circuit breaker status
      this.metrics.circuitBreakerStatus = getCircuitBreakerHealth();
      
      // Calculate average response time (placeholder for now)
      // In production, this would come from actual response time tracking
      this.metrics.averageResponseTime = Math.random() * 100 + 50; // Mock data
      
      this.metrics.lastUpdated = new Date();
    } catch (error) {
      logger.error('Failed to update metrics', { error });
    }
  }

  /**
   * Monitor circuit breakers and create alerts for open ones
   */
  private monitorCircuitBreakers(): void {
    try {
      const circuitBreakerHealth = getCircuitBreakerHealth();
      
      for (const [name, status] of Object.entries(circuitBreakerHealth)) {
        if (status.isOpen) {
          this.recordError(
            new ExternalApiError(`Circuit breaker ${name} is open`),
            { service: name, circuitBreaker: status },
            'high'
          );
        }
      }
    } catch (error) {
      logger.error('Failed to monitor circuit breakers', { error });
    }
  }

  /**
   * Get circuit breaker health status
   */
  getCircuitBreakerHealth(): Record<string, any> {
    return getCircuitBreakerHealth();
  }

  /**
   * Execute operation with comprehensive error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {},
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Record the error
      this.recordError(error as Error, context);
      
      // If fallback is provided, try it
      if (fallback) {
        try {
          logger.info('Attempting fallback operation', { context });
          return await fallback();
        } catch (fallbackError) {
          this.recordError(fallbackError as Error, { ...context, fallback: true }, 'high');
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Execute operation with retry and circuit breaker
   */
  async executeWithResilience<T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {},
    options: {
      circuitBreakerName?: string;
      maxRetries?: number;
      fallback?: () => Promise<T>;
    } = {}
  ): Promise<T> {
    const { circuitBreakerName, maxRetries = 3, fallback } = options;
    
    try {
      if (circuitBreakerName) {
        return await withCircuitBreaker(circuitBreakerName, operation, fallback);
      } else if (maxRetries > 0) {
        return await withRetry(operation, maxRetries);
      } else if (fallback) {
        return await withGracefulDegradation(operation, fallback);
      } else {
        return await operation();
      }
    } catch (error) {
      this.recordError(error as Error, context, 'high');
      throw error;
    }
  }

  /**
   * Get error recovery procedures
   */
  getErrorRecoveryProcedures(): Record<string, string[]> {
    return {
      'DatabaseError': [
        'Check database connection status',
        'Verify database credentials',
        'Check database server availability',
        'Review database logs for errors',
        'Consider database restart if necessary'
      ],
      'ExternalApiError': [
        'Check external service status',
        'Verify API credentials and rate limits',
        'Check network connectivity',
        'Review circuit breaker status',
        'Consider using fallback data sources'
      ],
      'ValidationError': [
        'Review input data format',
        'Check data validation rules',
        'Verify required fields are present',
        'Check data type constraints'
      ],
      'AuthenticationError': [
        'Verify user credentials',
        'Check token expiration',
        'Verify authentication configuration',
        'Check user account status'
      ],
      'RateLimitError': [
        'Wait for rate limit reset',
        'Implement request throttling',
        'Check rate limit configuration',
        'Consider upgrading API plan'
      ]
    };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    errors: number;
    alerts: number;
    circuitBreakers: Record<string, any>;
    lastUpdated: Date;
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(alert => alert.level === 'critical').length;
    const highAlerts = activeAlerts.filter(alert => alert.level === 'high').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (criticalAlerts > 0) {
      status = 'unhealthy';
    } else if (highAlerts > 0 || this.metrics.totalErrors > 100) {
      status = 'degraded';
    }

    return {
      status,
      errors: this.metrics.totalErrors,
      alerts: activeAlerts.length,
      circuitBreakers: this.metrics.circuitBreakerStatus,
      lastUpdated: this.metrics.lastUpdated
    };
  }

  /**
   * Clean up old alerts and metrics
   */
  cleanup(): void {
    try {
      const now = new Date();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      // Remove old alerts
      for (const [id, alert] of this.alerts.entries()) {
        if (now.getTime() - alert.timestamp.getTime() > maxAge) {
          this.alerts.delete(id);
        }
      }
      
      // Reset error counts periodically
      if (now.getTime() - this.metrics.lastUpdated.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
        this.errorCounts = {};
        logger.info('Error counts reset for daily cleanup');
      }
      
      logger.info('Error handling service cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup error handling service', { error });
    }
  }
}
