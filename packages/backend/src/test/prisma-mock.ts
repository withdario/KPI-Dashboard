import { PrismaClient } from '@prisma/client';

// Mock Prisma client for testing
export const createMockPrismaClient = () => {
  const mockPrisma = {
    n8nWebhookEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      deleteMany: jest.fn(),
    },
    n8nIntegration: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    googleAnalyticsIntegration: {
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    businessEntity: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  } as unknown as PrismaClient;

  return mockPrisma;
};

// Default mock implementations
export const setupDefaultMocks = (mockPrisma: any) => {
  // Mock n8nWebhookEvent.create
  mockPrisma.n8nWebhookEvent.create.mockResolvedValue({
    id: 'test-event-id',
    n8nIntegrationId: 'test-integration-id',
    workflowId: 'test-workflow-id',
    workflowName: 'Test Workflow',
    executionId: 'test-execution-id',
    eventType: 'workflow_completed',
    status: 'completed',
    startTime: new Date(),
    endTime: new Date(),
    duration: 1000,
    inputData: {},
    outputData: {},
    errorMessage: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Mock n8nIntegration.findUnique
  mockPrisma.n8nIntegration.findUnique.mockResolvedValue({
    id: 'test-integration-id',
    businessEntityId: 'test-business-entity-id',
    webhookUrl: 'https://test.com/webhook',
    webhookToken: 'test-token',
    isActive: true,
    lastWebhookAt: new Date(),
    webhookCount: 1,
    lastErrorAt: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    businessEntity: {
      id: 'test-business-entity-id',
      name: 'Test Business',
      description: 'Test Description',
      domain: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    webhookEvents: [],
  });

  // Mock n8nIntegration.findFirst
  mockPrisma.n8nIntegration.findFirst.mockResolvedValue({
    id: 'test-integration-id',
    businessEntityId: 'test-business-entity-id',
    webhookUrl: 'https://test.com/webhook',
    webhookToken: 'test-token',
    isActive: true,
    lastWebhookAt: new Date(),
    webhookCount: 1,
    lastErrorAt: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    businessEntity: {
      id: 'test-business-entity-id',
      name: 'Test Business',
      description: 'Test Description',
      domain: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    webhookEvents: [],
  });

  // Mock n8nIntegration.create
  mockPrisma.n8nIntegration.create.mockResolvedValue({
    id: 'new-integration-id',
    businessEntityId: 'test-business-entity-id',
    webhookUrl: 'https://test.com/webhook',
    webhookToken: 'new-token',
    isActive: true,
    lastWebhookAt: null,
    webhookCount: 0,
    lastErrorAt: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    businessEntity: {
      id: 'test-business-entity-id',
      name: 'Test Business',
      description: 'Test Description',
      domain: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Mock n8nIntegration.update
  mockPrisma.n8nIntegration.update.mockResolvedValue({
    id: 'test-integration-id',
    businessEntityId: 'test-business-entity-id',
    webhookUrl: 'https://updated.com/webhook',
    webhookToken: 'updated-token',
    isActive: true,
    lastWebhookAt: new Date(),
    webhookCount: 2,
    lastErrorAt: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    businessEntity: {
      id: 'test-business-entity-id',
      name: 'Test Business',
      description: 'Test Description',
      domain: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Mock n8nWebhookEvent.findMany
  mockPrisma.n8nWebhookEvent.findMany.mockResolvedValue([
    {
      id: 'event-1',
      n8nIntegrationId: 'test-integration-id',
      workflowId: 'workflow-1',
      workflowName: 'Test Workflow 1',
      executionId: 'exec-1',
      eventType: 'workflow_completed',
      status: 'completed',
      startTime: new Date('2025-01-01T10:00:00Z'),
      endTime: new Date('2025-01-01T10:01:00Z'),
      duration: 60000,
      inputData: {},
      outputData: {},
      errorMessage: null,
      metadata: {},
      createdAt: new Date('2025-01-01T10:01:00Z'),
      updatedAt: new Date('2025-01-01T10:01:00Z'),
    },
    {
      id: 'event-2',
      n8nIntegrationId: 'test-integration-id',
      workflowId: 'workflow-2',
      workflowName: 'Test Workflow 2',
      executionId: 'exec-2',
      eventType: 'workflow_completed',
      status: 'completed',
      startTime: new Date('2025-01-01T11:00:00Z'),
      endTime: new Date('2025-01-01T11:00:30Z'),
      duration: 30000,
      inputData: {},
      outputData: {},
      errorMessage: null,
      metadata: {},
      createdAt: new Date('2025-01-01T11:00:30Z'),
      updatedAt: new Date('2025-01-01T11:00:30Z'),
    },
  ]);

  // Mock n8nWebhookEvent.groupBy
  mockPrisma.n8nWebhookEvent.groupBy.mockResolvedValue([
    {
      status: 'completed',
      _count: { status: 2 },
    },
  ]);

  // Mock deleteMany operations
  mockPrisma.n8nWebhookEvent.deleteMany.mockResolvedValue({ count: 0 });
  mockPrisma.n8nIntegration.deleteMany.mockResolvedValue({ count: 0 });
  mockPrisma.googleAnalyticsIntegration.deleteMany.mockResolvedValue({ count: 0 });
  mockPrisma.user.deleteMany.mockResolvedValue({ count: 0 });
  mockPrisma.businessEntity.deleteMany.mockResolvedValue({ count: 0 });

  // Mock user operations
  mockPrisma.user.findUnique.mockResolvedValue(null);
  mockPrisma.user.findFirst.mockResolvedValue(null);
  mockPrisma.user.findMany.mockResolvedValue([]);
  mockPrisma.user.create.mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: false,
    businessEntityId: 'test-business-entity-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mockPrisma.user.update.mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Updated',
    lastName: 'User',
    emailVerified: true,
    businessEntityId: 'test-business-entity-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mockPrisma.user.count.mockResolvedValue(1);

  // Mock businessEntity operations
  mockPrisma.businessEntity.findUnique.mockResolvedValue({
    id: 'test-business-entity-id',
    name: 'Test Business',
    description: 'Test Description',
    domain: 'test.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mockPrisma.businessEntity.findFirst.mockResolvedValue({
    id: 'test-business-entity-id',
    name: 'Test Business',
    description: 'Test Description',
    domain: 'test.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mockPrisma.businessEntity.findMany.mockResolvedValue([
    {
      id: 'test-business-entity-id',
      name: 'Test Business',
      description: 'Test Description',
      domain: 'test.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  mockPrisma.businessEntity.create.mockResolvedValue({
    id: 'new-business-entity-id',
    name: 'New Business',
    description: 'New Description',
    domain: 'new.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mockPrisma.businessEntity.update.mockResolvedValue({
    id: 'test-business-entity-id',
    name: 'Updated Business',
    description: 'Updated Description',
    domain: 'updated.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mockPrisma.businessEntity.count.mockResolvedValue(1);
};
