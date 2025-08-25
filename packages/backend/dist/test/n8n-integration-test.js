"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const n8nService_1 = require("../services/n8nService");
const prisma = new client_1.PrismaClient();
const n8nService = new n8nService_1.N8nService();
async function testN8nIntegration() {
    try {
        console.log('🧪 Testing n8n Integration...');
        // Test 1: Create a business entity first
        console.log('\n1. Creating test business entity...');
        const businessEntity = await prisma.businessEntity.create({
            data: {
                name: 'Test Company',
                description: 'Test company for n8n integration',
                domain: 'test-company.com'
            }
        });
        console.log('✅ Business entity created:', businessEntity.id);
        // Test 2: Create n8n integration
        console.log('\n2. Creating n8n integration...');
        const integration = await n8nService.createIntegration({
            businessEntityId: businessEntity.id,
            webhookUrl: 'https://n8n.example.com/webhook',
            webhookToken: 'test-token-123'
        });
        console.log('✅ n8n integration created:', integration.id);
        // Test 3: Test webhook payload validation
        console.log('\n3. Testing webhook payload validation...');
        const testPayload = {
            workflowId: 'workflow-123',
            workflowName: 'Test Workflow',
            executionId: 'exec-456',
            eventType: 'workflow_completed',
            status: 'completed',
            startTime: '2024-01-01T10:00:00Z',
            endTime: '2024-01-01T10:05:00Z',
            duration: 300000,
            inputData: { test: 'data' },
            outputData: { result: 'success' }
        };
        const validation = await n8nService.validateWebhookPayload(testPayload);
        console.log('✅ Payload validation result:', validation.isValid);
        // Test 4: Process webhook event
        console.log('\n4. Processing webhook event...');
        const result = await n8nService.processWebhookEvent(integration.id, testPayload);
        console.log('✅ Webhook processing result:', result.success);
        // Test 5: Calculate metrics
        console.log('\n5. Calculating metrics...');
        const metrics = await n8nService.calculateMetrics(integration.id);
        console.log('✅ Metrics calculated:', metrics);
        // Test 6: Cleanup
        console.log('\n6. Cleaning up test data...');
        await prisma.n8nWebhookEvent.deleteMany({
            where: { n8nIntegrationId: integration.id }
        });
        await prisma.n8nIntegration.delete({
            where: { id: integration.id }
        });
        await prisma.businessEntity.delete({
            where: { id: businessEntity.id }
        });
        console.log('✅ Test data cleaned up');
        console.log('\n🎉 All n8n integration tests passed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the test
testN8nIntegration();
//# sourceMappingURL=n8n-integration-test.js.map