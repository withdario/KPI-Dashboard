import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestDatabase() {
  try {
    console.log('🧹 Setting up test database...');
    
    // Clean up all test data
    await prisma.n8nWebhookEvent.deleteMany();
    await prisma.n8nIntegration.deleteMany();
    await prisma.googleAnalyticsIntegration.deleteMany();
    await prisma.user.deleteMany();
    await prisma.businessEntity.deleteMany();
    
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
}

export async function teardownTestDatabase() {
  try {
    console.log('🧹 Cleaning up test database...');
    
    // Clean up all test data
    await prisma.n8nWebhookEvent.deleteMany();
    await prisma.n8nIntegration.deleteMany();
    await prisma.googleAnalyticsIntegration.deleteMany();
    await prisma.user.deleteMany();
    await prisma.businessEntity.deleteMany();
    
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
  } finally {
    await prisma.$disconnect();
  }
}
