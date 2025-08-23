import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BusinessEntityData {
  name: string;
  description?: string;
  domain?: string;
}

interface BusinessEntityResponse {
  success: boolean;
  message: string;
  businessEntity?: any;
  businessEntities?: any[];
}

export class BusinessEntityService {
  async createBusinessEntity(data: BusinessEntityData): Promise<BusinessEntityResponse> {
    try {
      // Check if domain already exists
      if (data.domain) {
        const existingEntity = await prisma.businessEntity.findUnique({
          where: { domain: data.domain }
        });

        if (existingEntity) {
          return {
            success: false,
            message: 'Business entity with this domain already exists'
          };
        }
      }

      const businessEntity = await prisma.businessEntity.create({
        data: {
          name: data.name,
          description: data.description || null,
          domain: data.domain || null
        }
      });

      return {
        success: true,
        message: 'Business entity created successfully',
        businessEntity
      };
    } catch (error) {
      console.error('Create business entity error:', error);
      return {
        success: false,
        message: 'Failed to create business entity'
      };
    }
  }

  async getBusinessEntity(id: string): Promise<BusinessEntityResponse> {
    try {
      const businessEntity = await prisma.businessEntity.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              emailVerified: true,
              createdAt: true
            }
          },
          googleAnalytics: true,
          n8nIntegrations: true
        }
      });

      if (!businessEntity) {
        return {
          success: false,
          message: 'Business entity not found'
        };
      }

      return {
        success: true,
        message: 'Business entity retrieved successfully',
        businessEntity
      };
    } catch (error) {
      console.error('Get business entity error:', error);
      return {
        success: false,
        message: 'Failed to retrieve business entity'
      };
    }
  }

  async getAllBusinessEntities(): Promise<BusinessEntityResponse> {
    try {
      const businessEntities = await prisma.businessEntity.findMany({
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              emailVerified: true,
              createdAt: true
            }
          },
          googleAnalytics: true,
          n8nIntegrations: true
        }
      });

      return {
        success: true,
        message: 'Business entities retrieved successfully',
        businessEntities
      };
    } catch (error) {
      console.error('Get all business entities error:', error);
      return {
        success: false,
        message: 'Failed to retrieve business entities'
      };
    }
  }

  async updateBusinessEntity(id: string, data: Partial<BusinessEntityData>): Promise<BusinessEntityResponse> {
    try {
      // Check if domain already exists (if updating domain)
      if (data.domain) {
        const existingEntity = await prisma.businessEntity.findFirst({
          where: {
            domain: data.domain,
            id: { not: id }
          }
        });

        if (existingEntity) {
          return {
            success: false,
            message: 'Business entity with this domain already exists'
          };
        }
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.domain !== undefined) updateData.domain = data.domain || null;

      const businessEntity = await prisma.businessEntity.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        message: 'Business entity updated successfully',
        businessEntity
      };
    } catch (error) {
      console.error('Update business entity error:', error);
      return {
        success: false,
        message: 'Failed to update business entity'
      };
    }
  }

  async deleteBusinessEntity(id: string): Promise<BusinessEntityResponse> {
    try {
      // Check if business entity has users
      const users = await prisma.user.findMany({
        where: { businessEntityId: id }
      });

      if (users.length > 0) {
        return {
          success: false,
          message: 'Cannot delete business entity with active users'
        };
      }

      // Check if business entity has integrations
      const integrations = await prisma.googleAnalyticsIntegration.findMany({
        where: { businessEntityId: id }
      });

      const n8nIntegrations = await prisma.n8nIntegration.findMany({
        where: { businessEntityId: id }
      });

      if (integrations.length > 0 || n8nIntegrations.length > 0) {
        return {
          success: false,
          message: 'Cannot delete business entity with active integrations'
        };
      }

      await prisma.businessEntity.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Business entity deleted successfully'
      };
    } catch (error) {
      console.error('Delete business entity error:', error);
      return {
        success: false,
        message: 'Failed to delete business entity'
      };
    }
  }

  async deactivateBusinessEntity(id: string): Promise<BusinessEntityResponse> {
    try {
      const businessEntity = await prisma.businessEntity.update({
        where: { id },
        data: { isActive: false }
      });

      // Deactivate all users in this business entity
      await prisma.user.updateMany({
        where: { businessEntityId: id },
        data: { isActive: false }
      });

      return {
        success: true,
        message: 'Business entity deactivated successfully',
        businessEntity
      };
    } catch (error) {
      console.error('Deactivate business entity error:', error);
      return {
        success: false,
        message: 'Failed to deactivate business entity'
      };
    }
  }

  async activateBusinessEntity(id: string): Promise<BusinessEntityResponse> {
    try {
      const businessEntity = await prisma.businessEntity.update({
        where: { id },
        data: { isActive: true }
      });

      return {
        success: true,
        message: 'Business entity activated successfully',
        businessEntity
      };
    } catch (error) {
      console.error('Activate business entity error:', error);
      return {
        success: false,
        message: 'Failed to activate business entity'
      };
    }
  }

  async getBusinessEntityStats(id: string): Promise<BusinessEntityResponse> {
    try {
      const [userCount, activeUserCount, googleAnalyticsCount, n8nIntegrationCount] = await Promise.all([
        prisma.user.count({ where: { businessEntityId: id } }),
        prisma.user.count({ where: { businessEntityId: id, isActive: true } }),
        prisma.googleAnalyticsIntegration.count({ where: { businessEntityId: id, isActive: true } }),
        prisma.n8nIntegration.count({ where: { businessEntityId: id, isActive: true } })
      ]);

      const stats = {
        totalUsers: userCount,
        activeUsers: activeUserCount,
        googleAnalyticsIntegrations: googleAnalyticsCount,
        n8nIntegrations: n8nIntegrationCount
      };

      return {
        success: true,
        message: 'Business entity stats retrieved successfully',
        businessEntity: { id, ...stats }
      };
    } catch (error) {
      console.error('Get business entity stats error:', error);
      return {
        success: false,
        message: 'Failed to retrieve business entity stats'
      };
    }
  }
}
