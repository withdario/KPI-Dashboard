import PerformanceMonitoringService from './performanceMonitoringService';

export interface Bottleneck {
  id: string;
  type: 'api' | 'database' | 'system' | 'frontend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  metrics: Record<string, any>;
  recommendations: string[];
  status: 'active' | 'resolved' | 'investigating';
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export class PerformanceBottleneckService {
  private performanceService: PerformanceMonitoringService;
  private bottlenecks: Bottleneck[] = [];
  private thresholds: Record<string, any> = {
    api: {
      responseTime: { warning: 500, critical: 1000 }, // ms
      errorRate: { warning: 5, critical: 10 }, // percentage
      throughput: { warning: 100, critical: 50 } // requests per second
    },
    database: {
      queryTime: { warning: 100, critical: 500 }, // ms
      errorRate: { warning: 2, critical: 5 }, // percentage
      slowQueries: { warning: 10, critical: 25 } // percentage
    },
    system: {
      memory: { warning: 80, critical: 90 }, // percentage
      cpu: { warning: 80, critical: 90 }, // percentage
      uptime: { warning: 99.5, critical: 99.0 } // percentage
    },
    frontend: {
      loadTime: { warning: 3000, critical: 5000 }, // ms
      renderTime: { warning: 1000, critical: 2000 }, // ms
      errorRate: { warning: 2, critical: 5 } // percentage
    }
  };

  constructor(
    performanceService: PerformanceMonitoringService
  ) {
    this.performanceService = performanceService;
  }

  // Detect performance bottlenecks based on current metrics
  async detectBottlenecks(): Promise<Bottleneck[]> {
    const metrics = this.performanceService.getMetricsSummary();
    const bottlenecks: Bottleneck[] = [];
    
    // Check API bottlenecks
    if (metrics.api) {
      const apiBottlenecks = this.checkApiBottlenecks(metrics.api);
      bottlenecks.push(...apiBottlenecks);
    }
    
    // Check database bottlenecks
    if (metrics.database) {
      const dbBottlenecks = this.checkDatabaseBottlenecks(metrics.database);
      bottlenecks.push(...dbBottlenecks);
    }
    
    // Check system bottlenecks
    if (metrics.system) {
      const systemBottlenecks = this.checkSystemBottlenecks(metrics.system);
      bottlenecks.push(...systemBottlenecks);
    }
    
    // Check frontend bottlenecks
    if (metrics.frontend) {
      const frontendBottlenecks = this.checkFrontendBottlenecks(metrics.frontend);
      bottlenecks.push(...frontendBottlenecks);
    }
    
    // Update existing bottlenecks
    this.updateBottlenecks(bottlenecks);
    
    return this.bottlenecks.filter(b => b.status === 'active');
  }

  private checkApiBottlenecks(apiMetrics: any): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    // Check response time
    if (apiMetrics.responseTime?.current > this.thresholds.api.responseTime.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'api',
        severity: 'critical',
        description: 'API response time is critically high',
        detectedAt: new Date(),
        metrics: { responseTime: apiMetrics.responseTime.current },
        recommendations: [
          'Implement API response caching',
          'Review and optimize API endpoint logic',
          'Consider horizontal scaling'
        ],
        status: 'active'
      });
    } else if (apiMetrics.responseTime?.current > this.thresholds.api.responseTime.warning) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'api',
        severity: 'high',
        description: 'API response time is above warning threshold',
        detectedAt: new Date(),
        metrics: { responseTime: apiMetrics.responseTime.current },
        recommendations: [
          'Monitor API performance trends',
          'Consider implementing caching strategies'
        ],
        status: 'active'
      });
    }
    
    // Check error rate
    if (apiMetrics.errorRate?.current > this.thresholds.api.errorRate.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'api',
        severity: 'critical',
        description: 'API error rate is critically high',
        detectedAt: new Date(),
        metrics: { errorRate: apiMetrics.errorRate.current },
        recommendations: [
          'Implement circuit breaker pattern',
          'Review error handling and logging',
          'Check external service dependencies'
        ],
        status: 'active'
      });
    }
    
    // Check throughput
    if (apiMetrics.throughput?.current < this.thresholds.api.throughput.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'api',
        severity: 'high',
        description: 'API throughput is below critical threshold',
        detectedAt: new Date(),
        metrics: { throughput: apiMetrics.throughput.current },
        recommendations: [
          'Investigate request processing bottlenecks',
          'Consider optimizing request handling',
          'Review server resources'
        ],
        status: 'active'
      });
    }
    
    return bottlenecks;
  }

  private checkDatabaseBottlenecks(dbMetrics: any): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    // Check query time
    if (dbMetrics.queryTime?.current > this.thresholds.database.queryTime.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'database',
        severity: 'critical',
        description: 'Database query time is critically high',
        detectedAt: new Date(),
        metrics: { queryTime: dbMetrics.queryTime.current },
        recommendations: [
          'Add database indexes for slow queries',
          'Optimize complex database queries',
          'Review database connection pooling'
        ],
        status: 'active'
      });
    }
    
    // Check error rate
    if (dbMetrics.errorRate?.current > this.thresholds.database.errorRate.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'database',
        severity: 'critical',
        description: 'Database error rate is critically high',
        detectedAt: new Date(),
        metrics: { errorRate: dbMetrics.errorRate.current },
        recommendations: [
          'Check database connectivity',
          'Review database logs',
          'Verify database schema integrity'
        ],
        status: 'active'
      });
    }
    
    // Check slow queries percentage
    if (dbMetrics.slowQueries?.current > this.thresholds.database.slowQueries.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'database',
        severity: 'high',
        description: 'High percentage of slow database queries',
        detectedAt: new Date(),
        metrics: { slowQueries: dbMetrics.slowQueries.current },
        recommendations: [
          'Implement query result caching',
          'Review and optimize slow queries',
          'Consider database query optimization'
        ],
        status: 'active'
      });
    }
    
    return bottlenecks;
  }

  private checkSystemBottlenecks(systemMetrics: any): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    // Check memory usage
    if (systemMetrics.memory?.current > this.thresholds.system.memory.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'system',
        severity: 'critical',
        description: 'System memory usage is critically high',
        detectedAt: new Date(),
        metrics: { memory: systemMetrics.memory.current },
        recommendations: [
          'Implement memory leak detection and cleanup',
          'Review memory-intensive operations',
          'Consider increasing server memory'
        ],
        status: 'active'
      });
    }
    
    // Check CPU usage
    if (systemMetrics.cpu?.current > this.thresholds.system.cpu.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'system',
        severity: 'critical',
        description: 'System CPU usage is critically high',
        detectedAt: new Date(),
        metrics: { cpu: systemMetrics.cpu.current },
        recommendations: [
          'Optimize CPU-intensive operations',
          'Review application performance',
          'Consider horizontal scaling'
        ],
        status: 'active'
      });
    }
    
    // Check uptime
    if (systemMetrics.uptime?.current < this.thresholds.system.uptime.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'system',
        severity: 'critical',
        description: 'System uptime is below critical threshold',
        detectedAt: new Date(),
        metrics: { uptime: systemMetrics.uptime.current },
        recommendations: [
          'Investigate system crashes',
          'Review error logs',
          'Implement health checks and auto-restart'
        ],
        status: 'active'
      });
    }
    
    return bottlenecks;
  }

  private checkFrontendBottlenecks(frontendMetrics: any): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    // Check load time
    if (frontendMetrics.loadTime?.current > this.thresholds.frontend.loadTime.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'frontend',
        severity: 'critical',
        description: 'Frontend load time is critically high',
        detectedAt: new Date(),
        metrics: { loadTime: frontendMetrics.loadTime.current },
        recommendations: [
          'Implement frontend asset caching',
          'Optimize bundle size',
          'Consider CDN for static assets'
        ],
        status: 'active'
      });
    }
    
    // Check render time
    if (frontendMetrics.renderTime?.current > this.thresholds.frontend.renderTime.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'frontend',
        severity: 'high',
        description: 'Frontend render time is critically high',
        detectedAt: new Date(),
        metrics: { renderTime: frontendMetrics.renderTime.current },
        recommendations: [
          'Implement code splitting and lazy loading',
          'Optimize React component rendering',
          'Review component lifecycle methods'
        ],
        status: 'active'
      });
    }
    
    // Check error rate
    if (frontendMetrics.errorRate?.current > this.thresholds.frontend.errorRate.critical) {
      bottlenecks.push({
        id: this.generateId(),
        type: 'frontend',
        severity: 'critical',
        description: 'Frontend error rate is critically high',
        detectedAt: new Date(),
        metrics: { errorRate: frontendMetrics.errorRate.current },
        recommendations: [
          'Implement error boundary components',
          'Review JavaScript error handling',
          'Check for console errors and warnings'
        ],
        status: 'active'
      });
    }
    
    return bottlenecks;
  }

  private updateBottlenecks(newBottlenecks: Bottleneck[]): void {
    // Mark resolved bottlenecks
    this.bottlenecks.forEach(bottleneck => {
      const isStillActive = newBottlenecks.some(nb => 
        nb.type === bottleneck.type && 
        nb.description === bottleneck.description
      );
      
      if (!isStillActive && bottleneck.status === 'active') {
        bottleneck.status = 'resolved';
        bottleneck.resolvedAt = new Date();
        bottleneck.resolutionNotes = 'Automatically resolved based on improved metrics';
      }
    });
    
    // Add new bottlenecks
    newBottlenecks.forEach(newBottleneck => {
      const exists = this.bottlenecks.some(b => 
        b.type === newBottleneck.type && 
        b.description === newBottleneck.description
      );
      
      if (!exists) {
        this.bottlenecks.push(newBottleneck);
      }
    });
  }

  // Get all bottlenecks
  getBottlenecks(): Bottleneck[] {
    return this.bottlenecks;
  }

  // Get active bottlenecks
  getActiveBottlenecks(): Bottleneck[] {
    return this.bottlenecks.filter(b => b.status === 'active');
  }

  // Get bottleneck by ID
  getBottleneck(id: string): Bottleneck | undefined {
    return this.bottlenecks.find(b => b.id === id);
  }

  // Update bottleneck status
  updateBottleneckStatus(id: string, status: Bottleneck['status'], notes?: string): void {
    const bottleneck = this.bottlenecks.find(b => b.id === id);
    if (bottleneck) {
      bottleneck.status = status;
      if (status === 'resolved') {
        bottleneck.resolvedAt = new Date();
        if (notes !== undefined) {
          bottleneck.resolutionNotes = notes;
        }
      }
    }
  }

  // Update thresholds
  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Get current thresholds
  getThresholds(): typeof this.thresholds {
    return this.thresholds;
  }

  // Generate unique ID
  private generateId(): string {
    return `bottleneck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default PerformanceBottleneckService;
