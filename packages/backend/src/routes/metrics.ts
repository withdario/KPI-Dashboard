import express from 'express';
import { MetricsService } from '../services/metricsService';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { generalRateLimit as rateLimit } from '../middleware/rateLimit';
import { cacheMiddleware } from '../middleware/cache';
import { 
  CreateMetricInput, 
  CreateAutomationExecutionInput, 
  CreateDataArchiveInput,
  MetricType,
  MetricSource,
  AutomationType,
  AutomationStatus,
  TriggerType,
  ArchiveType
} from '../types/metrics';

const router = express.Router();
const prisma = new PrismaClient();
const metricsService = new MetricsService(prisma);

// Apply middleware
router.use(authenticateToken);
router.use(rateLimit);

// ===== METRICS ROUTES =====

/**
 * @route POST /api/metrics
 * @desc Create a new metric
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const input: CreateMetricInput = {
      ...req.body,
      date: new Date(req.body.date),
      timezone: req.body.timezone || 'UTC'
    };

    const metric = await metricsService.createMetric(input);
    res.status(201).json({
      success: true,
      data: metric,
      message: 'Metric created successfully'
    });
  } catch (error) {
    console.error('Error creating metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create metric',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics
 * @desc Get all metrics with optional filtering
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const query: any = {
      businessEntityId: req.query.businessEntityId as string
    };

    if (req.query.metricType) query.metricType = req.query.metricType as MetricType;
    if (req.query.source) query.source = req.query.source as MetricSource;
    if (req.query.startDate) query.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) query.endDate = new Date(req.query.endDate as string);
    if (req.query.tags) query.tags = (req.query.tags as string).split(',');
    if (req.query.isArchived !== undefined) query.isArchived = req.query.isArchived === 'true';
    if (req.query.limit) query.limit = parseInt(req.query.limit as string);
    if (req.query.offset) query.offset = parseInt(req.query.offset as string);

    const result = await metricsService.getMetrics(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/:id
 * @desc Get a specific metric by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metric = await metricsService.getMetricById(id);

    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Metric not found'
      });
    }

    return res.json({
      success: true,
      data: metric
    });
  } catch (error) {
    console.error('Error fetching metric:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch metric',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route PUT /api/metrics/:id
 * @desc Update a metric
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert date strings to Date objects if present
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const metric = await metricsService.updateMetric(id, updates);
    res.json({
      success: true,
      data: metric,
      message: 'Metric updated successfully'
    });
  } catch (error) {
    console.error('Error updating metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update metric',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route DELETE /api/metrics/:id
 * @desc Archive a metric
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metric = await metricsService.archiveMetric(id);
    
    res.json({
      success: true,
      data: metric,
      message: 'Metric archived successfully'
    });
  } catch (error) {
    console.error('Error archiving metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive metric',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== AUTOMATION EXECUTIONS ROUTES =====

/**
 * @route POST /api/metrics/automations
 * @desc Create a new automation execution
 * @access Private
 */
router.post('/automations', async (req, res) => {
  try {
    const input: CreateAutomationExecutionInput = {
      ...req.body,
      startTime: new Date(req.body.startTime),
      endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
      nextRetryAt: req.body.nextRetryAt ? new Date(req.body.nextRetryAt) : undefined
    };

    const execution = await metricsService.createAutomationExecution(input);
    res.status(201).json({
      success: true,
      data: execution,
      message: 'Automation execution created successfully'
    });
  } catch (error) {
    console.error('Error creating automation execution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create automation execution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/automations
 * @desc Get all automation executions with optional filtering
 * @access Private
 */
router.get('/automations', async (req, res) => {
  try {
    const query: any = {
      businessEntityId: req.query.businessEntityId as string
    };

    if (req.query.automationType) query.automationType = req.query.automationType as AutomationType;
    if (req.query.status) query.status = req.query.status as AutomationStatus;
    if (req.query.startDate) query.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) query.endDate = new Date(req.query.endDate as string);
    if (req.query.triggerType) query.triggerType = req.query.triggerType as TriggerType;
    if (req.query.isArchived !== undefined) query.isArchived = req.query.isArchived === 'true';
    if (req.query.limit) query.limit = parseInt(req.query.limit as string);
    if (req.query.offset) query.offset = parseInt(req.query.offset as string);

    const result = await metricsService.getAutomationExecutions(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching automation executions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation executions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/automations/:id
 * @desc Get a specific automation execution by ID
 * @access Private
 */
router.get('/automations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const execution = await metricsService.getAutomationExecutionById(id);

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Automation execution not found'
      });
    }

    return res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error fetching automation execution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch automation execution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route PUT /api/metrics/automations/:id/status
 * @desc Update automation execution status
 * @access Private
 */
router.put('/automations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endTime, duration } = req.body;

    const execution = await metricsService.updateAutomationExecutionStatus(
      id, 
      status, 
      endTime ? new Date(endTime) : undefined, 
      duration
    );
    
    res.json({
      success: true,
      data: execution,
      message: 'Automation execution status updated successfully'
    });
  } catch (error) {
    console.error('Error updating automation execution status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update automation execution status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== DATA ARCHIVES ROUTES =====

/**
 * @route POST /api/metrics/archives
 * @desc Create a new data archive
 * @access Private
 */
router.post('/archives', async (req, res) => {
  try {
    const input: CreateDataArchiveInput = {
      ...req.body,
      archiveDate: new Date(req.body.archiveDate)
    };

    const archive = await metricsService.createDataArchive(input);
    res.status(201).json({
      success: true,
      data: archive,
      message: 'Data archive created successfully'
    });
  } catch (error) {
    console.error('Error creating data archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create data archive',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/archives
 * @desc Get all data archives with optional filtering
 * @access Private
 */
router.get('/archives', async (req, res) => {
  try {
    const query: any = {
      businessEntityId: req.query.businessEntityId as string
    };

    if (req.query.archiveType) query.archiveType = req.query.archiveType as ArchiveType;
    if (req.query.sourceTable) query.sourceTable = req.query.sourceTable as string;
    if (req.query.startDate) query.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) query.endDate = new Date(req.query.endDate as string);
    if (req.query.isRestorable !== undefined) query.isRestorable = req.query.isRestorable === 'true';
    if (req.query.limit) query.limit = parseInt(req.query.limit as string);
    if (req.query.offset) query.offset = parseInt(req.query.offset as string);

    const result = await metricsService.getDataArchives(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching data archives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data archives',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===== UTILITY ROUTES =====

/**
 * @route GET /api/metrics/summary
 * @desc Get metrics summary for a business entity
 * @access Private
 */
router.get('/summary', cacheMiddleware.cacheResponse(2 * 60 * 1000), async (req, res) => {
  try {
    const { businessEntityId, startDate, endDate } = req.query;
    
    if (!businessEntityId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId, startDate, and endDate are required'
      });
    }

    const summary = await metricsService.getMetricsSummary(
      businessEntityId as string,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/history
 * @desc Get historical metrics data for trend analysis
 * @access Private
 */
router.get('/history', cacheMiddleware.cacheResponse(5 * 60 * 1000), async (req, res) => {
  try {
    const { businessEntityId, startDate, endDate, metricType, aggregation } = req.query;
    
    if (!businessEntityId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId, startDate, and endDate are required'
      });
    }

    const history = await metricsService.getMetricsHistory(
      businessEntityId as string,
      new Date(startDate as string),
      new Date(endDate as string),
      metricType as string,
      aggregation as string || 'daily'
    );
    
    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching metrics history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/automation/performance
 * @desc Get automation performance metrics and insights
 * @access Private
 */
router.get('/automation/performance', cacheMiddleware.cacheResponse(3 * 60 * 1000), async (req, res) => {
  try {
    const { businessEntityId, startDate, endDate, automationType } = req.query;
    
    if (!businessEntityId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId, startDate, and endDate are required'
      });
    }

    const performance = await metricsService.getAutomationPerformance(
      businessEntityId as string,
      new Date(startDate as string),
      new Date(endDate as string),
      automationType as string
    );
    
    return res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching automation performance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch automation performance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/insights/business
 * @desc Get business insights and recommendations
 * @access Private
 */
router.get('/insights/business', cacheMiddleware.cacheResponse(10 * 60 * 1000), async (req, res) => {
  try {
    const { businessEntityId, startDate, endDate, insightType } = req.query;
    
    if (!businessEntityId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId, startDate, and endDate are required'
      });
    }

    const insights = await metricsService.getBusinessInsights(
      businessEntityId as string,
      new Date(startDate as string),
      new Date(endDate as string),
      insightType as string
    );
    
    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching business insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch business insights',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/export
 * @desc Export metrics data in various formats
 * @access Private
 */
router.get('/export', async (req, res) => {
  try {
    const { businessEntityId, startDate, endDate, format, metricType } = req.query;
    
    if (!businessEntityId || !startDate || !endDate || !format) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId, startDate, endDate, and format are required'
      });
    }

    const exportData = await metricsService.exportMetrics(
      businessEntityId as string,
      new Date(startDate as string),
      new Date(endDate as string),
      format as string,
      metricType as string
    );
    
    // Set appropriate headers for file download
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="metrics-${startDate}-${endDate}.csv"`);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="metrics-${startDate}-${endDate}.json"`);
    }
    
    return res.send(exportData);
  } catch (error) {
    console.error('Error exporting metrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/automation/export
 * @desc Export automation execution data
 * @access Private
 */
router.get('/automation/export', async (req, res) => {
  try {
    const { businessEntityId, startDate, endDate, format, automationType } = req.query;
    
    if (!businessEntityId || !startDate || !endDate || !format) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId, startDate, endDate, and format are required'
      });
    }

    const exportData = await metricsService.exportAutomationData(
      businessEntityId as string,
      new Date(startDate as string),
      new Date(endDate as string),
      format as string,
      automationType as string
    );
    
    // Set appropriate headers for file download
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="automation-${startDate}-${endDate}.csv"`);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="automation-${startDate}-${endDate}.json"`);
    }
    
    return res.send(exportData);
  } catch (error) {
    console.error('Error exporting automation data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export automation data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/metrics/cleanup
 * @desc Clean up old data based on retention policy
 * @access Private
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { businessEntityId, retentionDays } = req.body;
    
    if (!businessEntityId || !retentionDays) {
      return res.status(400).json({
        success: false,
        message: 'businessEntityId and retentionDays are required'
      });
    }

    const result = await metricsService.cleanupOldData(
      businessEntityId,
      parseInt(retentionDays)
    );
    
    return res.json({
      success: true,
      data: result,
      message: 'Data cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cleanup old data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/metrics/cache/stats
 * @desc Get cache statistics and information
 * @access Private
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = cacheMiddleware.getCacheStats();
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cache stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/metrics/cache/clear
 * @desc Clear cache for specific business entity or all cache
 * @access Private
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const { businessEntityId } = req.body;
    
    if (businessEntityId) {
      cacheMiddleware.clearBusinessEntityCache(businessEntityId);
      return res.json({
        success: true,
        message: `Cache cleared for business entity: ${businessEntityId}`
      });
    } else {
      cacheMiddleware.clearAllCache();
      return res.json({
        success: true,
        message: 'All cache cleared successfully'
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
