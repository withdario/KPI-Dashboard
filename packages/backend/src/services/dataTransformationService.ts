import { logger } from '../middleware/logging';

export interface RawMetricsData {
  source: 'google-analytics' | 'n8n';
  businessEntityId: string;
  timestamp: Date;
  data: any;
  metadata?: any;
}

export interface BusinessMetrics {
  businessEntityId: string;
  date: string; // YYYY-MM-DD format
  source: 'google-analytics' | 'n8n';
  metricType: string;
  value: number;
  unit?: string;
  metadata?: any;
}

export interface DataQualityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataSource: string;
  timestamp: Date;
}

export interface ProcessingPipelineResult {
  success: boolean;
  processedRecords: number;
  errors: string[];
  warnings: string[];
  processingTime: number;
  dataQuality: DataQualityCheck;
}

export class DataTransformationService {
  constructor() {
    // Service initialized without database dependency for now
  }

  /**
   * Transform raw Google Analytics data into business metrics
   */
  async transformGoogleAnalyticsData(
    rawData: RawMetricsData
  ): Promise<BusinessMetrics[]> {
    try {
      const metrics: BusinessMetrics[] = [];
      const date = this.formatDate(rawData.timestamp);

      // Extract common GA4 metrics
      if (rawData.data.sessions) {
        metrics.push({
          businessEntityId: rawData.businessEntityId,
          date,
          source: 'google-analytics',
          metricType: 'sessions',
          value: parseInt(rawData.data.sessions),
          unit: 'count',
          metadata: { source: 'ga4-api' }
        });
      }

      if (rawData.data.users) {
        metrics.push({
          businessEntityId: rawData.businessEntityId,
          date,
          source: 'google-analytics',
          metricType: 'users',
          value: parseInt(rawData.data.users),
          unit: 'count',
          metadata: { source: 'ga4-api' }
        });
      }

      if (rawData.data.pageviews) {
        metrics.push({
          businessEntityId: rawData.businessEntityId,
          date,
          source: 'google-analytics',
          metricType: 'pageviews',
          value: parseInt(rawData.data.pageviews),
          unit: 'count',
          metadata: { source: 'ga4-api' }
        });
      }

      if (rawData.data.conversions) {
        metrics.push({
          businessEntityId: rawData.businessEntityId,
          date,
          source: 'google-analytics',
          metricType: 'conversions',
          value: parseInt(rawData.data.conversions),
          unit: 'count',
          metadata: { source: 'ga4-api' }
        });
      }

      if (rawData.data.revenue) {
        metrics.push({
          businessEntityId: rawData.businessEntityId,
          date,
          source: 'google-analytics',
          metricType: 'revenue',
          value: parseFloat(rawData.data.revenue),
          unit: 'currency',
          metadata: { source: 'ga4-api', currency: 'USD' }
        });
      }

      logger.info(`Transformed ${metrics.length} GA4 metrics for business entity ${rawData.businessEntityId}`);
      return metrics;
    } catch (error) {
      logger.error('Error transforming Google Analytics data:', error);
      throw new Error(`Failed to transform GA4 data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transform raw n8n webhook data into business metrics
   */
  async transformN8nData(
    rawData: RawMetricsData
  ): Promise<BusinessMetrics[]> {
    try {
      const metrics: BusinessMetrics[] = [];
      const date = this.formatDate(rawData.timestamp);

      // Extract workflow execution metrics
      if (rawData.data.workflowId && rawData.data.status) {
        // Workflow execution count
        metrics.push({
          businessEntityId: rawData.businessEntityId,
          date,
          source: 'n8n',
          metricType: 'workflow_executions',
          value: 1,
          unit: 'count',
          metadata: {
            workflowId: rawData.data.workflowId,
            workflowName: rawData.data.workflowName,
            status: rawData.data.status,
            source: 'n8n-webhook'
          }
        });

        // Workflow duration if available
        if (rawData.data.duration) {
          metrics.push({
            businessEntityId: rawData.businessEntityId,
            date,
            source: 'n8n',
            metricType: 'workflow_duration',
            value: rawData.data.duration,
            unit: 'milliseconds',
            metadata: {
              workflowId: rawData.data.workflowId,
              workflowName: rawData.data.workflowName,
              source: 'n8n-webhook'
            }
          });
        }

        // Success/failure metrics
        if (rawData.data.status === 'completed') {
          metrics.push({
            businessEntityId: rawData.businessEntityId,
            date,
            source: 'n8n',
            metricType: 'workflow_successes',
            value: 1,
            unit: 'count',
            metadata: {
              workflowId: rawData.data.workflowId,
              workflowName: rawData.data.workflowName,
              source: 'n8n-webhook'
            }
          });
        } else if (rawData.data.status === 'failed') {
          metrics.push({
            businessEntityId: rawData.businessEntityId,
            date,
            source: 'n8n',
            metricType: 'workflow_failures',
            value: 1,
            unit: 'count',
            metadata: {
              workflowId: rawData.data.workflowId,
              workflowName: rawData.data.workflowName,
              source: 'n8n-webhook'
            }
          });
        }
      }

      logger.info(`Transformed ${metrics.length} n8n metrics for business entity ${rawData.businessEntityId}`);
      return metrics;
    } catch (error) {
      logger.error('Error transforming n8n data:', error);
      throw new Error(`Failed to transform n8n data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Aggregate metrics by time period (daily, weekly, monthly)
   */
  async aggregateMetrics(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    _aggregationPeriod: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<BusinessMetrics[]> {
    try {
      // This would typically query the processed metrics table
      // For now, return empty array as the table doesn't exist yet
      logger.info(`Aggregating metrics for business entity ${businessEntityId} from ${startDate} to ${endDate}`);
      return [];
    } catch (error) {
      logger.error('Error aggregating metrics:', error);
      throw new Error(`Failed to aggregate metrics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Perform data quality validation
   */
  async validateDataQuality(
    rawData: RawMetricsData
  ): Promise<DataQualityCheck> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!rawData.businessEntityId) {
      errors.push('Missing business entity ID');
    }

    if (!rawData.timestamp) {
      errors.push('Missing timestamp');
    }

    if (!rawData.data || Object.keys(rawData.data).length === 0) {
      errors.push('Empty or missing data payload');
    }

    // Source-specific validation
    if (rawData.source === 'google-analytics') {
      if (!rawData.data.propertyId) {
        warnings.push('Missing GA4 property ID');
      }
    } else if (rawData.source === 'n8n') {
      if (!rawData.data.workflowId) {
        warnings.push('Missing workflow ID');
      }
    }

    // Timestamp validation
    if (rawData.timestamp && rawData.timestamp > new Date()) {
      warnings.push('Timestamp is in the future');
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      dataSource: rawData.source,
      timestamp: new Date()
    };
  }

  /**
   * Process data through the complete transformation pipeline
   */
  async processDataPipeline(
    rawData: RawMetricsData
  ): Promise<ProcessingPipelineResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let processedRecords = 0;

    try {
      // Step 1: Data quality validation
      const qualityCheck = await this.validateDataQuality(rawData);
      if (!qualityCheck.isValid) {
        errors.push(...qualityCheck.errors);
        return {
          success: false,
          processedRecords: 0,
          errors,
          warnings: [...warnings, ...qualityCheck.warnings],
          processingTime: Date.now() - startTime,
          dataQuality: qualityCheck
        };
      }

      warnings.push(...qualityCheck.warnings);

      // Step 2: Transform data based on source
      let transformedMetrics: BusinessMetrics[] = [];
      if (rawData.source === 'google-analytics') {
        transformedMetrics = await this.transformGoogleAnalyticsData(rawData);
      } else if (rawData.source === 'n8n') {
        transformedMetrics = await this.transformN8nData(rawData);
      } else {
        throw new Error(`Unsupported data source: ${rawData.source}`);
      }

      processedRecords = transformedMetrics.length;

      // Step 3: Store transformed metrics (would be implemented when metrics table exists)
      // await this.storeMetrics(transformedMetrics);

      const processingTime = Date.now() - startTime;

      logger.info(`Data pipeline completed successfully. Processed ${processedRecords} records in ${processingTime}ms`);

      return {
        success: true,
        processedRecords,
        errors,
        warnings,
        processingTime,
        dataQuality: qualityCheck
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      errors.push(`Pipeline processing failed: ${error instanceof Error ? error.message : String(error)}`);

      logger.error('Data pipeline failed:', error);

      return {
        success: false,
        processedRecords,
        errors,
        warnings,
        processingTime,
        dataQuality: {
          isValid: false,
          errors,
          warnings,
          dataSource: rawData.source,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Enrich data with business context
   */
  async enrichDataWithBusinessContext(
    metrics: BusinessMetrics[]
  ): Promise<BusinessMetrics[]> {
    try {
      // This would typically fetch additional business context
      // For now, return the metrics as-is
      return metrics.map(metric => ({
        ...metric,
        metadata: {
          ...metric.metadata,
          enriched: true,
          enrichmentTimestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      logger.error('Error enriching data with business context:', error);
      return metrics; // Return original metrics if enrichment fails
    }
  }

  /**
   * Track data lineage for audit purposes
   */
  async trackDataLineage(
    sourceData: RawMetricsData,
    transformedMetrics: BusinessMetrics[],
    _processingResult: ProcessingPipelineResult
  ): Promise<void> {
    try {
      // This would typically store lineage information in a dedicated table
      logger.info(`Data lineage tracked for ${transformedMetrics.length} metrics from ${sourceData.source}`);
    } catch (error) {
      logger.error('Error tracking data lineage:', error);
      // Don't fail the pipeline for lineage tracking errors
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
