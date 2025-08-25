"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testDatabaseConnection() {
    try {
        console.log('🧪 Testing Database Connection...');
        // Test 1: Basic connection
        console.log('\n1. Testing basic connection...');
        await prisma.$connect();
        console.log('✅ Database connection successful');
        // Test 2: Simple query
        console.log('\n2. Testing simple query...');
        const result = await prisma.$queryRaw `SELECT 1 as test`;
        console.log('✅ Simple query successful:', result);
        // Test 3: Check tables
        console.log('\n3. Checking available tables...');
        const tables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('✅ Available tables:', tables);
        console.log('\n🎉 Database connection test passed!');
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the test
testDatabaseConnection();
//# sourceMappingURL=db-connection-test.js.map