"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../../.env.test') });
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ALLOWED_WEBHOOK_IPS = '127.0.0.1,::1,localhost';
process.env.WEBHOOK_SIGNATURE_SECRET = 'test-webhook-secret';
process.env.CORS_ORIGIN = 'http://localhost:3001';
console.log('🧪 Test environment configured');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('🗄️ DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'undefined');
console.log('🔗 REDIS_URL:', process.env.REDIS_URL);
console.log('🌐 CORS_ORIGIN:', process.env.CORS_ORIGIN);
//# sourceMappingURL=env-setup.js.map