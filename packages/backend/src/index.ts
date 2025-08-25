import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { PrismaClient } from '@prisma/client';
import PerformanceMonitoringService from './services/performanceMonitoringService';
import DatabaseMonitoringService from './services/databaseMonitoringService';
import PerformanceTestingService from './services/performanceTestingService';
import PerformanceBottleneckService from './services/performanceBottleneckService';
import PerformanceOptimizationService from './services/performanceOptimizationService';
import DatabaseOptimizationService from './services/databaseOptimizationService';
import ApiOptimizationService from './services/apiOptimizationService';
import FrontendOptimizationService from './services/frontendOptimizationService';
import PerformanceAlertService from './services/performanceAlertService';
import { BackupService } from './services/backupService';
import { SystemHealthService } from './services/systemHealthService';

// Import routes
import performanceMonitoringRoutes from './routes/performanceMonitoring';
import performanceBottleneckRoutes from './routes/performanceBottleneck';
import performanceOptimizationRoutes from './routes/performanceOptimization';
import performanceTestingRoutes from './routes/performanceTesting';
import performanceAlertRoutes from './routes/performanceAlert';
import databaseOptimizationRoutes from './routes/databaseOptimization';
import apiOptimizationRoutes from './routes/apiOptimization';
import frontendOptimizationRoutes from './routes/frontendOptimization';
import BackupRoutes from './routes/backup';
import systemHealthRoutes from './routes/systemHealth';

// Import controllers
import { PerformanceMonitoringController } from './controllers/performanceMonitoringController';
import { PerformanceBottleneckController } from './controllers/performanceBottleneckController';
import { PerformanceOptimizationController } from './controllers/performanceOptimizationController';
import { PerformanceTestingController } from './controllers/performanceTestingController';
import PerformanceAlertController from './controllers/performanceAlertController';
import DatabaseOptimizationController from './controllers/databaseOptimizationController';
import ApiOptimizationController from './controllers/apiOptimizationController';
import FrontendOptimizationController from './controllers/frontendOptimizationController';
import { BackupController } from './controllers/backupController';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize services
const performanceMonitoringService = new PerformanceMonitoringService();
const databaseMonitoringService = new DatabaseMonitoringService(prisma, performanceMonitoringService);
const performanceTestingService = new PerformanceTestingService(performanceMonitoringService, databaseMonitoringService);
const performanceBottleneckService = new PerformanceBottleneckService(performanceMonitoringService);
const performanceOptimizationService = new PerformanceOptimizationService(performanceMonitoringService, performanceBottleneckService);
const databaseOptimizationService = new DatabaseOptimizationService(prisma, databaseMonitoringService, performanceMonitoringService);
const apiOptimizationService = new ApiOptimizationService(performanceMonitoringService, databaseOptimizationService);
const frontendOptimizationService = new FrontendOptimizationService(performanceMonitoringService);
const backupService = new BackupService(prisma);
const performanceAlertService = new PerformanceAlertService(performanceMonitoringService, databaseMonitoringService);
const systemHealthService = new SystemHealthService(prisma);

// Initialize controllers
const performanceMonitoringController = new PerformanceMonitoringController(performanceMonitoringService);
const performanceBottleneckController = new PerformanceBottleneckController(performanceBottleneckService);
const performanceOptimizationController = new PerformanceOptimizationController(performanceOptimizationService);
const performanceTestingController = new PerformanceTestingController(performanceTestingService);
const performanceAlertController = new PerformanceAlertController(performanceAlertService);
const databaseOptimizationController = new DatabaseOptimizationController(databaseOptimizationService);
const apiOptimizationController = new ApiOptimizationController(apiOptimizationService);
const frontendOptimizationController = new FrontendOptimizationController(frontendOptimizationService);
const backupController = new BackupController(backupService);

// Initialize route instances
const backupRoutes = new BackupRoutes();

// Set controllers for dependency injection
performanceMonitoringRoutes.setMonitoringController(performanceMonitoringController);
performanceBottleneckRoutes.setBottleneckController(performanceBottleneckController);
performanceOptimizationRoutes.setOptimizationController(performanceOptimizationController);
performanceTestingRoutes.setTestingController(performanceTestingController);
performanceAlertRoutes.setAlertController(performanceAlertController);
databaseOptimizationRoutes.setDatabaseOptimizationController(databaseOptimizationController);
apiOptimizationRoutes.setApiOptimizationController(apiOptimizationController);
frontendOptimizationRoutes.setFrontendOptimizationController(frontendOptimizationController);
backupRoutes.setBackupController(backupController);

// Middleware
app.use(helmet());
app.use(cors());

app.use(express.json());



// Routes
app.use('/api/performance', performanceMonitoringRoutes);
app.use('/api/performance/bottlenecks', performanceBottleneckRoutes);
app.use('/api/performance/optimization', performanceOptimizationRoutes);
app.use('/api/performance/testing', performanceTestingRoutes);
app.use('/api/performance/alerts', performanceAlertRoutes);
app.use('/api/performance/database-optimization', databaseOptimizationRoutes);
app.use('/api/performance/api-optimization', apiOptimizationRoutes);
app.use('/api/performance/frontend-optimization', frontendOptimizationRoutes);
app.use('/api/backup', backupRoutes.getRouter());
app.use('/api/system-health', systemHealthRoutes);

// Root route
app.get('/', (_req, res) => {
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
      '/api/performance/frontend-optimization',
      '/api/backup',
      '/api/system-health'
    ]
  });
});

// Set global services for dependency injection
global.systemHealthService = systemHealthService;

// Start services
performanceMonitoringService.start();
backupService.start();
performanceAlertService.startMonitoring();
systemHealthService.startMonitoring();

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
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
  console.log('Backup service initialized');
  console.log('System health service initialized');
});

// Graceful shutdown
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
