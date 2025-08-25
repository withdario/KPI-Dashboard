import { Router } from 'express';
import { body } from 'express-validator';
import { DataSyncController } from '../controllers/dataSyncController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { generalRateLimit } from '../middleware/rateLimit';

const router = Router();
const dataSyncController = new DataSyncController(global.dataSyncService);

// Apply rate limiting to all sync routes
router.use(generalRateLimit);

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route GET /api/sync/jobs
 * @desc Get sync jobs with filtering
 * @access Private
 */
router.get('/jobs', dataSyncController.getSyncJobs.bind(dataSyncController));

/**
 * @route GET /api/sync/jobs/:id
 * @desc Get sync job by ID
 * @access Private
 */
router.get('/jobs/:id', dataSyncController.getSyncJobById.bind(dataSyncController));

/**
 * @route GET /api/sync/stats/:businessEntityId
 * @desc Get sync job statistics for a business entity
 * @access Private
 */
router.get('/stats/:businessEntityId', dataSyncController.getSyncJobStats.bind(dataSyncController));

/**
 * @route POST /api/sync/config
 * @desc Create sync configuration
 * @access Private
 */
router.post('/config', 
  body('businessEntityId').isString().notEmpty(),
  body('ga4SyncEnabled').optional().isBoolean(),
  body('ga4SyncSchedule').optional().isString(),
  body('n8nSyncEnabled').optional().isBoolean(),
  body('n8nSyncSchedule').optional().isString(),
  body('cleanupSyncEnabled').optional().isBoolean(),
  body('cleanupSyncSchedule').optional().isString(),
  handleValidationErrors,
  dataSyncController.createSyncConfig.bind(dataSyncController)
);

/**
 * @route GET /api/sync/config/:businessEntityId
 * @desc Get sync configuration for a business entity
 * @access Private
 */
router.get('/config/:businessEntityId', dataSyncController.getSyncConfig.bind(dataSyncController));

/**
 * @route PUT /api/sync/config/:businessEntityId
 * @desc Update sync configuration
 * @access Private
 */
router.put('/config/:businessEntityId',
  body('ga4SyncEnabled').optional().isBoolean(),
  body('ga4SyncSchedule').optional().isString(),
  body('n8nSyncEnabled').optional().isBoolean(),
  body('n8nSyncSchedule').optional().isString(),
  body('cleanupSyncEnabled').optional().isBoolean(),
  body('cleanupSyncSchedule').optional().isString(),
  handleValidationErrors,
  dataSyncController.updateSyncConfig.bind(dataSyncController)
);

/**
 * @route POST /api/sync/manual
 * @desc Trigger manual synchronization
 * @access Private
 */
router.post('/manual',
  body('businessEntityId').isString().notEmpty(),
  body('jobType').isString().notEmpty().isIn(['ga4_daily', 'n8n_realtime', 'cleanup']),
  handleValidationErrors,
  dataSyncController.triggerManualSync.bind(dataSyncController)
);

/**
 * @route GET /api/sync/health/:businessEntityId
 * @desc Get sync service health status
 * @access Private
 */
router.get('/health/:businessEntityId', dataSyncController.getSyncHealth.bind(dataSyncController));

/**
 * @route POST /api/sync/initialize
 * @desc Initialize the sync service
 * @access Private (Admin only)
 */
router.post('/initialize', dataSyncController.initializeSyncService.bind(dataSyncController));

/**
 * @route POST /api/sync/shutdown
 * @desc Shutdown the sync service
 * @access Private (Admin only)
 */
router.post('/shutdown', dataSyncController.shutdownSyncService.bind(dataSyncController));

export default router;
