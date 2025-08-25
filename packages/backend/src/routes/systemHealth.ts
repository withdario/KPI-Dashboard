import { Router } from 'express';
import { SystemHealthController } from '../controllers/systemHealthController';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();
const systemHealthController = new SystemHealthController(global.systemHealthService);

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(rateLimiter);

/**
 * @route GET /api/system-health/current
 * @desc Get current system health status
 * @access Private
 */
router.get('/current', systemHealthController.getCurrentHealth.bind(systemHealthController));

/**
 * @route GET /api/system-health/history
 * @desc Get system health history
 * @access Private
 */
router.get('/history', 
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  validateRequest,
  systemHealthController.getHealthHistory.bind(systemHealthController)
);

/**
 * @route GET /api/system-health/alerts
 * @desc Get active alerts
 * @access Private
 */
router.get('/alerts', systemHealthController.getActiveAlerts.bind(systemHealthController));

/**
 * @route GET /api/system-health/health-checks
 * @desc Get health check results
 * @access Private
 */
router.get('/health-checks', systemHealthController.getHealthCheckResults.bind(systemHealthController));

/**
 * @route GET /api/system-health/summary
 * @desc Get system health summary
 * @access Private
 */
router.get('/summary', systemHealthController.getHealthSummary.bind(systemHealthController));

/**
 * @route GET /api/system-health/monitoring/status
 * @desc Get monitoring status
 * @access Private
 */
router.get('/monitoring/status', systemHealthController.getMonitoringStatus.bind(systemHealthController));

/**
 * @route POST /api/system-health/monitoring/start
 * @desc Start system health monitoring
 * @access Private
 */
router.post('/monitoring/start',
  body('intervalMs').optional().isInt({ min: 5000, max: 300000 }).withMessage('Interval must be between 5 and 300 seconds'),
  validateRequest,
  systemHealthController.startMonitoring.bind(systemHealthController)
);

/**
 * @route POST /api/system-health/monitoring/stop
 * @desc Stop system health monitoring
 * @access Private
 */
router.post('/monitoring/stop', systemHealthController.stopMonitoring.bind(systemHealthController));

/**
 * @route POST /api/system-health/health-check
 * @desc Perform manual health check
 * @access Private
 */
router.post('/health-check', systemHealthController.performHealthCheck.bind(systemHealthController));

/**
 * @route POST /api/system-health/alerts
 * @desc Create a new alert
 * @access Private
 */
router.post('/alerts',
  body('type').isIn(['info', 'warning', 'critical', 'error']).withMessage('Type must be info, warning, critical, or error'),
  body('category').isIn(['system', 'performance', 'database', 'api', 'security']).withMessage('Category must be system, performance, database, api, or security'),
  body('message').isString().trim().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Severity must be low, medium, high, or critical'),
  body('source').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Source must be between 1 and 100 characters'),
  body('businessEntityId').optional().isString().withMessage('Business entity ID must be a string'),
  body('details').optional().isObject().withMessage('Details must be an object'),
  validateRequest,
  systemHealthController.createAlert.bind(systemHealthController)
);

/**
 * @route PUT /api/system-health/alerts/:alertId/acknowledge
 * @desc Acknowledge an alert
 * @access Private
 */
router.put('/alerts/:alertId/acknowledge',
  param('alertId').isString().withMessage('Alert ID must be a string'),
  body('acknowledgedBy').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Acknowledged by must be between 1 and 100 characters'),
  validateRequest,
  systemHealthController.acknowledgeAlert.bind(systemHealthController)
);

/**
 * @route POST /api/system-health/cleanup
 * @desc Clean up old metrics and alerts
 * @access Private
 */
router.post('/cleanup', systemHealthController.cleanup.bind(systemHealthController));

export default router;
