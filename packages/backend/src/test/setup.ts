import { PrismaClient } from '@prisma/client';
import { createMockPrismaClient, setupDefaultMocks } from './prisma-mock';

// Create a mock Prisma client for all tests
const mockPrisma = createMockPrismaClient();

// Mock the entire Prisma module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

export async function setupTestDatabase() {
  try {
    console.log('🧹 Setting up test database mocks...');
    
    // Setup default mock implementations
    setupDefaultMocks(mockPrisma);
    
    console.log('✅ Test database mocks configured');
  } catch (error) {
    console.error('❌ Error setting up test database mocks:', error);
    throw error;
  }
}

export async function teardownTestDatabase() {
  try {
    console.log('🧹 Cleaning up test database mocks...');
    
    // Clear all mock calls
    jest.clearAllMocks();
    
    console.log('✅ Test database mocks cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test database mocks:', error);
  }
}

// Export the mock Prisma client for use in individual tests
export { mockPrisma };
