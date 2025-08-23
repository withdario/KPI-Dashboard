import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import middleware
import { generalRateLimit } from './middleware/rateLimit';
import { requestLogging, errorLogging } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestMetrics, healthCheck, systemMetrics } from './middleware/monitoring';

// Import routes
import authRoutes from './routes/auth';
import businessEntityRoutes from './routes/businessEntities';
import userRoutes from './routes/users';
import googleAnalyticsRoutes from './routes/googleAnalytics';
import n8nRoutes from './routes/n8n';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Order is important!
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestLogging);        // Add request ID and log requests
app.use(requestMetrics);        // Track request metrics
app.use(generalRateLimit);      // Apply rate limiting

// Health check and monitoring endpoints
app.get('/api/health', healthCheck);
app.get('/api/metrics', systemMetrics);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/business-entities', businessEntityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/google-analytics', googleAnalyticsRoutes);
app.use('/api/n8n', n8nRoutes);

// Root route
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

// Error handling - Must be last!
app.use(notFoundHandler);       // 404 handler
app.use(errorLogging);          // Log errors with request context
app.use(errorHandler);          // Standardized error responses

// Only start server if this is the main module (not imported for testing)
if (require.main === module) {
  // Start server - bind to all interfaces to support both IPv4 and IPv6
  app.listen(Number(PORT), '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server running on port ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    // eslint-disable-next-line no-console
    console.log(`📈 System metrics: http://localhost:${PORT}/api/metrics`);
    // eslint-disable-next-line no-console
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    // eslint-disable-next-line no-console
    console.log(`🏢 Business entities: http://localhost:${PORT}/api/business-entities`);
    // eslint-disable-next-line no-console
    console.log(`👥 User management: http://localhost:${PORT}/api/users`);
    // eslint-disable-next-line no-console
    console.log(`📊 Google Analytics: http://localhost:${PORT}/api/google-analytics`);
    // eslint-disable-next-line no-console
    console.log(`🔗 n8n Integration: http://localhost:${PORT}/api/n8n`);
    // eslint-disable-next-line no-console
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
