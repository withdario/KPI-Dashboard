import { Router } from 'express';
import { DataQualityController } from '../controllers/dataQualityController';
import { DataQualityService } from '../services/dataQualityService';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Initialize services and controller
const dataQualityService = new DataQualityService(global.prisma);
const dataQualityController = new DataQualityController(dataQualityService);

// Apply authentication to all routes
router.use(authenticateToken);

// Apply rate limiting to all routes
router.use(rateLimit);

// Validation schemas
const validateDataQualityRequest = [
  body('source').isIn(['google-analytics', 'n8n']).withMessage('Source must be either google-analytics or n8n'),
  body('businessEntityId').isString().notEmpty().withMessage('Business entity ID is required'),
  body('timestamp').isISO8601().withMessage('Timestamp must be in ISO 8601 format'),
  body('data').isObject().withMessage('Data must be an object'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object if provided')
];

const validateQualityRuleRequest = [
  body('name').isString().notEmpty().withMessage('Rule name is required'),
  body('description').isString().notEmpty().withMessage('Rule description is required'),
  body('field').isString().notEmpty().withMessage('Field is required'),
  body('ruleType').isIn(['required', 'format', 'range', 'custom']).withMessage('Invalid rule type'),
  body('errorMessage').isString().notEmpty().withMessage('Error message is required'),
  body('severity').isIn(['error', 'warning']).withMessage('Severity must be error or warning')
];

const validateAlertRequest = [
  body('businessEntityId').isString().notEmpty().withMessage('Business entity ID is required'),
  body('alertType').isIn(['quality_threshold', 'anomaly_detected', 'validation_failure', 'data_drift']).withMessage('Invalid alert type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('message').isString().notEmpty().withMessage('Alert message is required'),
  body('details').optional().isObject().withMessage('Details must be an object if provided')
];

const validateDateRangeQuery = [
  query('startDate').optional().isISO8601().withMessage('Start date must be in ISO 8601 format'),
  query('endDate').optional().isISO8601().withMessage('End date must be in ISO 8601 format')
];

const validateMetricTypeQuery = [
  query('metricType').isString().notEmpty().withMessage('Metric type is required')
];

// Data Quality Validation Routes
router.post('/validate', validateDataQualityRequest, validateRequest, async (req, res) => {
  await dataQualityController.validateDataQuality(req, res);
});

// Data Quality Metrics Routes
router.get('/metrics/:businessEntityId', 
  param('businessEntityId').isString().notEmpty().withMessage('Business entity ID is required'),
  validateDateRangeQuery,
  query('source').optional().isString().withMessage('Source must be a string'),
  validateRequest,
  async (req, res) => {
    await dataQualityController.getQualityMetrics(req, res);
  }
);

// Anomaly Detection Routes
router.get('/anomalies/:businessEntityId',
  param('businessEntityId').isString().notEmpty().withMessage('Business entity ID is required'),
  validateMetricTypeQuery,
  validateDateRangeQuery,
  validateRequest,
  async (req, res) => {
    await dataQualityController.detectAnomalies(req, res);
  }
);

// Data Quality Report Routes
router.get('/report/:businessEntityId',
  param('businessEntityId').isString().notEmpty().withMessage('Business entity ID is required'),
  validateDateRangeQuery,
  query('source').optional().isString().withMessage('Source must be a string'),
  validateRequest,
  async (req, res) => {
    await dataQualityController.generateQualityReport(req, res);
  }
);

// Data Quality Rules Management Routes
router.get('/rules', async (req, res) => {
  await dataQualityController.getQualityRules(req, res);
});

router.post('/rules', validateQualityRuleRequest, validateRequest, async (req, res) => {
  await dataQualityController.addQualityRule(req, res);
});

router.delete('/rules/:ruleId',
  param('ruleId').isString().notEmpty().withMessage('Rule ID is required'),
  validateRequest,
  async (req, res) => {
    await dataQualityController.removeQualityRule(req, res);
  }
);

// Data Quality Alerts Routes
router.get('/alerts/:businessEntityId',
  param('businessEntityId').isString().notEmpty().withMessage('Business entity ID is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  query('resolved').optional().isBoolean().withMessage('Resolved must be a boolean'),
  validateRequest,
  async (req, res) => {
    await dataQualityController.getAlerts(req, res);
  }
);

router.post('/alerts', validateAlertRequest, validateRequest, async (req, res) => {
  await dataQualityController.createAlert(req, res);
});

router.patch('/alerts/:alertId/resolve',
  param('alertId').isString().notEmpty().withMessage('Alert ID is required'),
  body('resolvedBy').isString().notEmpty().withMessage('Resolved by is required'),
  validateRequest,
  async (req, res) => {
    await dataQualityController.resolveAlert(req, res);
  }
);

export default router;
