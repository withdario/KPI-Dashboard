"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPrisma = void 0;
exports.setupTestDatabase = setupTestDatabase;
exports.teardownTestDatabase = teardownTestDatabase;
const prisma_mock_1 = require("./prisma-mock");
// Create a mock Prisma client for all tests
const mockPrisma = (0, prisma_mock_1.createMockPrismaClient)();
exports.mockPrisma = mockPrisma;
// Mock the entire Prisma module
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));
async function setupTestDatabase() {
    try {
        console.log('🧹 Setting up test database mocks...');
        // Setup default mock implementations
        (0, prisma_mock_1.setupDefaultMocks)(mockPrisma);
        console.log('✅ Test database mocks configured');
    }
    catch (error) {
        console.error('❌ Error setting up test database mocks:', error);
        throw error;
    }
}
async function teardownTestDatabase() {
    try {
        console.log('🧹 Cleaning up test database mocks...');
        // Clear all mock calls
        jest.clearAllMocks();
        console.log('✅ Test database mocks cleaned up');
    }
    catch (error) {
        console.error('❌ Error cleaning up test database mocks:', error);
    }
}
//# sourceMappingURL=setup.js.map