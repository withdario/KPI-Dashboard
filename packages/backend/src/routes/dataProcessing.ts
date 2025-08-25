import { Router } from 'express';
import { DataProcessingController } from '../controllers/dataProcessingController';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';

const router = Router();
const prisma = new PrismaClient();
const dataProcessingController = new DataProcessingController(prisma);

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply rate limiting to prevent abuse
router.use(generalRateLimit);

/**
 * @route POST /api/data-processing/process
 * @desc Process raw data through the transformation pipeline
 * @access Private
 */
router.post('/process', 
  async (req, res) => {
    await dataProcessingController.processData(req, res);
  }
);

/**
 * @route POST /api/data-processing/transform/ga4
 * @desc Transform Google Analytics data specifically
 * @access Private
 */
router.post('/transform/ga4',
  async (req, res) => {
    await dataProcessingController.transformGoogleAnalyticsData(req, res);
  }
);

/**
 * @route POST /api/data-processing/transform/n8n
 * @desc Transform n8n data specifically
 * @access Private
 */
router.post('/transform/n8n',
  async (req, res) => {
    await dataProcessingController.transformN8nData(req, res);
  }
);

/**
 * @route POST /api/data-processing/validate
 * @desc Validate data quality without processing
 * @access Private
 */
router.post('/validate',
  async (req, res) => {
    await dataProcessingController.validateDataQuality(req, res);
  }
);

/**
 * @route GET /api/data-processing/aggregate
 * @desc Aggregate metrics by time period
 * @access Private
 */
router.get('/aggregate',
  async (req, res) => {
    await dataProcessingController.aggregateMetrics(req, res);
  }
);

/**
 * @route GET /api/data-processing/stats
 * @desc Get pipeline processing statistics
 * @access Private
 */
router.get('/stats',
  async (req, res) => {
    await dataProcessingController.getPipelineStats(req, res);
  }
);

/**
 * @route GET /api/data-processing/health
 * @desc Health check for the data processing pipeline
 * @access Private
 */
router.get('/health',
  async (req, res) => {
    await dataProcessingController.healthCheck(req, res);
  }
);

export default router;
