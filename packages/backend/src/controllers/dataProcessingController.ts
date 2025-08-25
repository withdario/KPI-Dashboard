import { Request, Response } from 'express';
import { DataTransformationService, RawMetricsData } from '../services/dataTransformationService';
import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logging';

export class DataProcessingController {
  private dataTransformationService: DataTransformationService;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.dataTransformationService = new DataTransformationService();
  }

  /**
   * Process raw data through the transformation pipeline
   */
  async processData(req: Request, res: Response): Promise<void> {
    try {
      const rawData: RawMetricsData = req.body;

      // Validate required fields
      if (!rawData.source || !rawData.businessEntityId || !rawData.data) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: source, businessEntityId, and data are required'
        });
        return;
      }

      // Validate business entity exists
      const businessEntity = await this.prisma.businessEntity.findUnique({
        where: { id: rawData.businessEntityId }
      });

      if (!businessEntity) {
        res.status(404).json({
          success: false,
          error: 'Business entity not found'
        });
        return;
      }

      // Process data through pipeline
      const result = await this.dataTransformationService.processDataPipeline(rawData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Data processed successfully',
          result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Data processing failed',
          result
        });
      }

    } catch (error) {
      logger.error('Error in data processing controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during data processing'
      });
    }
  }

  /**
   * Transform Google Analytics data specifically
   */
  async transformGoogleAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      const rawData: RawMetricsData = {
        ...req.body,
        source: 'google-analytics'
      };

      const transformedMetrics = await this.dataTransformationService.transformGoogleAnalyticsData(rawData);

      res.status(200).json({
        success: true,
        message: 'Google Analytics data transformed successfully',
        metrics: transformedMetrics,
        count: transformedMetrics.length
      });

    } catch (error) {
      logger.error('Error transforming Google Analytics data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transform Google Analytics data'
      });
    }
  }

  /**
   * Transform n8n data specifically
   */
  async transformN8nData(req: Request, res: Response): Promise<void> {
    try {
      const rawData: RawMetricsData = {
        ...req.body,
        source: 'n8n'
      };

      const transformedMetrics = await this.dataTransformationService.transformN8nData(rawData);

      res.status(200).json({
        success: true,
        message: 'n8n data transformed successfully',
        metrics: transformedMetrics,
        count: transformedMetrics.length
      });

    } catch (error) {
      logger.error('Error transforming n8n data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transform n8n data'
      });
    }
  }

  /**
   * Validate data quality
   */
  async validateDataQuality(req: Request, res: Response): Promise<void> {
    try {
      const rawData: RawMetricsData = req.body;

      const qualityCheck = await this.dataTransformationService.validateDataQuality(rawData);

      res.status(200).json({
        success: true,
        message: 'Data quality validation completed',
        qualityCheck
      });

    } catch (error) {
      logger.error('Error validating data quality:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate data quality'
      });
    }
  }

  /**
   * Aggregate metrics by time period
   */
  async aggregateMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId, startDate, endDate, aggregationPeriod } = req.query;

      if (!businessEntityId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: businessEntityId, startDate, and endDate are required'
        });
        return;
      }

      // Validate business entity exists
      const businessEntity = await this.prisma.businessEntity.findUnique({
        where: { id: businessEntityId as string }
      });

      if (!businessEntity) {
        res.status(404).json({
          success: false,
          error: 'Business entity not found'
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const period = (aggregationPeriod as 'daily' | 'weekly' | 'monthly') || 'daily';

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
        });
        return;
      }

      const aggregatedMetrics = await this.dataTransformationService.aggregateMetrics(
        businessEntityId as string,
        start,
        end,
        period
      );

      res.status(200).json({
        success: true,
        message: 'Metrics aggregated successfully',
        aggregation: {
          businessEntityId,
          startDate: start,
          endDate: end,
          period,
          metrics: aggregatedMetrics,
          count: aggregatedMetrics.length
        }
      });

    } catch (error) {
      logger.error('Error aggregating metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to aggregate metrics'
      });
    }
  }

  /**
   * Get pipeline processing statistics
   */
  async getPipelineStats(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.query;

      if (!businessEntityId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: businessEntityId'
        });
        return;
      }

      // Validate business entity exists
      const businessEntity = await this.prisma.businessEntity.findUnique({
        where: { id: businessEntityId as string }
      });

      if (!businessEntity) {
        res.status(404).json({
          success: false,
          error: 'Business entity not found'
        });
        return;
      }

      // This would typically query actual processing statistics
      // For now, return mock data
      const stats = {
        businessEntityId,
        totalProcessedRecords: 0,
        successfulProcessing: 0,
        failedProcessing: 0,
        averageProcessingTime: 0,
        lastProcessedAt: null,
        dataSources: ['google-analytics', 'n8n']
      };

      res.status(200).json({
        success: true,
        message: 'Pipeline statistics retrieved successfully',
        stats
      });

    } catch (error) {
      logger.error('Error getting pipeline statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve pipeline statistics'
      });
    }
  }

  /**
   * Health check for the data processing pipeline
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'data-processing-pipeline',
        version: '1.0.0',
        components: {
          transformationService: 'operational',
          dataValidation: 'operational',
          aggregationService: 'operational'
        }
      };

      res.status(200).json(healthStatus);

    } catch (error) {
      logger.error('Error in pipeline health check:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'data-processing-pipeline',
        error: 'Health check failed'
      });
    }
  }
}
