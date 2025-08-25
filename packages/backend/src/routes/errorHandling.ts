import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErrorHandlingService } from '../services/errorHandlingService';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();
const errorHandlingService = new ErrorHandlingService();

// Initialize the service when routes are loaded
errorHandlingService.initialize().catch(error => {
  console.error('Failed to initialize error handling service:', error);
});

/**
 * GET /api/error-handling/health
 * Get system health status
 */
router.get('/health', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const health = errorHandlingService.getSystemHealth();
  res.json({
    success: true,
    data: health
  });
}));

/**
 * GET /api/error-handling/metrics
 * Get error metrics and statistics
 */
router.get('/metrics', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const metrics = errorHandlingService.getErrorMetrics();
  res.json({
    success: true,
    data: metrics
  });
}));

/**
 * GET /api/error-handling/alerts
 * Get all active error alerts
 */
router.get('/alerts', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const alerts = errorHandlingService.getActiveAlerts();
  res.json({
    success: true,
    data: alerts
  });
}));

/**
 * POST /api/error-handling/alerts/:alertId/acknowledge
 * Acknowledge an error alert
 */
router.post('/alerts/:alertId/acknowledge', 
  authenticateToken,
  [
    body('acknowledgedBy').isString().notEmpty().withMessage('Acknowledged by is required')
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;
    
    const success = errorHandlingService.acknowledgeAlert(alertId, acknowledgedBy);
    
    if (success) {
      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
  })
);

/**
 * GET /api/error-handling/circuit-breakers
 * Get circuit breaker health status
 */
router.get('/circuit-breakers', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const circuitBreakers = errorHandlingService.getCircuitBreakerHealth();
  res.json({
    success: true,
    data: circuitBreakers
  });
}));

/**
 * GET /api/error-handling/recovery-procedures
 * Get error recovery procedures
 */
router.get('/recovery-procedures', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const procedures = errorHandlingService.getErrorRecoveryProcedures();
  res.json({
    success: true,
    data: procedures
  });
}));

/**
 * POST /api/error-handling/record-error
 * Manually record an error for testing purposes
 */
router.post('/record-error',
  authenticateToken,
  [
    body('error').isObject().withMessage('Error object is required'),
    body('context').optional().isObject().withMessage('Context must be an object'),
    body('level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid error level')
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { error, context = {}, level = 'medium' } = req.body;
    
    // Create a mock error object for testing
    const mockError = new Error(error.message || 'Test error');
    mockError.name = error.name || 'TestError';
    
    errorHandlingService.recordError(mockError, context, level);
    
    res.json({
      success: true,
      message: 'Error recorded successfully'
    });
  })
);

/**
 * POST /api/error-handling/cleanup
 * Trigger manual cleanup of old alerts and metrics
 */
router.post('/cleanup', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  errorHandlingService.cleanup();
  
  res.json({
    success: true,
    message: 'Cleanup completed successfully'
  });
}));

/**
 * GET /api/error-handling/status
 * Get comprehensive error handling system status
 */
router.get('/status', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  const health = errorHandlingService.getSystemHealth();
  const metrics = errorHandlingService.getErrorMetrics();
  const alerts = errorHandlingService.getActiveAlerts();
  const circuitBreakers = errorHandlingService.getCircuitBreakerHealth();
  
  res.json({
    success: true,
    data: {
      health,
      metrics,
      alerts: {
        count: alerts.length,
        critical: alerts.filter(a => a.level === 'critical').length,
        high: alerts.filter(a => a.level === 'high').length,
        medium: alerts.filter(a => a.level === 'medium').length,
        low: alerts.filter(a => a.level === 'low').length
      },
      circuitBreakers,
      lastUpdated: new Date().toISOString()
    }
  });
}));

export default router;
