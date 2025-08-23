import { N8nService } from '../services/n8nService';
import { N8nWebhookPayload, N8nEventType, N8nWorkflowStatus } from '../types/n8n';

// Mock the entire Prisma module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    n8nWebhookEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn()
    },
    n8nIntegration: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }))
}));

// Import the mocked PrismaClient
import { PrismaClient } from '@prisma/client';

describe('N8nService', () => {
  let n8nService: N8nService;
  let mockPrisma: any;
  
  beforeEach(() => {
    // Get the mock instance
    mockPrisma = new PrismaClient();
    n8nService = new N8nService();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up default mock return values
    mockPrisma.n8nWebhookEvent.create.mockResolvedValue({
      id: 'event-789',
      n8nIntegrationId: 'integration-123',
      workflowId: 'workflow-123',
      workflowName: 'Test Workflow',
      executionId: 'exec-456',
      eventType: 'workflow_completed',
      status: 'completed',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:05:00Z'),
      duration: 300000,
      inputData: {},
      outputData: {},
      errorMessage: null,
      metadata: {},
      createdAt: new Date()
    });
    
    mockPrisma.n8nWebhookEvent.groupBy.mockResolvedValue([{
      _count: { id: 1 },
      _max: { createdAt: new Date() }
    }]);
    
    mockPrisma.n8nIntegration.update.mockResolvedValue({});
    
    mockPrisma.n8nIntegration.findUnique.mockResolvedValue({
      id: 'integration-123',
      businessEntityId: 'business-123',
      webhookUrl: 'https://n8n.example.com/webhook',
      webhookToken: 'secret-token',
      isActive: true,
      lastWebhookAt: null,
      webhookCount: 0,
      lastErrorAt: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    mockPrisma.n8nIntegration.findFirst.mockResolvedValue({
      id: 'integration-123',
      businessEntityId: 'business-123',
      webhookUrl: 'https://n8n.example.com/webhook',
      webhookToken: 'secret-token',
      isActive: true,
      lastWebhookAt: null,
      webhookCount: 0,
      lastErrorAt: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    mockPrisma.n8nIntegration.create.mockResolvedValue({
      id: 'integration-123',
      businessEntityId: 'business-123',
      webhookUrl: 'https://n8n.example.com/webhook',
      webhookToken: 'secret-token',
      isActive: true,
      lastWebhookAt: null,
      webhookCount: 0,
      lastErrorAt: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    mockPrisma.n8nIntegration.update.mockResolvedValue({
      id: 'integration-123',
      businessEntityId: 'business-123',
      webhookUrl: 'https://new-n8n.example.com/webhook',
      webhookToken: 'secret-token',
      isActive: false,
      lastWebhookAt: null,
      webhookCount: 0,
      lastErrorAt: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    mockPrisma.n8nWebhookEvent.findMany.mockResolvedValue([
      {
        id: 'event-1',
        status: 'completed',
        duration: 100000,
        createdAt: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: 'event-2',
        status: 'completed',
        duration: 200000,
        createdAt: new Date('2024-01-01T11:00:00Z')
      },
      {
        id: 'event-3',
        status: 'failed',
        duration: null,
        createdAt: new Date('2024-01-01T12:00:00Z')
      }
    ]);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('validateWebhookPayload', () => {
    it('should validate a valid webhook payload', async () => {
      const validPayload: N8nWebhookPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:05:00Z',
        duration: 300000,
        inputData: { key: 'value' },
        outputData: { result: 'success' }
      };
      
      const result = await n8nService.validateWebhookPayload(validPayload);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.payload).toEqual(validPayload);
    });
    
    it('should reject payload with missing required fields', async () => {
      const invalidPayload = {
        workflowId: 'workflow-123',
        // Missing workflowName, executionId, eventType, status, startTime
        duration: 300000
      };
      
      const result = await n8nService.validateWebhookPayload(invalidPayload);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('workflowName is required');
      expect(result.errors).toContain('executionId is required');
      expect(result.errors).toContain('eventType is required');
      expect(result.errors).toContain('status is required');
      expect(result.errors).toContain('startTime is required');
    });
    
    it('should reject payload with invalid event type', async () => {
      const invalidPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'invalid_event_type',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z'
      };
      
      const result = await n8nService.validateWebhookPayload(invalidPayload);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid eventType: invalid_event_type');
    });
    
    it('should reject payload with invalid status', async () => {
      const invalidPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'invalid_status',
        startTime: '2024-01-01T10:00:00Z'
      };
      
      const result = await n8nService.validateWebhookPayload(invalidPayload);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid status: invalid_status');
    });
    
    it('should reject payload with invalid date format', async () => {
      const invalidPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: 'invalid-date',
        endTime: '2024-01-01T10:05:00Z'
      };
      
      const result = await n8nService.validateWebhookPayload(invalidPayload);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid startTime format');
    });
    
    it('should reject payload with invalid duration type', async () => {
      const invalidPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z',
        duration: '300000' // String instead of number
      };
      
      const result = await n8nService.validateWebhookPayload(invalidPayload);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('duration must be a number');
    });
    
    it('should provide warnings for missing optional fields', async () => {
      const minimalPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z'
        // Missing inputData and outputData
      };
      
      const result = await n8nService.validateWebhookPayload(minimalPayload);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('inputData is missing (optional but recommended)');
      expect(result.warnings).toContain('outputData is missing (optional but recommended)');
    });
  });
  
  describe('processWebhookEvent', () => {
    it('should successfully process a valid webhook event', async () => {
      const payload: N8nWebhookPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:05:00Z',
        duration: 300000
      };
      
      const mockEvent = {
        id: 'event-789',
        n8nIntegrationId: 'integration-123',
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed' as N8nEventType,
        status: 'completed' as N8nWorkflowStatus,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:05:00Z'),
        duration: 300000,
        inputData: {},
        outputData: {},
        errorMessage: undefined,
        metadata: {}
      };
      
      mockPrisma.n8nWebhookEvent.create.mockResolvedValue(mockEvent);
      mockPrisma.n8nWebhookEvent.groupBy.mockResolvedValue([{
        _count: { id: 1 },
        _max: { createdAt: new Date() }
      }]);
      mockPrisma.n8nIntegration.update.mockResolvedValue({} as any);
      
      // Mock calculateMetrics method
      jest.spyOn(n8nService as any, 'calculateMetrics').mockResolvedValue({
        totalWorkflows: 1,
        successfulWorkflows: 1,
        failedWorkflows: 0,
        averageExecutionTime: 300000,
        totalTimeSaved: 300000,
        successRate: 100
      });
      
      const result = await n8nService.processWebhookEvent('integration-123', payload);
      
      expect(result.success).toBe(true);
      expect(result.eventId).toBe('event-789');
      expect(mockPrisma.n8nWebhookEvent.create).toHaveBeenCalledWith({
        data: {
          n8nIntegrationId: 'integration-123',
          workflowId: 'workflow-123',
          workflowName: 'Test Workflow',
          executionId: 'exec-456',
          eventType: 'workflow_completed',
          status: 'completed',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T10:05:00Z'),
          duration: 300000,
          inputData: {},
          outputData: {},
          errorMessage: undefined,
          metadata: {}
        }
      });
    });
    
    it('should calculate duration when not provided', async () => {
      const payload: N8nWebhookPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:05:00Z'
        // duration not provided
      };
      
      const mockEvent = {
        id: 'event-789',
        n8nIntegrationId: 'integration-123',
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed' as N8nEventType,
        status: 'completed' as N8nWorkflowStatus,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:05:00Z'),
        duration: 300000,
        inputData: {},
        outputData: {},
        errorMessage: null,
        metadata: {},
        createdAt: new Date()
      };
      
      mockPrisma.n8nWebhookEvent.create.mockResolvedValue(mockEvent);
      mockPrisma.n8nWebhookEvent.groupBy.mockResolvedValue([{
        _count: { id: 1 },
        _max: { createdAt: new Date() }
      }]);
      mockPrisma.n8nIntegration.update.mockResolvedValue({} as any);
      
      jest.spyOn(n8nService as any, 'calculateMetrics').mockResolvedValue({
        totalWorkflows: 1,
        successfulWorkflows: 1,
        failedWorkflows: 0,
        averageExecutionTime: 300000,
        totalTimeSaved: 300000,
        successRate: 100
      });
      
      const result = await n8nService.processWebhookEvent('integration-123', payload);
      
      expect(result.success).toBe(true);
      expect(mockPrisma.n8nWebhookEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          duration: 300000 // Calculated duration
        })
      });
    });
    
    it('should handle database errors gracefully', async () => {
      const payload: N8nWebhookPayload = {
        workflowId: 'workflow-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-456',
        eventType: 'workflow_completed',
        status: 'completed',
        startTime: '2024-01-01T10:00:00Z'
      };
      
      mockPrisma.n8nWebhookEvent.create.mockRejectedValue(new Error('Database connection failed'));
      
      const result = await n8nService.processWebhookEvent('integration-123', payload);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Database connection failed');
    });
  });
  
  describe('calculateMetrics', () => {
    it('should calculate metrics correctly for multiple events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          status: 'completed' as N8nWorkflowStatus,
          duration: 100000,
          createdAt: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: 'event-2',
          status: 'completed' as N8nWorkflowStatus,
          duration: 200000,
          createdAt: new Date('2024-01-01T11:00:00Z')
        },
        {
          id: 'event-3',
          status: 'failed' as N8nWorkflowStatus,
          duration: null,
          createdAt: new Date('2024-01-01T12:00:00Z')
        }
      ];
      
      mockPrisma.n8nWebhookEvent.findMany.mockResolvedValue(mockEvents as any);
      
      const metrics = await n8nService.calculateMetrics('integration-123');
      
      expect(metrics.totalWorkflows).toBe(3);
      expect(metrics.successfulWorkflows).toBe(2);
      expect(metrics.failedWorkflows).toBe(1);
      expect(metrics.averageExecutionTime).toBe(150000); // (100000 + 200000) / 2
      expect(metrics.totalTimeSaved).toBe(300000); // 100000 + 200000
      expect(metrics.successRate).toBe(66.66666666666667); // (2/3) * 100
      expect(metrics.lastExecutionAt).toEqual(new Date('2024-01-01T12:00:00Z'));
    });
    
    it('should return zero metrics for empty event list', async () => {
      mockPrisma.n8nWebhookEvent.findMany.mockResolvedValue([]);
      
      const metrics = await n8nService.calculateMetrics('integration-123');
      
      expect(metrics.totalWorkflows).toBe(0);
      expect(metrics.successfulWorkflows).toBe(0);
      expect(metrics.failedWorkflows).toBe(0);
      expect(metrics.averageExecutionTime).toBe(0);
      expect(metrics.totalTimeSaved).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.lastExecutionAt).toBeUndefined();
    });
    
    it('should handle database errors', async () => {
      mockPrisma.n8nWebhookEvent.findMany.mockRejectedValue(new Error('Database error'));
      
      await expect(n8nService.calculateMetrics('integration-123')).rejects.toThrow('Database error');
    });
  });
  
  describe('integration management', () => {
    it('should create integration successfully', async () => {
      const integrationData = {
        businessEntityId: 'business-123',
        webhookUrl: 'https://n8n.example.com/webhook',
        webhookToken: 'secret-token'
      };
      
      const mockIntegration = {
        id: 'integration-123',
        ...integrationData,
        isActive: true,
        lastWebhookAt: null,
        webhookCount: 0,
        lastErrorAt: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.n8nIntegration.create.mockResolvedValue(mockIntegration as any);
      
      const result = await n8nService.createIntegration(integrationData);
      
      expect(result).toEqual(mockIntegration);
      expect(mockPrisma.n8nIntegration.create).toHaveBeenCalledWith({
        data: {
          ...integrationData,
          isActive: true
        }
      });
    });
    
    it('should get integration by business entity ID', async () => {
      const mockIntegration = {
        id: 'integration-123',
        businessEntityId: 'business-123',
        webhookUrl: 'https://n8n.example.com/webhook',
        webhookToken: 'secret-token',
        isActive: true,
        lastWebhookAt: null,
        webhookCount: 0,
        lastErrorAt: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.n8nIntegration.findFirst.mockResolvedValue(mockIntegration as any);
      
      const result = await n8nService.getIntegrationByBusinessEntity('business-123');
      
      expect(result).toEqual(mockIntegration);
      expect(mockPrisma.n8nIntegration.findFirst).toHaveBeenCalledWith({
        where: {
          businessEntityId: 'business-123',
          isActive: true
        }
      });
    });
    
    it('should update integration successfully', async () => {
      const updateData = {
        webhookUrl: 'https://new-n8n.example.com/webhook',
        isActive: false
      };
      
      const mockIntegration = {
        id: 'integration-123',
        businessEntityId: 'business-123',
        webhookUrl: 'https://new-n8n.example.com/webhook',
        webhookToken: 'secret-token',
        isActive: false,
        lastWebhookAt: null,
        webhookCount: 0,
        lastErrorAt: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.n8nIntegration.update.mockResolvedValue(mockIntegration as any);
      
      const result = await n8nService.updateIntegration('integration-123', updateData);
      
      expect(result).toEqual(mockIntegration);
      expect(mockPrisma.n8nIntegration.update).toHaveBeenCalledWith({
        where: { id: 'integration-123' },
        data: {
          ...updateData,
          updatedAt: expect.any(Date)
        }
      });
    });
  });
});
