"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const rateLimit_1 = require("./middleware/rateLimit");
const logging_1 = require("./middleware/logging");
const errorHandler_1 = require("./middleware/errorHandler");
const monitoring_1 = require("./middleware/monitoring");
const auth_1 = __importDefault(require("./routes/auth"));
const businessEntities_1 = __importDefault(require("./routes/businessEntities"));
const users_1 = __importDefault(require("./routes/users"));
const googleAnalytics_1 = __importDefault(require("./routes/googleAnalytics"));
const n8n_1 = __importDefault(require("./routes/n8n"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(logging_1.requestLogging);
app.use(monitoring_1.requestMetrics);
app.use(rateLimit_1.generalRateLimit);
app.get('/api/health', monitoring_1.healthCheck);
app.get('/api/metrics', monitoring_1.systemMetrics);
app.use('/api/auth', auth_1.default);
app.use('/api/business-entities', businessEntities_1.default);
app.use('/api/users', users_1.default);
app.use('/api/google-analytics', googleAnalytics_1.default);
app.use('/api/n8n', n8n_1.default);
app.get('/', (_req, res) => {
    res.json({
        message: 'Business Intelligence Platform API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            metrics: '/api/metrics',
            auth: '/api/auth',
            businessEntities: '/api/business-entities',
            users: '/api/users',
            googleAnalytics: '/api/google-analytics'
        }
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(logging_1.errorLogging);
app.use(errorHandler_1.errorHandler);
if (require.main === module) {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📈 System metrics: http://localhost:${PORT}/api/metrics`);
        console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
        console.log(`🏢 Business entities: http://localhost:${PORT}/api/business-entities`);
        console.log(`👥 User management: http://localhost:${PORT}/api/users`);
        console.log(`📊 Google Analytics: http://localhost:${PORT}/api/google-analytics`);
        console.log(`🔗 n8n Integration: http://localhost:${PORT}/api/n8n`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map