"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const client_1 = require("@prisma/client");
const performanceMonitoringService_1 = __importDefault(require("./services/performanceMonitoringService"));
const databaseMonitoringService_1 = __importDefault(require("./services/databaseMonitoringService"));
const performanceTestingService_1 = __importDefault(require("./services/performanceTestingService"));
const performanceBottleneckService_1 = __importDefault(require("./services/performanceBottleneckService"));
const performanceOptimizationService_1 = __importDefault(require("./services/performanceOptimizationService"));
const databaseOptimizationService_1 = __importDefault(require("./services/databaseOptimizationService"));
const apiOptimizationService_1 = __importDefault(require("./services/apiOptimizationService"));
const frontendOptimizationService_1 = __importDefault(require("./services/frontendOptimizationService"));
const performanceAlertService_1 = __importDefault(require("./services/performanceAlertService"));
const performanceMonitoring_1 = __importDefault(require("./routes/performanceMonitoring"));
const performanceBottleneck_1 = __importDefault(require("./routes/performanceBottleneck"));
const performanceOptimization_1 = __importDefault(require("./routes/performanceOptimization"));
const performanceTesting_1 = __importDefault(require("./routes/performanceTesting"));
const performanceAlert_1 = __importDefault(require("./routes/performanceAlert"));
const databaseOptimization_1 = __importDefault(require("./routes/databaseOptimization"));
const apiOptimization_1 = __importDefault(require("./routes/apiOptimization"));
const frontendOptimization_1 = __importDefault(require("./routes/frontendOptimization"));
const performanceMonitoringController_1 = require("./controllers/performanceMonitoringController");
const performanceBottleneckController_1 = require("./controllers/performanceBottleneckController");
const performanceOptimizationController_1 = require("./controllers/performanceOptimizationController");
const performanceTestingController_1 = require("./controllers/performanceTestingController");
const performanceAlertController_1 = __importDefault(require("./controllers/performanceAlertController"));
const databaseOptimizationController_1 = __importDefault(require("./controllers/databaseOptimizationController"));
const apiOptimizationController_1 = __importDefault(require("./controllers/apiOptimizationController"));
const frontendOptimizationController_1 = __importDefault(require("./controllers/frontendOptimizationController"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
const performanceMonitoringService = new performanceMonitoringService_1.default();
const databaseMonitoringService = new databaseMonitoringService_1.default(prisma, performanceMonitoringService);
const performanceTestingService = new performanceTestingService_1.default(performanceMonitoringService, databaseMonitoringService);
const performanceBottleneckService = new performanceBottleneckService_1.default(performanceMonitoringService);
const performanceOptimizationService = new performanceOptimizationService_1.default(performanceMonitoringService, performanceBottleneckService);
const databaseOptimizationService = new databaseOptimizationService_1.default(prisma, databaseMonitoringService, performanceMonitoringService);
const apiOptimizationService = new apiOptimizationService_1.default(performanceMonitoringService, databaseOptimizationService);
const frontendOptimizationService = new frontendOptimizationService_1.default(performanceMonitoringService);
const performanceAlertService = new performanceAlertService_1.default(performanceMonitoringService, databaseMonitoringService);
const performanceMonitoringController = new performanceMonitoringController_1.PerformanceMonitoringController(performanceMonitoringService);
const performanceBottleneckController = new performanceBottleneckController_1.PerformanceBottleneckController(performanceBottleneckService);
const performanceOptimizationController = new performanceOptimizationController_1.PerformanceOptimizationController(performanceOptimizationService);
const performanceTestingController = new performanceTestingController_1.PerformanceTestingController(performanceTestingService);
const performanceAlertController = new performanceAlertController_1.default(performanceAlertService);
const databaseOptimizationController = new databaseOptimizationController_1.default(databaseOptimizationService);
const apiOptimizationController = new apiOptimizationController_1.default(apiOptimizationService);
const frontendOptimizationController = new frontendOptimizationController_1.default(frontendOptimizationService);
performanceMonitoring_1.default.setMonitoringController(performanceMonitoringController);
performanceBottleneck_1.default.setBottleneckController(performanceBottleneckController);
performanceOptimization_1.default.setOptimizationController(performanceOptimizationController);
performanceTesting_1.default.setTestingController(performanceTestingController);
performanceAlert_1.default.setAlertController(performanceAlertController);
databaseOptimization_1.default.setDatabaseOptimizationController(databaseOptimizationController);
apiOptimization_1.default.setApiOptimizationController(apiOptimizationController);
frontendOptimization_1.default.setFrontendOptimizationController(frontendOptimizationController);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/performance', performanceMonitoring_1.default);
app.use('/api/performance/bottlenecks', performanceBottleneck_1.default);
app.use('/api/performance/optimization', performanceOptimization_1.default);
app.use('/api/performance/testing', performanceTesting_1.default);
app.use('/api/performance/alerts', performanceAlert_1.default);
app.use('/api/performance/database-optimization', databaseOptimization_1.default);
app.use('/api/performance/api-optimization', apiOptimization_1.default);
app.use('/api/performance/frontend-optimization', frontendOptimization_1.default);
app.get('/', (req, res) => {
    res.json({
        message: 'Performance Monitoring API',
        version: '1.0.0',
        endpoints: [
            '/api/performance',
            '/api/performance/bottlenecks',
            '/api/performance/optimization',
            '/api/performance/testing',
            '/api/performance/alerts',
            '/api/performance/database-optimization',
            '/api/performance/api-optimization',
            '/api/performance/frontend-optimization'
        ]
    });
});
performanceMonitoringService.start();
performanceAlertService.startMonitoring();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Performance monitoring service initialized');
    console.log('Performance bottleneck service initialized');
    console.log('Performance optimization service initialized');
    console.log('Performance testing service initialized');
    console.log('Performance alert service initialized');
    console.log('Database optimization service initialized');
    console.log('API optimization service initialized');
    console.log('Frontend optimization service initialized');
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map