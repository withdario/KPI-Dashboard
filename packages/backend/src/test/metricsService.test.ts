import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MetricsService } from '../services/metricsService';
import { PrismaClient } from '@prisma/client';
import {
  MetricType,
  MetricSource,
  AutomationType,
  AutomationStatus,
  TriggerType,
  ArchiveType
} from '../types/metrics';

// Mock PrismaClient
const mockPrisma = {
  metric: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn()
  },
  automationExecution: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn()
  },
  dataArchive: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn()
  },
  n8nWebhookEvent: {
    findMany: jest.fn()
  }
} as any;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma)
}));

describe('MetricsService', () => {
  let metricsService: MetricsService;
  let mockPrismaInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaInstance = new PrismaClient();
    metricsService = new MetricsService(mockPrismaInstance);
  });

  describe('Metrics Management', () => {
    const mockMetricInput = {
      businessEntityId: 'be-123',
      metricType: MetricType.GA4_PAGEVIEW,
      metricName: 'pageviews',
      metricValue: 1500,
      metricUnit: 'count',
      source: MetricSource.GOOGLE_ANALYTICS,
      sourceId: 'ga4-123',
      date: new Date('2024-01-01'),
      timezone: 'UTC',
      metadata: { page: '/home' },
      tags: ['homepage', 'traffic']
    };

    const mockMetric = {
      id: 'metric-123',
      ...mockMetricInput,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    describe('createMetric', () => {
      it('should create a metric successfully', async () => {
        mockPrisma.metric.create.mockResolvedValue(mockMetric);

        const result = await metricsService.createMetric(mockMetricInput);

        expect(mockPrisma.metric.create).toHaveBeenCalledWith({
          data: mockMetricInput
        });
        expect(result).toEqual(mockMetric);
      });

      it('should create a metric with default values', async () => {
        const inputWithoutDefaults = {
          businessEntityId: 'be-123',
          metricType: MetricType.GA4_PAGEVIEW,
          metricName: 'pageviews',
          metricValue: 1500,
          source: MetricSource.GOOGLE_ANALYTICS,
          date: new Date('2024-01-01')
        };

        const expectedData = {
          ...inputWithoutDefaults,
          timezone: 'UTC',
          metadata: {},
          tags: [],
          metricUnit: null,
          sourceId: null
        };

        mockPrisma.metric.create.mockResolvedValue(mockMetric);

        await metricsService.createMetric(inputWithoutDefaults);

        expect(mockPrisma.metric.create).toHaveBeenCalledWith({
          data: expectedData
        });
      });
    });

    describe('getMetrics', () => {
      it('should get metrics with basic query', async () => {
        const query = { businessEntityId: 'be-123' };
        const mockMetrics = [mockMetric];
        const mockCount = 1;

        mockPrisma.metric.findMany.mockResolvedValue(mockMetrics);
        mockPrisma.metric.count.mockResolvedValue(mockCount);

        const result = await metricsService.getMetrics(query);

        expect(mockPrisma.metric.findMany).toHaveBeenCalledWith({
          where: { businessEntityId: 'be-123', isArchived: false },
          orderBy: { date: 'desc' },
          take: 100,
          skip: 0
        });
        expect(result.metrics).toEqual(mockMetrics);
        expect(result.total).toBe(mockCount);
        expect(result.page).toBe(1);
        expect(result.hasMore).toBe(false);
      });

      it('should apply filters correctly', async () => {
        const query = {
          businessEntityId: 'be-123',
          metricType: MetricType.GA4_SESSION,
          source: MetricSource.GOOGLE_ANALYTICS,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          tags: ['homepage'],
          limit: 50,
          offset: 25
        };

        mockPrisma.metric.findMany.mockResolvedValue([]);
        mockPrisma.metric.count.mockResolvedValue(0);

        await metricsService.getMetrics(query);

        expect(mockPrisma.metric.findMany).toHaveBeenCalledWith({
          where: {
            businessEntityId: 'be-123',
            isArchived: false,
            metricType: MetricType.GA4_SESSION,
            source: MetricSource.GOOGLE_ANALYTICS,
            date: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31')
            },
            tags: {
              hasSome: ['homepage']
            }
          },
          orderBy: { date: 'desc' },
          take: 50,
          skip: 25
        });
      });
    });

    describe('getMetricById', () => {
      it('should get metric by ID', async () => {
        mockPrisma.metric.findUnique.mockResolvedValue(mockMetric);

        const result = await metricsService.getMetricById('metric-123');

        expect(mockPrisma.metric.findUnique).toHaveBeenCalledWith({
          where: { id: 'metric-123' }
        });
        expect(result).toEqual(mockMetric);
      });

      it('should return null for non-existent metric', async () => {
        mockPrisma.metric.findUnique.mockResolvedValue(null);

        const result = await metricsService.getMetricById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('updateMetric', () => {
      it('should update metric successfully', async () => {
        const updates = { metricValue: 2000 };
        const updatedMetric = { ...mockMetric, ...updates, updatedAt: new Date() };

        mockPrisma.metric.update.mockResolvedValue(updatedMetric);

        const result = await metricsService.updateMetric('metric-123', updates);

        expect(mockPrisma.metric.update).toHaveBeenCalledWith({
          where: { id: 'metric-123' },
          data: { ...updates, updatedAt: expect.any(Date) }
        });
        expect(result).toEqual(updatedMetric);
      });
    });

    describe('archiveMetric', () => {
      it('should archive metric successfully', async () => {
        const archivedMetric = { ...mockMetric, isArchived: true, updatedAt: new Date() };

        mockPrisma.metric.update.mockResolvedValue(archivedMetric);

        const result = await metricsService.archiveMetric('metric-123');

        expect(mockPrisma.metric.update).toHaveBeenCalledWith({
          where: { id: 'metric-123' },
          data: { isArchived: true, updatedAt: expect.any(Date) }
        });
        expect(result).toEqual(archivedMetric);
      });
    });

    describe('deleteMetric', () => {
      it('should delete metric successfully', async () => {
        mockPrisma.metric.delete.mockResolvedValue(undefined);

        await metricsService.deleteMetric('metric-123');

        expect(mockPrisma.metric.delete).toHaveBeenCalledWith({
          where: { id: 'metric-123' }
        });
      });
    });
  });

  describe('Automation Executions Management', () => {
    const mockAutomationInput = {
      businessEntityId: 'be-123',
      automationType: AutomationType.N8N_WORKFLOW,
      automationName: 'Email Campaign',
      executionId: 'exec-123',
      status: AutomationStatus.RUNNING,
      startTime: new Date('2024-01-01T10:00:00Z'),
      triggerType: TriggerType.SCHEDULED,
      triggerData: { schedule: 'daily' },
      inputData: { campaignId: 'camp-123' },
      outputData: {},
      tags: ['email', 'campaign']
    };

    const mockAutomation = {
      id: 'auto-123',
      ...mockAutomationInput,
      endTime: undefined,
      duration: undefined,
      errorMessage: undefined,
      errorCode: undefined,
      retryCount: 0,
      maxRetries: 3,
      nextRetryAt: undefined,
      metadata: {},
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    describe('createAutomationExecution', () => {
      it('should create automation execution successfully', async () => {
        mockPrisma.automationExecution.create.mockResolvedValue(mockAutomation);

        const result = await metricsService.createAutomationExecution(mockAutomationInput);

        expect(mockPrisma.automationExecution.create).toHaveBeenCalledWith({
          data: {
            ...mockAutomationInput,
            endTime: null,
            duration: null,
            errorMessage: null,
            errorCode: null,
            retryCount: 0,
            maxRetries: 3,
            nextRetryAt: null,
            metadata: {},
            tags: mockAutomationInput.tags
          }
        });
        expect(result).toEqual(mockAutomation);
      });

      it('should create automation execution with default values', async () => {
        const inputWithoutDefaults = {
          businessEntityId: 'be-123',
          automationType: AutomationType.N8N_WORKFLOW,
          automationName: 'Email Campaign',
          executionId: 'exec-123',
          status: AutomationStatus.RUNNING,
          startTime: new Date('2024-01-01T10:00:00Z'),
          triggerType: TriggerType.SCHEDULED
        };

        const expectedData = {
          ...inputWithoutDefaults,
          endTime: null,
          duration: null,
          triggerData: {},
          inputData: {},
          outputData: {},
          errorMessage: null,
          errorCode: null,
          retryCount: 0,
          maxRetries: 3,
          nextRetryAt: null,
          metadata: {},
          tags: []
        };

        mockPrisma.automationExecution.create.mockResolvedValue(mockAutomation);

        await metricsService.createAutomationExecution(inputWithoutDefaults);

        expect(mockPrisma.automationExecution.create).toHaveBeenCalledWith({
          data: expectedData
        });
      });
    });

    describe('getAutomationExecutions', () => {
      it('should get automation executions with basic query', async () => {
        const query = { businessEntityId: 'be-123' };
        const mockExecutions = [mockAutomation];
        const mockCount = 1;

        mockPrisma.automationExecution.findMany.mockResolvedValue(mockExecutions);
        mockPrisma.automationExecution.count.mockResolvedValue(mockCount);

        const result = await metricsService.getAutomationExecutions(query);

        expect(mockPrisma.automationExecution.findMany).toHaveBeenCalledWith({
          where: { businessEntityId: 'be-123', isArchived: false },
          orderBy: { startTime: 'desc' },
          take: 100,
          skip: 0
        });
        expect(result.executions).toEqual(mockExecutions);
        expect(result.total).toBe(mockCount);
      });
    });

    describe('updateAutomationExecutionStatus', () => {
      it('should update automation execution status successfully', async () => {
        const status = AutomationStatus.COMPLETED;
        const endTime = new Date('2024-01-01T11:00:00Z');
        const duration = 3600000; // 1 hour in milliseconds

        const updatedAutomation = {
          ...mockAutomation,
          status,
          endTime,
          duration,
          updatedAt: new Date()
        };

        mockPrisma.automationExecution.update.mockResolvedValue(updatedAutomation);

        const result = await metricsService.updateAutomationExecutionStatus(
          'auto-123',
          status,
          endTime,
          duration
        );

        expect(mockPrisma.automationExecution.update).toHaveBeenCalledWith({
          where: { id: 'auto-123' },
          data: {
            status,
            endTime,
            duration,
            updatedAt: expect.any(Date)
          }
        });
        expect(result).toEqual(updatedAutomation);
      });
    });
  });

  describe('Data Archival Management', () => {
    const mockArchiveInput = {
      businessEntityId: 'be-123',
      archiveType: ArchiveType.METRICS,
      sourceTable: 'metrics',
      sourceRecordId: 'metric-123',
      archivedData: { id: 'metric-123', value: 1500 },
      archiveDate: new Date('2024-01-01'),
      retentionPolicy: '30_days'
    };

    const mockArchive = {
      id: 'archive-123',
      ...mockArchiveInput,
      compressionRatio: undefined,
      storageLocation: undefined,
      isRestorable: true,
      createdAt: new Date()
    };

    describe('createDataArchive', () => {
      it('should create data archive successfully', async () => {
        mockPrisma.dataArchive.create.mockResolvedValue(mockArchive);

        const result = await metricsService.createDataArchive(mockArchiveInput);

        expect(mockPrisma.dataArchive.create).toHaveBeenCalledWith({
          data: {
            ...mockArchiveInput,
            compressionRatio: null,
            storageLocation: null,
            isRestorable: true
          }
        });
        expect(result).toEqual(mockArchive);
      });

      it('should create data archive with default isRestorable value', async () => {
        const inputWithoutDefaults = {
          businessEntityId: 'be-123',
          archiveType: ArchiveType.METRICS,
          sourceTable: 'metrics',
          sourceRecordId: 'metric-123',
          archivedData: { id: 'metric-123', value: 1500 },
          archiveDate: new Date('2024-01-01'),
          retentionPolicy: '30_days'
        };

        const expectedData = {
          ...inputWithoutDefaults,
          compressionRatio: null,
          storageLocation: null,
          isRestorable: true
        };

        mockPrisma.dataArchive.create.mockResolvedValue(mockArchive);

        await metricsService.createDataArchive(inputWithoutDefaults);

        expect(mockPrisma.dataArchive.create).toHaveBeenCalledWith({
          data: expectedData
        });
      });
    });

    describe('getDataArchives', () => {
      it('should get data archives with basic query', async () => {
        const query = { businessEntityId: 'be-123' };
        const mockArchives = [mockArchive];
        const mockCount = 1;

        mockPrisma.dataArchive.findMany.mockResolvedValue(mockArchives);
        mockPrisma.dataArchive.count.mockResolvedValue(mockCount);

        const result = await metricsService.getDataArchives(query);

        expect(mockPrisma.dataArchive.findMany).toHaveBeenCalledWith({
          where: { businessEntityId: 'be-123' },
          orderBy: { archiveDate: 'desc' },
          take: 100,
          skip: 0
        });
        expect(result.archives).toEqual(mockArchives);
        expect(result.total).toBe(mockCount);
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getMetricsSummary', () => {
      it('should get metrics summary successfully', async () => {
        const businessEntityId = 'be-123';
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        mockPrisma.metric.count.mockResolvedValue(100);
        mockPrisma.automationExecution.count
          .mockResolvedValueOnce(50) // Total automations
          .mockResolvedValueOnce(45); // Successful automations
        mockPrisma.automationExecution.aggregate.mockResolvedValue({
          _avg: { duration: 300000 } // 5 minutes in milliseconds
        });

        const result = await metricsService.getMetricsSummary(businessEntityId, startDate, endDate);

        expect(result.totalMetrics).toBe(100);
        expect(result.totalAutomations).toBe(50);
        expect(result.successRate).toBe(90); // 45/50 * 100
        expect(result.averageExecutionTime).toBe(300000);
      });
    });

    describe('cleanupOldData', () => {
      it('should cleanup old data successfully', async () => {
        const businessEntityId = 'be-123';
        const retentionDays = 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const oldMetrics = [
          { id: 'metric-1', businessEntityId, date: new Date('2024-01-01') },
          { id: 'metric-2', businessEntityId, date: new Date('2024-01-02') }
        ];

        const oldAutomations = [
          { id: 'auto-1', businessEntityId, startTime: new Date('2024-01-01') },
          { id: 'auto-2', businessEntityId, startTime: new Date('2024-01-02') }
        ];

        const oldWebhooks = [
          { id: 'webhook-1', startTime: new Date('2024-01-01') },
          { id: 'webhook-2', startTime: new Date('2024-01-02') }
        ];

        mockPrisma.metric.findMany.mockResolvedValue(oldMetrics);
        mockPrisma.automationExecution.findMany.mockResolvedValue(oldAutomations);
        mockPrisma.n8nWebhookEvent.findMany.mockResolvedValue(oldWebhooks);
        mockPrisma.metric.update.mockResolvedValue({});
        mockPrisma.automationExecution.update.mockResolvedValue({});
        mockPrisma.dataArchive.create.mockResolvedValue({});

        const result = await metricsService.cleanupOldData(businessEntityId, retentionDays);

        expect(result.archivedMetrics).toBe(2);
        expect(result.archivedAutomations).toBe(2);
        expect(result.archivedWebhooks).toBe(2);

        // Verify metrics were archived
        expect(mockPrisma.metric.update).toHaveBeenCalledTimes(2);
        expect(mockPrisma.automationExecution.update).toHaveBeenCalledTimes(2);
        expect(mockPrisma.dataArchive.create).toHaveBeenCalledTimes(6); // 2 metrics + 2 automations + 2 webhooks
      });
    });
  });
});
