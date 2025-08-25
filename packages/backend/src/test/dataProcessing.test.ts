import { DataTransformationService } from '../services/dataTransformationService';
import { DataProcessingController } from '../controllers/dataProcessingController';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

// Mock Prisma client
const mockPrisma = {
  businessEntity: {
    findUnique: jest.fn()
  }
} as any;

// Mock logger
jest.mock('../middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('DataTransformationService', () => {
  let service: DataTransformationService;

  beforeEach(() => {
    service = new DataTransformationService();
    jest.clearAllMocks();
  });

  describe('transformGoogleAnalyticsData', () => {
    it('should transform GA4 sessions data correctly', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          sessions: '150',
          propertyId: 'GA4_PROPERTY_123'
        }
      };

      const result = await service.transformGoogleAnalyticsData(rawData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        businessEntityId: 'test-entity-1',
        date: '2024-01-15',
        source: 'google-analytics',
        metricType: 'sessions',
        value: 150,
        unit: 'count',
        metadata: { source: 'ga4-api' }
      });
    });

    it('should transform multiple GA4 metrics correctly', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          sessions: '150',
          users: '120',
          pageviews: '450',
          conversions: '25',
          revenue: '1250.50',
          propertyId: 'GA4_PROPERTY_123'
        }
      };

      const result = await service.transformGoogleAnalyticsData(rawData);

      expect(result).toHaveLength(5);
      expect(result.map(m => m.metricType)).toEqual([
        'sessions', 'users', 'pageviews', 'conversions', 'revenue'
      ]);
      expect(result[4].value).toBe(1250.50);
      expect(result[4].unit).toBe('currency');
    });

    it('should handle missing GA4 data gracefully', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          propertyId: 'GA4_PROPERTY_123'
        }
      };

      const result = await service.transformGoogleAnalyticsData(rawData);

      expect(result).toHaveLength(0);
    });

    it('should throw error for invalid GA4 data', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: null
      };

      await expect(service.transformGoogleAnalyticsData(rawData))
        .rejects
        .toThrow('Failed to transform GA4 data');
    });
  });

  describe('transformN8nData', () => {
    it('should transform n8n workflow execution data correctly', async () => {
      const rawData = {
        source: 'n8n' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          workflowId: 'workflow-123',
          workflowName: 'Email Automation',
          executionId: 'exec-456',
          status: 'completed',
          duration: 5000
        }
      };

      const result = await service.transformN8nData(rawData);

      expect(result).toHaveLength(3);
      expect(result[0].metricType).toBe('workflow_executions');
      expect(result[1].metricType).toBe('workflow_duration');
      expect(result[2].metricType).toBe('workflow_successes');
      expect(result[1].value).toBe(5000);
      expect(result[1].unit).toBe('milliseconds');
    });

    it('should handle failed workflow status correctly', async () => {
      const rawData = {
        source: 'n8n' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          workflowId: 'workflow-123',
          workflowName: 'Email Automation',
          executionId: 'exec-456',
          status: 'failed'
        }
      };

      const result = await service.transformN8nData(rawData);

      expect(result).toHaveLength(2);
      expect(result[1].metricType).toBe('workflow_failures');
    });

    it('should handle missing workflow data gracefully', async () => {
      const rawData = {
        source: 'n8n' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {}
      };

      const result = await service.transformN8nData(rawData);

      expect(result).toHaveLength(0);
    });
  });

  describe('validateDataQuality', () => {
    it('should validate valid data correctly', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          sessions: '150',
          propertyId: 'GA4_PROPERTY_123'
        }
      };

      const result = await service.validateDataQuality(rawData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing business entity ID', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: '',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      const result = await service.validateDataQuality(rawData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing business entity ID');
    });

    it('should detect missing timestamp', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: null as any,
        data: { sessions: '150' }
      };

      const result = await service.validateDataQuality(rawData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing timestamp');
    });

    it('should detect empty data payload', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {}
      };

      const result = await service.validateDataQuality(rawData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Empty or missing data payload');
    });

    it('should warn about missing GA4 property ID', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      const result = await service.validateDataQuality(rawData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Missing GA4 property ID');
    });

    it('should warn about future timestamp', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: futureDate,
        data: { sessions: '150', propertyId: 'GA4_PROPERTY_123' }
      };

      const result = await service.validateDataQuality(rawData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Timestamp is in the future');
    });
  });

  describe('processDataPipeline', () => {
    it('should process valid data successfully', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          sessions: '150',
          users: '120',
          propertyId: 'GA4_PROPERTY_123'
        }
      };

      const result = await service.processDataPipeline(rawData);

      expect(result.success).toBe(true);
      expect(result.processedRecords).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.dataQuality.isValid).toBe(true);
    });

    it('should fail pipeline for invalid data', async () => {
      const rawData = {
        source: 'google-analytics' as const,
        businessEntityId: '',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      const result = await service.processDataPipeline(rawData);

      expect(result.success).toBe(false);
      expect(result.processedRecords).toBe(0);
      expect(result.errors).toContain('Missing business entity ID');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle unsupported data source', async () => {
      const rawData = {
        source: 'unsupported' as any,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      const result = await service.processDataPipeline(rawData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Pipeline processing failed: Unsupported data source: unsupported');
    });
  });

  describe('aggregateMetrics', () => {
    it('should handle aggregation request correctly', async () => {
      const result = await service.aggregateMetrics(
        'test-entity-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        'daily'
      );

      expect(result).toEqual([]);
    });
  });

  describe('enrichDataWithBusinessContext', () => {
    it('should enrich metrics with business context', async () => {
      const metrics = [
        {
          businessEntityId: 'test-entity-1',
          date: '2024-01-15',
          source: 'google-analytics' as const,
          metricType: 'sessions',
          value: 150,
          unit: 'count'
        }
      ];

      const result = await service.enrichDataWithBusinessContext(metrics);

      expect(result[0].metadata.enriched).toBe(true);
      expect(result[0].metadata.enrichmentTimestamp).toBeDefined();
    });
  });

  describe('trackDataLineage', () => {
    it('should track data lineage without failing', async () => {
      const sourceData = {
        source: 'google-analytics' as const,
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      const transformedMetrics = [
        {
          businessEntityId: 'test-entity-1',
          date: '2024-01-15',
          source: 'google-analytics' as const,
          metricType: 'sessions',
          value: 150,
          unit: 'count'
        }
      ];

      const processingResult = {
        success: true,
        processedRecords: 1,
        errors: [],
        warnings: [],
        processingTime: 100,
        dataQuality: {
          isValid: true,
          errors: [],
          warnings: [],
          dataSource: 'google-analytics',
          timestamp: new Date()
        }
      };

      await expect(service.trackDataLineage(sourceData, transformedMetrics, processingResult))
        .resolves
        .toBeUndefined();
    });
  });
});

describe('DataProcessingController', () => {
  let controller: DataProcessingController;
  let mockPrismaClient: PrismaClient;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockPrismaClient = mockPrisma as any;
    controller = new DataProcessingController(mockPrismaClient);
    
    mockRequest = {
      body: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });

  describe('processData', () => {
    it('should process valid data successfully', async () => {
      mockPrisma.businessEntity.findUnique.mockResolvedValue({
        id: 'test-entity-1',
        name: 'Test Business'
      });

      mockRequest.body = {
        source: 'google-analytics',
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      await controller.processData(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Data processed successfully'
        })
      );
    });

    it('should reject request with missing fields', async () => {
      mockRequest.body = {
        source: 'google-analytics'
        // Missing businessEntityId and data
      };

      await controller.processData(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Missing required fields: source, businessEntityId, and data are required'
        })
      );
    });

    it('should reject request for non-existent business entity', async () => {
      mockPrisma.businessEntity.findUnique.mockResolvedValue(null);

      mockRequest.body = {
        source: 'google-analytics',
        businessEntityId: 'non-existent',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      await controller.processData(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Business entity not found'
        })
      );
    });
  });

  describe('transformGoogleAnalyticsData', () => {
    it('should transform GA4 data successfully', async () => {
      mockRequest.body = {
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150', users: '120' }
      };

      await controller.transformGoogleAnalyticsData(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Google Analytics data transformed successfully',
          count: 2
        })
      );
    });
  });

  describe('transformN8nData', () => {
    it('should transform n8n data successfully', async () => {
      mockRequest.body = {
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: {
          workflowId: 'workflow-123',
          workflowName: 'Test Workflow',
          status: 'completed'
        }
      };

      await controller.transformN8nData(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'n8n data transformed successfully'
        })
      );
    });
  });

  describe('validateDataQuality', () => {
    it('should validate data quality successfully', async () => {
      mockRequest.body = {
        source: 'google-analytics',
        businessEntityId: 'test-entity-1',
        timestamp: new Date('2024-01-15'),
        data: { sessions: '150' }
      };

      await controller.validateDataQuality(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Data quality validation completed'
        })
      );
    });
  });

  describe('aggregateMetrics', () => {
    it('should aggregate metrics successfully', async () => {
      mockPrisma.businessEntity.findUnique.mockResolvedValue({
        id: 'test-entity-1',
        name: 'Test Business'
      });

      mockRequest.query = {
        businessEntityId: 'test-entity-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        aggregationPeriod: 'daily'
      };

      await controller.aggregateMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Metrics aggregated successfully'
        })
      );
    });

    it('should reject aggregation with missing parameters', async () => {
      mockRequest.query = {
        businessEntityId: 'test-entity-1'
        // Missing startDate and endDate
      };

      await controller.aggregateMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Missing required parameters: businessEntityId, startDate, and endDate are required'
        })
      );
    });
  });

  describe('getPipelineStats', () => {
    it('should return pipeline statistics successfully', async () => {
      mockPrisma.businessEntity.findUnique.mockResolvedValue({
        id: 'test-entity-1',
        name: 'Test Business'
      });

      mockRequest.query = {
        businessEntityId: 'test-entity-1'
      };

      await controller.getPipelineStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Pipeline statistics retrieved successfully'
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      await controller.healthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'data-processing-pipeline'
        })
      );
    });
  });
});
