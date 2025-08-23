// Mock Prisma client before importing the service
const mockPrismaClient = {
  businessEntity: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  userAuditLog: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

import { BusinessEntityService } from '../services/businessEntityService';

describe('BusinessEntityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBusinessEntity', () => {
    it('should create a business entity successfully', async () => {
      const mockData = {
        name: 'Test Company',
        description: 'A test company',
        domain: 'test.com',
      };

      const mockCreatedEntity = {
        id: 'test-id',
        ...mockData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.businessEntity.create.mockResolvedValue(mockCreatedEntity);
      mockPrismaClient.userAuditLog.create.mockResolvedValue({});

      const result = await BusinessEntityService.createBusinessEntity(mockData, 'user-id');

      expect(result).toEqual(mockCreatedEntity);
      expect(mockPrismaClient.businessEntity.create).toHaveBeenCalledWith({
        data: {
          ...mockData,
          description: mockData.description,
          domain: mockData.domain,
          isActive: true,
        },
      });
    });

    it('should throw error when creation fails', async () => {
      const mockData = {
        name: 'Test Company',
        description: 'A test company',
        domain: 'test.com',
      };

      mockPrismaClient.businessEntity.create.mockRejectedValue(new Error('Database error'));

      await expect(
        BusinessEntityService.createBusinessEntity(mockData, 'user-id')
      ).rejects.toThrow('Failed to create business entity: Database error');
    });
  });

  describe('getBusinessEntityById', () => {
    it('should return business entity when found', async () => {
      const mockEntity = {
        id: 'test-id',
        name: 'Test Company',
        description: 'A test company',
        domain: 'test.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
      };

      mockPrismaClient.businessEntity.findUnique.mockResolvedValue(mockEntity);

      const result = await BusinessEntityService.getBusinessEntityById('test-id');

      expect(result).toEqual(mockEntity);
      expect(mockPrismaClient.businessEntity.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it('should throw error when business entity not found', async () => {
      mockPrismaClient.businessEntity.findUnique.mockResolvedValue(null);

      await expect(
        BusinessEntityService.getBusinessEntityById('non-existent-id')
      ).rejects.toThrow('Failed to get business entity: Business entity not found');
    });
  });

  describe('getAllBusinessEntities', () => {
    it('should return all active business entities by default', async () => {
      const mockEntities = [
        {
          id: 'test-id-1',
          name: 'Test Company 1',
          isActive: true,
          _count: { users: 5 },
        },
        {
          id: 'test-id-2',
          name: 'Test Company 2',
          isActive: true,
          _count: { users: 3 },
        },
      ];

      mockPrismaClient.businessEntity.findMany.mockResolvedValue(mockEntities);

      const result = await BusinessEntityService.getAllBusinessEntities();

      expect(result).toEqual(mockEntities);
      expect(mockPrismaClient.businessEntity.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should return all entities when includeInactive is true', async () => {
      const mockEntities = [
        {
          id: 'test-id-1',
          name: 'Test Company 1',
          isActive: true,
          _count: { users: 5 },
        },
        {
          id: 'test-id-2',
          name: 'Test Company 2',
          isActive: false,
          _count: { users: 0 },
        },
      ];

      mockPrismaClient.businessEntity.findMany.mockResolvedValue(mockEntities);

      const result = await BusinessEntityService.getAllBusinessEntities(true);

      expect(result).toEqual(mockEntities);
      expect(mockPrismaClient.businessEntity.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });
  });
});
