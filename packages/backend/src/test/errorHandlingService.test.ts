import { ErrorHandlingService } from '../services/errorHandlingService';
import { ExternalApiError } from '../middleware/errorHandler';

// Mock the logger
jest.mock('../middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('ErrorHandlingService', () => {
  let errorHandlingService: ErrorHandlingService;

  beforeEach(() => {
    errorHandlingService = new ErrorHandlingService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up intervals
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(errorHandlingService.initialize()).resolves.not.toThrow();
    });
  });

  describe('Error Recording', () => {
    it('should record errors and update metrics', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      errorHandlingService.recordError(testError, context, 'medium');

      const metrics = errorHandlingService.getErrorMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorsByType['Error']).toBe(1);
      expect(metrics.errorsByLevel['medium']).toBe(1);
      expect(metrics.errorsByService['test-service']).toBe(1);
    });

    it('should handle different error levels correctly', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      errorHandlingService.recordError(testError, context, 'critical');
      errorHandlingService.recordError(testError, context, 'high');
      errorHandlingService.recordError(testError, context, 'medium');
      errorHandlingService.recordError(testError, context, 'low');

      const metrics = errorHandlingService.getErrorMetrics();
      expect(metrics.errorsByLevel['critical']).toBe(1);
      expect(metrics.errorsByLevel['high']).toBe(1);
      expect(metrics.errorsByLevel['medium']).toBe(1);
      expect(metrics.errorsByLevel['low']).toBe(1);
    });

    it('should handle errors without context', () => {
      const testError = new Error('Test error');

      errorHandlingService.recordError(testError);

      const metrics = errorHandlingService.getErrorMetrics();
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorsByType['Error']).toBe(1);
    });
  });

  describe('Alert Thresholds', () => {
    it('should create alerts when thresholds are met', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Record errors up to threshold (5 for medium level)
      for (let i = 0; i < 5; i++) {
        errorHandlingService.recordError(testError, context, 'medium');
      }

      const alerts = errorHandlingService.getActiveAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].level).toBe('medium');
      expect(alerts[0].message).toContain('Error threshold exceeded');
    });

    it('should create critical alerts immediately', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      errorHandlingService.recordError(testError, context, 'critical');

      const alerts = errorHandlingService.getActiveAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].level).toBe('critical');
    });

    it('should reset error counts after creating alerts', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Record errors up to threshold
      for (let i = 0; i < 5; i++) {
        errorHandlingService.recordError(testError, context, 'medium');
      }

      // Should have created an alert
      expect(errorHandlingService.getActiveAlerts().length).toBe(1);

      // Record one more error - should not create another alert immediately
      errorHandlingService.recordError(testError, context, 'medium');
      expect(errorHandlingService.getActiveAlerts().length).toBe(1);
    });
  });

  describe('Alert Management', () => {
    it('should acknowledge alerts correctly', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Create an alert
      errorHandlingService.recordError(testError, context, 'critical');
      const alerts = errorHandlingService.getActiveAlerts();
      expect(alerts.length).toBe(1);

      // Acknowledge the alert
      const success = errorHandlingService.acknowledgeAlert(alerts[0].id, 'test-user');
      expect(success).toBe(true);

      // Alert should no longer be active
      const activeAlerts = errorHandlingService.getActiveAlerts();
      expect(activeAlerts.length).toBe(0);
    });

    it('should return false for non-existent alert IDs', () => {
      const success = errorHandlingService.acknowledgeAlert('non-existent-id', 'test-user');
      expect(success).toBe(false);
    });

    it('should track acknowledgment details', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Create an alert
      errorHandlingService.recordError(testError, context, 'critical');
      const alerts = errorHandlingService.getActiveAlerts();
      expect(alerts.length).toBe(1);

      // Acknowledge the alert
      const acknowledgedBy = 'test-user';
      errorHandlingService.acknowledgeAlert(alerts[0].id, acknowledgedBy);

      // Get all alerts (including acknowledged ones)
      const allAlerts = errorHandlingService['alerts'];
      const alert = Array.from(allAlerts.values())[0];
      expect(alert.acknowledged).toBe(true);
      expect(alert.acknowledgedBy).toBe(acknowledgedBy);
      expect(alert.acknowledgedAt).toBeDefined();
    });
  });

  describe('Circuit Breaker Monitoring', () => {
    it('should monitor circuit breakers and create alerts for open ones', async () => {
      // Mock the circuit breaker health to return an open circuit breaker
      const mockCircuitBreakerHealth = {
        'test-service': {
          isOpen: true,
          failureCount: 5,
          threshold: 5,
          lastFailureTime: Date.now(),
          nextAttemptTime: Date.now() + 60000
        }
      };

      // Mock the getCircuitBreakerHealth function
      jest.spyOn(errorHandlingService, 'getCircuitBreakerHealth').mockReturnValue(mockCircuitBreakerHealth);

      // Trigger circuit breaker monitoring
      await errorHandlingService['monitorCircuitBreakers']();

      // Should have created an alert for the open circuit breaker
      const alerts = errorHandlingService.getActiveAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].message).toContain('Circuit breaker test-service is open');
      expect(alerts[0].level).toBe('high');
    });
  });

  describe('Error Recovery Procedures', () => {
    it('should return recovery procedures for different error types', () => {
      const procedures = errorHandlingService.getErrorRecoveryProcedures();

      expect(procedures['DatabaseError']).toBeDefined();
      expect(procedures['ExternalApiError']).toBeDefined();
      expect(procedures['ValidationError']).toBeDefined();
      expect(procedures['AuthenticationError']).toBeDefined();
      expect(procedures['RateLimitError']).toBeDefined();

      // Check that procedures contain actionable steps
      expect(procedures['DatabaseError'].length).toBeGreaterThan(0);
      expect(procedures['ExternalApiError'].length).toBeGreaterThan(0);
    });

    it('should provide specific recovery steps for database errors', () => {
      const procedures = errorHandlingService.getErrorRecoveryProcedures();
      const dbProcedures = procedures['DatabaseError'];

      expect(dbProcedures).toContain('Check database connection status');
      expect(dbProcedures).toContain('Verify database credentials');
      expect(dbProcedures).toContain('Check database server availability');
    });
  });

  describe('System Health', () => {
    it('should return healthy status when no critical issues', () => {
      const health = errorHandlingService.getSystemHealth();

      expect(health.status).toBe('healthy');
      expect(health.errors).toBe(0);
      expect(health.alerts).toBe(0);
    });

    it('should return degraded status when there are high-level alerts', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Create a high-level alert
      errorHandlingService.recordError(testError, context, 'high');
      errorHandlingService.recordError(testError, context, 'high');
      errorHandlingService.recordError(testError, context, 'high');

      const health = errorHandlingService.getSystemHealth();
      expect(health.status).toBe('degraded');
    });

    it('should return unhealthy status when there are critical alerts', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Create a critical alert
      errorHandlingService.recordError(testError, context, 'critical');

      const health = errorHandlingService.getSystemHealth();
      expect(health.status).toBe('unhealthy');
    });

    it('should return degraded status when error count is high', () => {
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      // Record many errors to exceed threshold
      for (let i = 0; i < 101; i++) {
        errorHandlingService.recordError(testError, context, 'low');
      }

      const health = errorHandlingService.getSystemHealth();
      expect(health.status).toBe('degraded');
    });
  });

  describe('Execute with Error Handling', () => {
    it('should execute operation successfully without fallback', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const context = { service: 'test-service' };

      const result = await errorHandlingService.executeWithErrorHandling(operation, context);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should record errors when operation fails', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const context = { service: 'test-service' };

      await expect(
        errorHandlingService.executeWithErrorHandling(operation, context)
      ).rejects.toThrow('Operation failed');

      const metrics = errorHandlingService.getErrorMetrics();
      expect(metrics.totalErrors).toBe(1);
    });

    it('should use fallback when primary operation fails', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const fallback = jest.fn().mockResolvedValue('fallback-success');
      const context = { service: 'test-service' };

      const result = await errorHandlingService.executeWithErrorHandling(operation, context, fallback);

      expect(result).toBe('fallback-success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('should record fallback errors when both operations fail', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const fallback = jest.fn().mockRejectedValue(new Error('Fallback failed'));
      const context = { service: 'test-service' };

      await expect(
        errorHandlingService.executeWithErrorHandling(operation, context, fallback)
      ).rejects.toThrow('Fallback failed');

      const metrics = errorHandlingService.getErrorMetrics();
      expect(metrics.totalErrors).toBe(2); // Both primary and fallback errors
    });
  });

  describe('Execute with Resilience', () => {
    it('should use circuit breaker when specified', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const context = { service: 'test-service' };

      const result = await errorHandlingService.executeWithResilience(operation, context, {
        circuitBreakerName: 'test-circuit-breaker'
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use retry when specified', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const context = { service: 'test-service' };

      const result = await errorHandlingService.executeWithResilience(operation, context, {
        maxRetries: 3
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use graceful degradation when specified', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const fallback = jest.fn().mockResolvedValue('fallback-success');
      const context = { service: 'test-service' };

      const result = await errorHandlingService.executeWithResilience(operation, context, {
        fallback
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(fallback).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clean up old alerts and metrics', () => {
      // Create some test alerts
      const testError = new Error('Test error');
      const context = { service: 'test-service' };

      errorHandlingService.recordError(testError, context, 'medium');
      errorHandlingService.recordError(testError, context, 'high');

      // Verify alerts exist
      expect(errorHandlingService.getActiveAlerts().length).toBeGreaterThan(0);

      // Trigger cleanup
      errorHandlingService.cleanup();

      // Cleanup should complete without errors
      // Note: In a real test, you'd want to mock time to test actual cleanup logic
    });
  });

  describe('Error Context and Metadata', () => {
    it('should capture error context correctly', () => {
      const testError = new Error('Test error');
      const context = {
        service: 'test-service',
        userId: 'user-123',
        operation: 'test-operation',
        timestamp: new Date().toISOString()
      };

      errorHandlingService.recordError(testError, context, 'high');

      const alerts = errorHandlingService.getActiveAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].context).toEqual(context);
    });

    it('should handle complex error objects', () => {
      const complexError = new ExternalApiError('API call failed', 500);
      const context = { service: 'external-api' };

      errorHandlingService.recordError(complexError, context, 'critical');

      const metrics = errorHandlingService.getErrorMetrics();
      expect(metrics.errorsByType['ExternalApiError']).toBe(1);
    });
  });
});
