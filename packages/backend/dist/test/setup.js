"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestDatabase = setupTestDatabase;
exports.teardownTestDatabase = teardownTestDatabase;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function setupTestDatabase() {
    try {
        console.log('🧹 Setting up test database...');
        await prisma.n8nWebhookEvent.deleteMany();
        await prisma.n8nIntegration.deleteMany();
        await prisma.googleAnalyticsIntegration.deleteMany();
        await prisma.user.deleteMany();
        await prisma.businessEntity.deleteMany();
        console.log('✅ Test database cleaned up');
    }
    catch (error) {
        console.error('❌ Error setting up test database:', error);
        throw error;
    }
}
async function teardownTestDatabase() {
    try {
        console.log('🧹 Cleaning up test database...');
        await prisma.n8nWebhookEvent.deleteMany();
        await prisma.n8nIntegration.deleteMany();
        await prisma.googleAnalyticsIntegration.deleteMany();
        await prisma.user.deleteMany();
        await prisma.businessEntity.deleteMany();
        console.log('✅ Test database cleaned up');
    }
    catch (error) {
        console.error('❌ Error cleaning up test database:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
//# sourceMappingURL=setup.js.map