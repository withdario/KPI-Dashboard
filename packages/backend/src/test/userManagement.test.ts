// Mock bcryptjs before importing the service
const mockBcrypt = {
  hash: jest.fn(),
};

jest.mock('bcryptjs', () => mockBcrypt);

// Mock Prisma client before importing the service
const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  userAuditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
}));

import { UserManagementService } from '../services/userManagementService';

describe('UserManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set default environment variable
    process.env.BCRYPT_SALT_ROUNDS = '12';
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER' as const,
        businessEntityId: 'business-id',
      };

      const mockCreatedUser = {
        id: 'user-id',
        email: mockData.email,
        firstName: mockData.firstName,
        lastName: mockData.lastName,
        role: mockData.role,
        isActive: true,
        businessEntityId: mockData.businessEntityId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.create.mockResolvedValue(mockCreatedUser);
      mockPrismaClient.userAuditLog.create.mockResolvedValue({});
      
      mockBcrypt.hash.mockResolvedValue('hashed-password');

      const result = await UserManagementService.createUser(mockData, 'admin-id');

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: mockData.email,
          password: 'hashed-password',
          firstName: mockData.firstName,
          lastName: mockData.lastName,
          role: mockData.role,
          businessEntityId: mockData.businessEntityId,
          createdBy: 'admin-id',
          updatedBy: 'admin-id',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          businessEntityId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw error when user already exists', async () => {
      const mockData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        UserManagementService.createUser(mockData, 'admin-id')
      ).rejects.toThrow('Failed to create user: User with this email already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        isActive: true,
        businessEntityId: 'business-id',
        isEmailVerified: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        businessEntity: {
          id: 'business-id',
          name: 'Test Company',
          domain: 'test.com',
        },
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserManagementService.getUserById('user-id');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          businessEntityId: true,
          isEmailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          businessEntity: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
      });
    });

    it('should throw error when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(
        UserManagementService.getUserById('non-existent-id')
      ).rejects.toThrow('Failed to get user: User not found');
    });
  });

  describe('getAllUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          role: 'USER',
          isActive: true,
          businessEntityId: 'business-id',
          lastLogin: new Date(),
          createdAt: new Date(),
          businessEntity: {
            id: 'business-id',
            name: 'Test Company',
            domain: 'test.com',
          },
        },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaClient.user.count.mockResolvedValue(1);

      const result = await UserManagementService.getAllUsers({
        page: 1,
        limit: 10,
      });

      expect(result.users).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      });
    });

    it('should filter by business entity ID', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);
      mockPrismaClient.user.count.mockResolvedValue(0);

      await UserManagementService.getAllUsers({
        businessEntityId: 'business-id',
      });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { businessEntityId: 'business-id', isActive: true },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id: 'user-id',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        businessEntityId: 'old-business-id',
        isActive: true,
      };

      const updateData = {
        firstName: 'Jane',
        role: 'ADMIN' as const,
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique
        .mockResolvedValueOnce(existingUser) // First call for existing user
        .mockResolvedValueOnce(updatedUser); // Second call for updated user
      mockPrismaClient.user.update.mockResolvedValue(updatedUser);
      mockPrismaClient.userAuditLog.create.mockResolvedValue({});

      const result = await UserManagementService.updateUser('user-id', updateData, 'admin-id');

      expect(result).toEqual(updatedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          ...updateData,
          updatedBy: 'admin-id',
          updatedAt: expect.any(Date),
        },
        select: expect.any(Object),
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      mockPrismaClient.user.update.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        isActive: false,
        updatedAt: new Date(),
      });
      mockPrismaClient.userAuditLog.create.mockResolvedValue({});

      const result = await UserManagementService.deactivateUser('user-id', 'admin-id');

      expect(result.isActive).toBe(false);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          isActive: false,
          updatedBy: 'admin-id',
          updatedAt: expect.any(Date),
        },
        select: expect.any(Object),
      });
    });
  });
});
