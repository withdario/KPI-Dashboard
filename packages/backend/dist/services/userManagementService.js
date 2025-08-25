"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UserManagementService {
    async createUser(data) {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists'
                };
            }
            // Hash password
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(data.password, 12);
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    businessEntityId: data.businessEntityId
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true
                }
            });
            return {
                success: true,
                message: 'User created successfully',
                user
            };
        }
        catch (error) {
            console.error('Create user error:', error);
            return {
                success: false,
                message: 'Failed to create user'
            };
        }
    }
    async getUser(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            return {
                success: true,
                message: 'User retrieved successfully',
                user
            };
        }
        catch (error) {
            console.error('Get user error:', error);
            return {
                success: false,
                message: 'Failed to retrieve user'
            };
        }
    }
    async getAllUsers(businessEntityId) {
        try {
            const where = businessEntityId ? { businessEntityId } : {};
            const users = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return {
                success: true,
                message: 'Users retrieved successfully',
                users
            };
        }
        catch (error) {
            console.error('Get all users error:', error);
            return {
                success: false,
                message: 'Failed to retrieve users'
            };
        }
    }
    async updateUser(id, data) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });
            if (!existingUser) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            // Check if email already exists (if updating email)
            if (data.email && data.email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email: data.email }
                });
                if (emailExists) {
                    return {
                        success: false,
                        message: 'Email already exists'
                    };
                }
            }
            const updateData = {};
            if (data.firstName !== undefined)
                updateData.firstName = data.firstName;
            if (data.lastName !== undefined)
                updateData.lastName = data.lastName;
            if (data.email !== undefined)
                updateData.email = data.email;
            if (data.isActive !== undefined)
                updateData.isActive = data.isActive;
            const user = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                }
            });
            return {
                success: true,
                message: 'User updated successfully',
                user
            };
        }
        catch (error) {
            console.error('Update user error:', error);
            return {
                success: false,
                message: 'Failed to update user'
            };
        }
    }
    async deleteUser(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            await prisma.user.delete({
                where: { id }
            });
            return {
                success: true,
                message: 'User deleted successfully'
            };
        }
        catch (error) {
            console.error('Delete user error:', error);
            return {
                success: false,
                message: 'Failed to delete user'
            };
        }
    }
    async deactivateUser(id) {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: { isActive: false },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                }
            });
            return {
                success: true,
                message: 'User deactivated successfully',
                user
            };
        }
        catch (error) {
            console.error('Deactivate user error:', error);
            return {
                success: false,
                message: 'Failed to deactivate user'
            };
        }
    }
    async reactivateUser(id) {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                }
            });
            return {
                success: true,
                message: 'User reactivated successfully',
                user
            };
        }
        catch (error) {
            console.error('Reactivate user error:', error);
            return {
                success: false,
                message: 'Failed to reactivate user'
            };
        }
    }
    async changePassword(id, newPassword) {
        try {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            const user = await prisma.user.update({
                where: { id },
                data: { password: hashedPassword },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                }
            });
            return {
                success: true,
                message: 'Password changed successfully',
                user
            };
        }
        catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                message: 'Failed to change password'
            };
        }
    }
    async getUserStats(businessEntityId) {
        try {
            const where = businessEntityId ? { businessEntityId } : {};
            const [totalUsers, activeUsers, verifiedUsers] = await Promise.all([
                prisma.user.count({ where }),
                prisma.user.count({ where: { ...where, isActive: true } }),
                prisma.user.count({ where: { ...where, emailVerified: true } })
            ]);
            const stats = {
                totalUsers,
                activeUsers,
                verifiedUsers,
                inactiveUsers: totalUsers - activeUsers,
                unverifiedUsers: totalUsers - verifiedUsers
            };
            return {
                success: true,
                message: 'User stats retrieved successfully',
                user: stats
            };
        }
        catch (error) {
            console.error('Get user stats error:', error);
            return {
                success: false,
                message: 'Failed to retrieve user stats'
            };
        }
    }
    async searchUsers(query, businessEntityId) {
        try {
            const where = {
                ...(businessEntityId && { businessEntityId }),
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } }
                ]
            };
            const users = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    emailVerified: true,
                    businessEntityId: true,
                    createdAt: true,
                    lastLoginAt: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return {
                success: true,
                message: 'Users search completed successfully',
                users
            };
        }
        catch (error) {
            console.error('Search users error:', error);
            return {
                success: false,
                message: 'Failed to search users'
            };
        }
    }
}
exports.UserManagementService = UserManagementService;
//# sourceMappingURL=userManagementService.js.map