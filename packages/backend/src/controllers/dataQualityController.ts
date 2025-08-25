import { Request, Response } from 'express';
import { DataQualityService } from '../services/dataQualityService';
import { logger } from '../middleware/logging';
import { 
  ProcessDataRequest, 
  ValidateDataResponse,
  DataQualityRule 
} from '../types/dataProcessing';

export class DataQualityController {
  private dataQualityService: DataQualityService;

  constructor(dataQualityService: DataQualityService) {
    this.dataQualityService = dataQualityService;
  }

  /**
   * Validate data quality for incoming data
   */
  async validateDataQuality(req: Request, res: Response): Promise<void> {
    try {
      const { source, businessEntityId, timestamp, data, metadata } = req.body as ProcessDataRequest;

      // Validate required fields
      if (!source || !businessEntityId || !timestamp || !data) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: source, businessEntityId, timestamp, and data are required',
          qualityCheck: null
        });
        return;
      }

      // Parse timestamp
      let parsedTimestamp: Date;
      try {
        parsedTimestamp = new Date(timestamp);
        if (isNaN(parsedTimestamp.getTime())) {
          throw new Error('Invalid timestamp format');
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid timestamp format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
          qualityCheck: null
        });
        return;
      }

      const rawData = {
        source: source as 'google-analytics' | 'n8n',
        businessEntityId,
        timestamp: parsedTimestamp,
        data,
        metadata
      };

      const qualityCheck = await this.dataQualityService.validateDataQuality(rawData);

      const response: ValidateDataResponse = {
        success: true,
        message: qualityCheck.isValid ? 'Data quality validation passed' : 'Data quality validation failed',
        qualityCheck
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error in validateDataQuality:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during data quality validation',
        qualityCheck: null
      });
    }
  }

  /**
   * Get data quality metrics for a business entity
   */
  async getQualityMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const { startDate, endDate, source } = req.query;

      if (!businessEntityId) {
        res.status(400).json({
          success: false,
          message: 'Business entity ID is required',
          metrics: null
        });
        return;
      }

      // Parse dates
      let parsedStartDate: Date;
      let parsedEndDate: Date;

      try {
        parsedStartDate = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
        parsedEndDate = endDate ? new Date(endDate as string) : new Date(); // Default to now

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
          metrics: null
        });
        return;
      }

      const metrics = await this.dataQualityService.calculateQualityMetrics(
        businessEntityId,
        parsedStartDate,
        parsedEndDate,
        source as string | undefined
      );

      res.status(200).json({
        success: true,
        message: 'Data quality metrics retrieved successfully',
        metrics
      });
    } catch (error) {
      logger.error('Error in getQualityMetrics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving quality metrics',
        metrics: null
      });
    }
  }

  /**
   * Detect anomalies in data
   */
  async detectAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const { metricType, startDate, endDate } = req.query;

      if (!businessEntityId || !metricType) {
        res.status(400).json({
          success: false,
          message: 'Business entity ID and metric type are required',
          anomalies: null
        });
        return;
      }

      // Parse dates
      let parsedStartDate: Date;
      let parsedEndDate: Date;

      try {
        parsedStartDate = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
        parsedEndDate = endDate ? new Date(endDate as string) : new Date(); // Default to now

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
          anomalies: null
        });
        return;
      }

      const anomalyResult = await this.dataQualityService.detectAnomalies(
        businessEntityId,
        metricType as string,
        parsedStartDate,
        parsedEndDate
      );

      res.status(200).json({
        success: true,
        message: 'Anomaly detection completed successfully',
        anomalies: anomalyResult
      });
    } catch (error) {
      logger.error('Error in detectAnomalies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during anomaly detection',
        anomalies: null
      });
    }
  }

  /**
   * Generate comprehensive data quality report
   */
  async generateQualityReport(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const { startDate, endDate, source } = req.query;

      if (!businessEntityId) {
        res.status(400).json({
          success: false,
          message: 'Business entity ID is required',
          report: null
        });
        return;
      }

      // Parse dates
      let parsedStartDate: Date;
      let parsedEndDate: Date;

      try {
        parsedStartDate = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
        parsedEndDate = endDate ? new Date(endDate as string) : new Date(); // Default to now

        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
          report: null
        });
        return;
      }

      const report = await this.dataQualityService.generateQualityReport(
        businessEntityId,
        parsedStartDate,
        parsedEndDate,
        source as string | undefined
      );

      res.status(200).json({
        success: true,
        message: 'Data quality report generated successfully',
        report
      });
    } catch (error) {
      logger.error('Error in generateQualityReport:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while generating quality report',
        report: null
      });
    }
  }

  /**
   * Get all data quality rules
   */
  async getQualityRules(_req: Request, res: Response): Promise<void> {
    try {
      const rules = this.dataQualityService.getQualityRules();

      res.status(200).json({
        success: true,
        message: 'Data quality rules retrieved successfully',
        rules
      });
    } catch (error) {
      logger.error('Error in getQualityRules:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving quality rules',
        rules: null
      });
    }
  }

  /**
   * Add a custom data quality rule
   */
  async addQualityRule(req: Request, res: Response): Promise<void> {
    try {
      const ruleData = req.body as DataQualityRule;

      // Validate required fields
      if (!ruleData.name || !ruleData.field || !ruleData.ruleType || !ruleData.validation || !ruleData.errorMessage) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, field, ruleType, validation, and errorMessage are required',
          rule: null
        });
        return;
      }

      // Validate rule type
      if (!['required', 'format', 'range', 'custom'].includes(ruleData.ruleType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid rule type. Must be one of: required, format, range, custom',
          rule: null
        });
        return;
      }

      // Validate severity
      if (!['error', 'warning'].includes(ruleData.severity)) {
        res.status(400).json({
          success: false,
          message: 'Invalid severity. Must be one of: error, warning',
          rule: null
        });
        return;
      }

      this.dataQualityService.addQualityRule(ruleData);

      res.status(201).json({
        success: true,
        message: 'Data quality rule added successfully',
        rule: ruleData
      });
    } catch (error) {
      logger.error('Error in addQualityRule:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while adding quality rule',
        rule: null
      });
    }
  }

  /**
   * Remove a data quality rule
   */
  async removeQualityRule(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;

      if (!ruleId) {
        res.status(400).json({
          success: false,
          message: 'Rule ID is required',
          removed: false
        });
        return;
      }

      const removed = this.dataQualityService.removeQualityRule(ruleId);

      if (removed) {
        res.status(200).json({
          success: true,
          message: 'Data quality rule removed successfully',
          removed: true
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Data quality rule not found',
          removed: false
        });
      }
    } catch (error) {
      logger.error('Error in removeQualityRule:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while removing quality rule',
        removed: false
      });
    }
  }

  /**
   * Get data quality alerts for a business entity
   */
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId } = req.params;
      const { limit, offset, resolved } = req.query;

      if (!businessEntityId) {
        res.status(400).json({
          success: false,
          message: 'Business entity ID is required',
          alerts: null
        });
        return;
      }

      const alerts = await this.dataQualityService.getAlerts(
        businessEntityId,
        limit ? parseInt(limit as string) : 50,
        offset ? parseInt(offset as string) : 0,
        resolved !== undefined ? resolved === 'true' : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Data quality alerts retrieved successfully',
        alerts
      });
    } catch (error) {
      logger.error('Error in getAlerts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving alerts',
        alerts: null
      });
    }
  }

  /**
   * Resolve a data quality alert
   */
  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { resolvedBy } = req.body;

      if (!alertId || !resolvedBy) {
        res.status(400).json({
          success: false,
          message: 'Alert ID and resolvedBy are required',
          resolved: false
        });
        return;
      }

      const resolved = await this.dataQualityService.resolveAlert(alertId, resolvedBy);

      if (resolved) {
        res.status(200).json({
          success: true,
          message: 'Data quality alert resolved successfully',
          resolved: true
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Data quality alert not found',
          resolved: false
        });
      }
    } catch (error) {
      logger.error('Error in resolveAlert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while resolving alert',
        resolved: false
      });
    }
  }

  /**
   * Create a data quality alert
   */
  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const { businessEntityId, alertType, severity, message, details } = req.body;

      // Validate required fields
      if (!businessEntityId || !alertType || !severity || !message) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: businessEntityId, alertType, severity, and message are required',
          alert: null
        });
        return;
      }

      // Validate alert type
      if (!['quality_threshold', 'anomaly_detected', 'validation_failure', 'data_drift'].includes(alertType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid alert type. Must be one of: quality_threshold, anomaly_detected, validation_failure, data_drift',
          alert: null
        });
        return;
      }

      // Validate severity
      if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
        res.status(400).json({
          success: false,
          message: 'Invalid severity. Must be one of: low, medium, high, critical',
          alert: null
        });
        return;
      }

      const alert = await this.dataQualityService.createAlert({
        businessEntityId,
        alertType,
        severity,
        message,
        details: details || {},
        isResolved: false
      });

      res.status(201).json({
        success: true,
        message: 'Data quality alert created successfully',
        alert
      });
    } catch (error) {
      logger.error('Error in createAlert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating alert',
        alert: null
      });
    }
  }
}
