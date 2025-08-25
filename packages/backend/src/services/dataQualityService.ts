import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logging';
import { 
  DataQualityRule, 
  DataQualityReport, 
  DataQualityCheck,
  DataQualityMetrics,
  AnomalyDetectionResult,
  Anomaly,
  DataQualityAlert,
  RawMetricsData
} from '../types/dataProcessing';

export class DataQualityService {
  private prisma: PrismaClient;
  private qualityRules: Map<string, DataQualityRule> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeDefaultRules();
  }

  /**
   * Initialize default data quality rules
   */
  private initializeDefaultRules(): void {
    // Required field validation rules
    this.addQualityRule({
      id: 'required_business_entity_id',
      name: 'Business Entity ID Required',
      description: 'Business entity ID must be present and valid',
      field: 'businessEntityId',
      ruleType: 'required',
      validation: (value: any) => value && typeof value === 'string' && value.length > 0,
      errorMessage: 'Business entity ID is required',
      severity: 'error'
    });

    this.addQualityRule({
      id: 'required_timestamp',
      name: 'Timestamp Required',
      description: 'Timestamp must be present and valid',
      field: 'timestamp',
      ruleType: 'required',
      validation: (value: any) => value && value instanceof Date && !isNaN(value.getTime()),
      errorMessage: 'Valid timestamp is required',
      severity: 'error'
    });

    this.addQualityRule({
      id: 'timestamp_not_future',
      name: 'Timestamp Not in Future',
      description: 'Timestamp should not be in the future',
      field: 'timestamp',
      ruleType: 'custom',
      validation: (value: any) => value && value instanceof Date && value <= new Date(),
      errorMessage: 'Timestamp cannot be in the future',
      severity: 'warning'
    });

    // Google Analytics specific rules
    this.addQualityRule({
      id: 'ga4_property_id_required',
      name: 'GA4 Property ID Required',
      description: 'Google Analytics property ID must be present for GA4 data',
      field: 'data.propertyId',
      ruleType: 'required',
      validation: (value: any, data: any) => {
        if (data.source === 'google-analytics') {
          return value && typeof value === 'string' && value.length > 0;
        }
        return true; // Not applicable for other sources
      },
      errorMessage: 'GA4 property ID is required for Google Analytics data',
      severity: 'warning'
    });

    // n8n specific rules
    this.addQualityRule({
      id: 'n8n_workflow_id_required',
      name: 'n8n Workflow ID Required',
      description: 'Workflow ID must be present for n8n data',
      field: 'data.workflowId',
      ruleType: 'required',
      validation: (value: any, data: any) => {
        if (data.source === 'n8n') {
          return value && typeof value === 'string' && value.length > 0;
        }
        return true; // Not applicable for other sources
      },
      errorMessage: 'Workflow ID is required for n8n data',
      severity: 'warning'
    });

    // Data value validation rules
    this.addQualityRule({
      id: 'numeric_values_valid',
      name: 'Numeric Values Valid',
      description: 'Numeric metric values must be valid numbers',
      field: 'data',
      ruleType: 'custom',
      validation: (value: any) => {
        if (typeof value === 'object' && value !== null) {
          // Check common numeric fields
          const numericFields = ['sessions', 'users', 'pageviews', 'conversions', 'revenue', 'duration'];
          for (const field of numericFields) {
            if (value[field] !== undefined && isNaN(Number(value[field]))) {
              return false;
            }
          }
        }
        return true;
      },
      errorMessage: 'Numeric metric values must be valid numbers',
      severity: 'error'
    });

    logger.info('Default data quality rules initialized');
  }

  /**
   * Add a custom quality rule
   */
  addQualityRule(rule: DataQualityRule): void {
    this.qualityRules.set(rule.id, rule);
    logger.info(`Added data quality rule: ${rule.name}`);
  }

  /**
   * Remove a quality rule
   */
  removeQualityRule(ruleId: string): boolean {
    const removed = this.qualityRules.delete(ruleId);
    if (removed) {
      logger.info(`Removed data quality rule: ${ruleId}`);
    }
    return removed;
  }

  /**
   * Get all quality rules
   */
  getQualityRules(): DataQualityRule[] {
    return Array.from(this.qualityRules.values());
  }

  /**
   * Validate data against all quality rules
   */
  async validateDataQuality(rawData: RawMetricsData): Promise<DataQualityCheck> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Apply all quality rules
      for (const rule of this.qualityRules.values()) {
        try {
          const fieldValue = this.getNestedValue(rawData, rule.field);
          const isValid = rule.validation(fieldValue, rawData);
          
          if (!isValid) {
            const message = `${rule.name}: ${rule.errorMessage}`;
            if (rule.severity === 'error') {
              errors.push(message);
            } else {
              warnings.push(message);
            }
          }
        } catch (error) {
          logger.warn(`Error applying quality rule ${rule.id}:`, error);
          warnings.push(`Quality rule ${rule.name} failed to execute`);
        }
      }

      // Additional business logic validation
      const businessValidation = await this.performBusinessValidation(rawData);
      errors.push(...businessValidation.errors);
      warnings.push(...businessValidation.warnings);

      const isValid = errors.length === 0;
      const validationTime = Date.now() - startTime;

      logger.info(`Data quality validation completed in ${validationTime}ms. Valid: ${isValid}, Errors: ${errors.length}, Warnings: ${warnings.length}`);

      return {
        isValid,
        errors,
        warnings,
        dataSource: rawData.source,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error during data quality validation:', error);
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
        warnings,
        dataSource: rawData.source,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get nested object value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Perform business-specific validation logic
   */
  private async performBusinessValidation(rawData: RawMetricsData): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Business entity validation
    if (rawData.businessEntityId) {
      try {
        const businessEntity = await this.prisma.businessEntity.findUnique({
          where: { id: rawData.businessEntityId }
        });
        
        if (!businessEntity) {
          errors.push(`Business entity with ID ${rawData.businessEntityId} does not exist`);
        } else if (!businessEntity.isActive) {
          warnings.push(`Business entity ${businessEntity.name} is inactive`);
        }
      } catch (error) {
        logger.warn('Error validating business entity:', error);
        warnings.push('Unable to validate business entity existence');
      }
    }

    // Source-specific business validation
    if (rawData.source === 'google-analytics') {
      if (rawData.data.propertyId) {
        try {
          const integration = await this.prisma.googleAnalyticsIntegration.findFirst({
            where: {
              propertyId: rawData.data.propertyId,
              businessEntityId: rawData.businessEntityId,
              isActive: true
            }
          });
          
          if (!integration) {
            warnings.push(`No active GA4 integration found for property ${rawData.data.propertyId}`);
          }
        } catch (error) {
          logger.warn('Error validating GA4 integration:', error);
        }
      }
    } else if (rawData.source === 'n8n') {
      if (rawData.data.workflowId) {
        try {
          const integration = await this.prisma.n8nIntegration.findFirst({
            where: {
              businessEntityId: rawData.businessEntityId,
              isActive: true
            }
          });
          
          if (!integration) {
            warnings.push('No active n8n integration found for this business entity');
          }
        } catch (error) {
          logger.warn('Error validating n8n integration:', error);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Calculate comprehensive data quality metrics
   */
  async calculateQualityMetrics(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    source?: string
  ): Promise<DataQualityMetrics> {
    try {
      // Get metrics data for the period
      const whereClause: any = {
        businessEntityId,
        date: {
          gte: startDate,
          lte: endDate
        }
      };

      if (source) {
        whereClause.source = source;
      }

      const metrics = await this.prisma.metric.findMany({
        where: whereClause,
        select: {
          id: true,
          metricValue: true,
          metadata: true,
          createdAt: true,
          updatedAt: true
        }
      });

      const totalRecords = metrics.length;
      
      if (totalRecords === 0) {
        return {
          totalRecords: 0,
          validRecords: 0,
          invalidRecords: 0,
          qualityScore: 100,
          errorRate: 0,
          warningRate: 0,
          completenessScore: 100,
          accuracyScore: 100,
          consistencyScore: 100,
          timelinessScore: 100
        };
      }

      // Calculate various quality scores
      const completenessScore = this.calculateCompletenessScore(metrics);
      const accuracyScore = this.calculateAccuracyScore(metrics);
      const consistencyScore = this.calculateConsistencyScore(metrics);
      const timelinessScore = this.calculateTimelinessScore(metrics);

      // Overall quality score (weighted average)
      const qualityScore = Math.round(
        (completenessScore * 0.25) +
        (accuracyScore * 0.3) +
        (consistencyScore * 0.25) +
        (timelinessScore * 0.2)
      );

      const validRecords = Math.round((qualityScore / 100) * totalRecords);
      const invalidRecords = totalRecords - validRecords;

      return {
        totalRecords,
        validRecords,
        invalidRecords,
        qualityScore,
        errorRate: totalRecords > 0 ? (invalidRecords / totalRecords) * 100 : 0,
        warningRate: 0, // Would be calculated based on warnings
        completenessScore,
        accuracyScore,
        consistencyScore,
        timelinessScore
      };
    } catch (error) {
      logger.error('Error calculating quality metrics:', error);
      throw new Error(`Failed to calculate quality metrics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate completeness score based on missing or null values
   */
  private calculateCompletenessScore(metrics: any[]): number {
    if (metrics.length === 0) return 100;
    
    let completeRecords = 0;
    for (const metric of metrics) {
      if (metric.metricValue !== null && metric.metricValue !== undefined) {
        completeRecords++;
      }
    }
    
    return Math.round((completeRecords / metrics.length) * 100);
  }

  /**
   * Calculate accuracy score based on data validation
   */
  private calculateAccuracyScore(metrics: any[]): number {
    if (metrics.length === 0) return 100;
    
    let accurateRecords = 0;
    for (const metric of metrics) {
      // Check if metric value is a valid number
      if (typeof metric.metricValue === 'number' && !isNaN(metric.metricValue) && isFinite(metric.metricValue)) {
        accurateRecords++;
      }
    }
    
    return Math.round((accurateRecords / metrics.length) * 100);
  }

  /**
   * Calculate consistency score based on data patterns
   */
  private calculateConsistencyScore(metrics: any[]): number {
    if (metrics.length === 0) return 100;
    
    // Simple consistency check - could be enhanced with more sophisticated algorithms
    let consistentRecords = 0;
    for (const metric of metrics) {
      // Check if metadata is consistent
      if (metric.metadata && typeof metric.metadata === 'object') {
        consistentRecords++;
      }
    }
    
    return Math.round((consistentRecords / metrics.length) * 100);
  }

  /**
   * Calculate timeliness score based on data freshness
   */
  private calculateTimelinessScore(metrics: any[]): number {
    if (metrics.length === 0) return 100;
    
    const now = new Date();
    let timelyRecords = 0;
    
    for (const metric of metrics) {
      const updateTime = metric.updatedAt || metric.createdAt;
      if (updateTime) {
        const ageInHours = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
        // Consider data timely if updated within last 24 hours
        if (ageInHours <= 24) {
          timelyRecords++;
        }
      }
    }
    
    return Math.round((timelyRecords / metrics.length) * 100);
  }

  /**
   * Detect anomalies in data patterns
   */
  async detectAnomalies(
    businessEntityId: string,
    metricType: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnomalyDetectionResult> {
    try {
      const metrics = await this.prisma.metric.findMany({
        where: {
          businessEntityId,
          metricType,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          date: 'asc'
        },
        select: {
          metricValue: true,
          date: true
        }
      });

      if (metrics.length < 3) {
        return {
          hasAnomalies: false,
          anomalies: [],
          confidence: 0,
          recommendations: ['Insufficient data for anomaly detection (minimum 3 data points required)']
        };
      }

      const values = metrics.map(m => m.metricValue);
      const anomalies: Anomaly[] = [];

      // Simple statistical anomaly detection using Z-score
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev === 0) {
        return {
          hasAnomalies: false,
          anomalies: [],
          confidence: 1,
          recommendations: ['No variance in data - all values are identical']
        };
      }

      // Detect outliers using Z-score > 2.5
      for (let i = 0; i < values.length; i++) {
        const zScore = Math.abs((values[i] - mean) / stdDev);
        if (zScore > 2.5) {
          anomalies.push({
            type: 'outlier',
            metric: metricType,
            value: values[i],
            expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
            severity: zScore > 3.5 ? 'critical' : zScore > 3 ? 'high' : 'medium',
            description: `Value ${values[i]} is ${zScore.toFixed(2)} standard deviations from mean`,
            timestamp: metrics[i].date
          });
        }
      }

      // Detect trend changes (simplified)
      if (values.length >= 5) {
        const recentValues = values.slice(-5);
        const earlierValues = values.slice(0, 5);
        
        const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        const earlierMean = earlierValues.reduce((sum, val) => sum + val, 0) / earlierValues.length;
        
        const changePercent = Math.abs((recentMean - earlierMean) / earlierMean) * 100;
        
        if (changePercent > 50) { // 50% change threshold
          anomalies.push({
            type: 'trend_change',
            metric: metricType,
            value: recentMean,
            expectedRange: [earlierMean * 0.5, earlierMean * 1.5],
            severity: changePercent > 100 ? 'high' : 'medium',
            description: `Significant trend change detected: ${changePercent.toFixed(1)}% change`,
            timestamp: metrics[metrics.length - 1].date
          });
        }
      }

      const confidence = Math.min(0.9, 1 - (anomalies.length / values.length));
      
      const recommendations: string[] = [];
      if (anomalies.length > 0) {
        recommendations.push('Review anomalous data points for data quality issues');
        recommendations.push('Consider implementing additional validation rules');
      } else {
        recommendations.push('Data appears to be within normal ranges');
        recommendations.push('Continue monitoring for future anomalies');
      }

      return {
        hasAnomalies: anomalies.length > 0,
        anomalies,
        confidence,
        recommendations
      };
    } catch (error) {
      logger.error('Error detecting anomalies:', error);
      throw new Error(`Failed to detect anomalies: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate comprehensive data quality report
   */
  async generateQualityReport(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    source?: string
  ): Promise<DataQualityReport> {
    try {
      const qualityMetrics = await this.calculateQualityMetrics(businessEntityId, startDate, endDate, source);
      
      // Get rule violations
      const ruleViolations: { [ruleId: string]: { count: number; examples: any[] } } = {};
      
      // This would typically query a data quality audit log
      // For now, return empty violations
      
      const recommendations: string[] = [];
      
      if (qualityMetrics.qualityScore < 80) {
        recommendations.push('Implement additional data validation rules');
        recommendations.push('Review data sources for quality issues');
        recommendations.push('Consider data cleansing procedures');
      }
      
      if (qualityMetrics.completenessScore < 90) {
        recommendations.push('Investigate missing data patterns');
        recommendations.push('Improve data collection processes');
      }
      
      if (qualityMetrics.accuracyScore < 95) {
        recommendations.push('Review data transformation logic');
        recommendations.push('Validate data source accuracy');
      }
      
      if (qualityMetrics.timelinessScore < 80) {
        recommendations.push('Optimize data synchronization schedules');
        recommendations.push('Investigate data processing delays');
      }

      return {
        businessEntityId,
        timestamp: new Date(),
        source: source || 'all',
        totalRecords: qualityMetrics.totalRecords,
        validRecords: qualityMetrics.validRecords,
        invalidRecords: qualityMetrics.invalidRecords,
        qualityScore: qualityMetrics.qualityScore,
        ruleViolations,
        recommendations
      };
    } catch (error) {
      logger.error('Error generating quality report:', error);
      throw new Error(`Failed to generate quality report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create data quality alert
   */
  async createAlert(alert: Omit<DataQualityAlert, 'id' | 'timestamp'>): Promise<DataQualityAlert> {
    try {
      // This would typically store in a database table
      // For now, log the alert and return a mock object
      const newAlert: DataQualityAlert = {
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      logger.warn(`Data Quality Alert: ${alert.alertType} - ${alert.message}`, {
        businessEntityId: alert.businessEntityId,
        severity: alert.severity,
        details: alert.details
      });

      return newAlert;
    } catch (error) {
      logger.error('Error creating data quality alert:', error);
      throw new Error(`Failed to create alert: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get data quality alerts for a business entity
   */
  async getAlerts(
    businessEntityId: string,
    _limit: number = 50,
    _offset: number = 0,
    _resolved?: boolean
  ): Promise<DataQualityAlert[]> {
    try {
      // This would typically query a database table
      // For now, return empty array
      logger.info(`Retrieving data quality alerts for business entity ${businessEntityId}`);
      return [];
    } catch (error) {
      logger.error('Error retrieving data quality alerts:', error);
      throw new Error(`Failed to retrieve alerts: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Resolve a data quality alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      // This would typically update a database table
      logger.info(`Resolving data quality alert ${alertId} by ${resolvedBy}`);
      return true;
    } catch (error) {
      logger.error('Error resolving data quality alert:', error);
      throw new Error(`Failed to resolve alert: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
