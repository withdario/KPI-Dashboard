import request from 'supertest';
import app from '../index';

describe('Health Check and Monitoring Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 and healthy status when system is running', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('system');
      
      // Check uptime structure
      expect(response.body.uptime).toHaveProperty('seconds');
      expect(response.body.uptime).toHaveProperty('minutes');
      expect(response.body.uptime).toHaveProperty('hours');
      
      // Check metrics structure
      expect(response.body.metrics).toHaveProperty('totalRequests');
      expect(response.body.metrics).toHaveProperty('successfulRequests');
      expect(response.body.metrics).toHaveProperty('failedRequests');
      expect(response.body.metrics).toHaveProperty('averageResponseTime');
      expect(response.body.metrics).toHaveProperty('lastHealthCheck');
      
      // Check system structure
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('memoryUsage');
      expect(response.body.system).toHaveProperty('cpuUsage');
    });

    it('should return valid timestamp in ISO format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return valid uptime values', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.uptime.seconds).toBeGreaterThanOrEqual(0);
      expect(response.body.uptime.minutes).toBeGreaterThanOrEqual(0);
      expect(response.body.uptime.hours).toBeGreaterThanOrEqual(0);
    });

    it('should return valid metrics', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.metrics.totalRequests).toBeGreaterThanOrEqual(0);
      expect(response.body.metrics.successfulRequests).toBeGreaterThanOrEqual(0);
      expect(response.body.metrics.failedRequests).toBeGreaterThanOrEqual(0);
      expect(response.body.metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/metrics', () => {
    it('should return 200 and comprehensive system metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('system');
      
      // Check uptime structure
      expect(response.body.uptime).toHaveProperty('milliseconds');
      expect(response.body.uptime).toHaveProperty('seconds');
      expect(response.body.uptime).toHaveProperty('minutes');
      expect(response.body.uptime).toHaveProperty('hours');
      expect(response.body.uptime).toHaveProperty('days');
      
      // Check requests structure
      expect(response.body.requests).toHaveProperty('total');
      expect(response.body.requests).toHaveProperty('successful');
      expect(response.body.requests).toHaveProperty('failed');
      expect(response.body.requests).toHaveProperty('successRate');
      
      // Check performance structure
      expect(response.body.performance).toHaveProperty('averageResponseTime');
      expect(response.body.performance).toHaveProperty('requestsPerMinute');
      
      // Check system structure
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('arch');
      expect(response.body.system).toHaveProperty('memoryUsage');
      expect(response.body.system).toHaveProperty('cpuUsage');
      expect(response.body.system).toHaveProperty('pid');
    });

    it('should return valid success rate percentage', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body.requests.successRate).toMatch(/^\d+(\.\d+)?%$/);
    });

    it('should return valid performance metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body.performance.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(response.body.performance.requestsPerMinute).toBeGreaterThanOrEqual(0);
    });

    it('should return valid system information', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body.system.nodeVersion).toBeTruthy();
      expect(response.body.system.platform).toBeTruthy();
      expect(response.body.system.arch).toBeTruthy();
      expect(response.body.system.pid).toBeGreaterThan(0);
    });
  });

  describe('Root endpoint', () => {
    it('should return API information with all endpoints', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Business Intelligence Platform API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
      
      // Check all endpoints are listed
      expect(response.body.endpoints).toHaveProperty('health', '/api/health');
      expect(response.body.endpoints).toHaveProperty('metrics', '/api/metrics');
      expect(response.body.endpoints).toHaveProperty('auth', '/api/auth');
      expect(response.body.endpoints).toHaveProperty('businessEntities', '/api/business-entities');
      expect(response.body.endpoints).toHaveProperty('users', '/api/users');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Route not found');
      expect(response.body.error).toHaveProperty('code', 'NotFound');
      expect(response.body.error).toHaveProperty('requestId');
      expect(response.body.error).toHaveProperty('timestamp');
      expect(response.body.error).toHaveProperty('path', '/api/nonexistent');
    });

    it('should return standardized error format', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      const errorResponse = response.body.error;
      expect(typeof errorResponse.message).toBe('string');
      expect(typeof errorResponse.code).toBe('string');
      expect(typeof errorResponse.requestId).toBe('string');
      expect(typeof errorResponse.timestamp).toBe('string');
      expect(typeof errorResponse.path).toBe('string');
    });
  });
});
