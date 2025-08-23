import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({ path: resolve(__dirname, '../../.env.test') });

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock environment variables that might be used in tests
process.env.ALLOWED_WEBHOOK_IPS = '127.0.0.1,::1,localhost';
process.env.WEBHOOK_SIGNATURE_SECRET = 'test-webhook-secret';
process.env.CORS_ORIGIN = 'http://localhost:3001';

console.log('🧪 Test environment configured');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('🗄️ DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'undefined');
console.log('🔗 REDIS_URL:', process.env.REDIS_URL);
console.log('🌐 CORS_ORIGIN:', process.env.CORS_ORIGIN);
