import { EventEmitter } from 'events';

export interface PerformanceMetric {
  id: string;
  type: 'api' | 'database' | 'system' | 'frontend';
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceAlert {
  id: string;
  metricId: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: Date;
}

export interface PerformanceConfig {
  apiResponseTimeThreshold: number; // ms
  databaseQueryTimeThreshold: number; // ms
  frontendLoadTimeThreshold: number; // ms
  systemMemoryThreshold: number; // percentage
  alertEnabled: boolean;
  metricsRetentionDays: number;
}

export class PerformanceMonitoringService extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private config: PerformanceConfig;
  private isMonitoring: boolean = false;

  constructor(config?: Partial<PerformanceConfig>) {
    super();
    this.config = {
      apiResponseTimeThreshold: 200,
      databaseQueryTimeThreshold: 100,
      frontendLoadTimeThreshold: 3000,
      systemMemoryThreshold: 80,
      alertEnabled: true,
      metricsRetentionDays: 30,
      ...config
    };
  }

  start(): void {
    this.isMonitoring = true;
    this.startSystemMonitoring();
    this.emit('monitoring-started');
  }

  stop(): void {
    this.isMonitoring = false;
    this.emit('monitoring-stopped');
  }

  getMonitoringStatus(): { isActive: boolean } {
    return {
      isActive: this.isMonitoring
    };
  }

  trackApiCall(name: string, startTime: number, endTime: number, metadata?: Record<string, any>): void {
    if (!this.isMonitoring) return;

    const duration = endTime - startTime;
    const metric: PerformanceMetric = {
      id: this.generateId(),
      type: 'api',
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata: metadata || {}
    };

    this.addMetric(metric);
    this.checkApiThresholds(metric);
  }

  trackDatabaseQuery(query: string, startTime: number, endTime: number, metadata?: Record<string, any>): void {
    if (!this.isMonitoring) return;

    const duration = endTime - startTime;
    const metric: PerformanceMetric = {
      id: this.generateId(),
      type: 'database',
      name: query.substring(0, 100), // Truncate long queries
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata: { fullQuery: query, ...metadata }
    };

    this.addMetric(metric);
    this.checkDatabaseThresholds(metric);
  }

  trackFrontendPerformance(name: string, loadTime: number, metadata?: Record<string, any>): void {
    if (!this.isMonitoring) return;

    const metric: PerformanceMetric = {
      id: this.generateId(),
      type: 'frontend',
      name,
      value: loadTime,
      unit: 'ms',
      timestamp: new Date(),
      metadata: metadata || {}
    };

    this.addMetric(metric);
    this.checkFrontendThresholds(metric);
  }

  private startSystemMonitoring(): void {
    if (!this.isMonitoring) return;

    // Monitor system memory usage
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      const metric: PerformanceMetric = {
        id: this.generateId(),
        type: 'system',
        name: 'memory-usage',
        value: memoryPercentage,
        unit: 'percentage',
        timestamp: new Date(),
        metadata: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss
        }
      };

      this.addMetric(metric);
      this.checkSystemThresholds(metric);
    }, 30000); // Every 30 seconds

    // Monitor CPU usage (simplified)
    setInterval(() => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const cpuPercentage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds

        const metric: PerformanceMetric = {
          id: this.generateId(),
          type: 'system',
          name: 'cpu-usage',
          value: cpuPercentage,
          unit: 'seconds',
          timestamp: new Date(),
          metadata: {
            user: endUsage.user,
            system: endUsage.system
          }
        };

        this.addMetric(metric);
      }, 100);
    }, 60000); // Every minute
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.cleanupOldMetrics();
    this.emit('metric-added', metric);
  }

  private cleanupOldMetrics(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays);
    
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffDate);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffDate);
  }

  private checkApiThresholds(metric: PerformanceMetric): void {
    if (metric.value > this.config.apiResponseTimeThreshold) {
      this.createAlert(metric, 'warning', `API response time ${metric.value}ms exceeds threshold ${this.config.apiResponseTimeThreshold}ms`);
    }
  }

  private checkDatabaseThresholds(metric: PerformanceMetric): void {
    if (metric.value > this.config.databaseQueryTimeThreshold) {
      this.createAlert(metric, 'warning', `Database query time ${metric.value}ms exceeds threshold ${this.config.databaseQueryTimeThreshold}ms`);
    }
  }

  private checkFrontendThresholds(metric: PerformanceMetric): void {
    if (metric.value > this.config.frontendLoadTimeThreshold) {
      this.createAlert(metric, 'warning', `Frontend load time ${metric.value}ms exceeds threshold ${this.config.frontendLoadTimeThreshold}ms`);
    }
  }

  private checkSystemThresholds(metric: PerformanceMetric): void {
    if (metric.name === 'memory-usage' && metric.value > this.config.systemMemoryThreshold) {
      this.createAlert(metric, 'critical', `Memory usage ${metric.value.toFixed(2)}% exceeds threshold ${this.config.systemMemoryThreshold}%`);
    }
  }

  private createAlert(metric: PerformanceMetric, type: 'warning' | 'error' | 'critical', message: string): void {
    if (!this.config.alertEnabled) return;

    const alert: PerformanceAlert = {
      id: this.generateId(),
      metricId: metric.id,
      type,
      message,
      threshold: this.getThresholdForMetric(metric),
      actualValue: metric.value,
      timestamp: new Date()
    };

    this.alerts.push(alert);
    this.emit('alert-created', alert);
  }

  private getThresholdForMetric(metric: PerformanceMetric): number {
    switch (metric.type) {
      case 'api':
        return this.config.apiResponseTimeThreshold;
      case 'database':
        return this.config.databaseQueryTimeThreshold;
      case 'frontend':
        return this.config.frontendLoadTimeThreshold;
      case 'system':
        return metric.name === 'memory-usage' ? this.config.systemMemoryThreshold : 0;
      default:
        return 0;
    }
  }

  getMetrics(type?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    if (type) {
      filtered = filtered.filter(metric => metric.type === type);
    }
    return filtered.slice(-limit);
  }

  getAlerts(type?: string, limit: number = 100): PerformanceAlert[] {
    let filtered = this.alerts;
    if (type) {
      filtered = filtered.filter(alert => alert.type === type);
    }
    return filtered.slice(-limit);
  }

  getMetricsSummary(): Record<string, any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
    const dailyMetrics = this.metrics.filter(metric => metric.timestamp > oneDayAgo);
    const weeklyMetrics = this.metrics.filter(metric => metric.timestamp > oneWeekAgo);

    // Calculate comprehensive KPIs
    const apiMetrics = recentMetrics.filter(m => m.type === 'api');
    const dbMetrics = recentMetrics.filter(m => m.type === 'database');
    const frontendMetrics = recentMetrics.filter(m => m.type === 'frontend');
    const systemMetrics = recentMetrics.filter(m => m.type === 'system');

    // API Performance KPIs
    const apiKpis = this.calculateApiKpis(apiMetrics, dailyMetrics);
    
    // Database Performance KPIs
    const dbKpis = this.calculateDatabaseKpis(dbMetrics, dailyMetrics);
    
    // Frontend Performance KPIs
    const frontendKpis = this.calculateFrontendKpis(frontendMetrics, dailyMetrics);
    
    // System Performance KPIs
    const systemKpis = this.calculateSystemKpis(systemMetrics);

    return {
      // Basic Metrics
      totalMetrics: this.metrics.length,
      totalAlerts: this.alerts.length,
      recentMetrics: recentMetrics.length,
      dailyMetrics: dailyMetrics.length,
      weeklyMetrics: weeklyMetrics.length,
      
      // Alert Summary
      activeAlerts: this.alerts.filter(alert => alert.type === 'critical').length,
      warningAlerts: this.alerts.filter(alert => alert.type === 'warning').length,
      errorAlerts: this.alerts.filter(alert => alert.type === 'error').length,
      
      // API Performance KPIs
      api: apiKpis,
      
      // Database Performance KPIs
      database: dbKpis,
      
      // Frontend Performance KPIs
      frontend: frontendKpis,
      
      // System Performance KPIs
      system: systemKpis,
      
      // Overall System Health
      systemHealth: this.calculateSystemHealth(),
      
      // Performance Trends
      trends: this.calculatePerformanceTrends(weeklyMetrics),
      
      // SLA Compliance
      slaCompliance: this.calculateSlaCompliance(apiKpis, dbKpis, frontendKpis)
    };
  }

  private calculateApiKpis(apiMetrics: PerformanceMetric[], dailyMetrics: PerformanceMetric[]): Record<string, any> {
    const dailyApiMetrics = dailyMetrics.filter(m => m.type === 'api');
    
    return {
      responseTime: {
        current: this.calculateAverage(apiMetrics),
        daily: this.calculateAverage(dailyApiMetrics),
        p95: this.calculatePercentile(apiMetrics, 95),
        p99: this.calculatePercentile(apiMetrics, 99),
        min: Math.min(...apiMetrics.map(m => m.value)),
        max: Math.max(...apiMetrics.map(m => m.value))
      },
      throughput: {
        current: apiMetrics.length, // requests per hour
        daily: dailyApiMetrics.length,
        rps: apiMetrics.length / 3600 // requests per second
      },
      errorRate: {
        current: this.calculateErrorRate(apiMetrics),
        daily: this.calculateErrorRate(dailyApiMetrics)
      },
      availability: {
        current: this.calculateAvailability(apiMetrics),
        daily: this.calculateAvailability(dailyApiMetrics)
      }
    };
  }

  private calculateDatabaseKpis(dbMetrics: PerformanceMetric[], dailyMetrics: PerformanceMetric[]): Record<string, any> {
    const dailyDbMetrics = dailyMetrics.filter(m => m.type === 'database');
    
    return {
      queryTime: {
        current: this.calculateAverage(dbMetrics),
        daily: this.calculateAverage(dailyDbMetrics),
        p95: this.calculatePercentile(dbMetrics, 95),
        p99: this.calculatePercentile(dbMetrics, 99),
        min: Math.min(...dbMetrics.map(m => m.value)),
        max: Math.max(...dbMetrics.map(m => m.value))
      },
      throughput: {
        current: dbMetrics.length, // queries per hour
        daily: dailyDbMetrics.length,
        qps: dbMetrics.length / 3600 // queries per second
      },
      errorRate: {
        current: this.calculateErrorRate(dbMetrics),
        daily: this.calculateErrorRate(dailyDbMetrics)
      },
      slowQueries: {
        current: dbMetrics.filter(m => m.value > this.config.databaseQueryTimeThreshold).length,
        daily: dailyDbMetrics.filter(m => m.value > this.config.databaseQueryTimeThreshold).length
      }
    };
  }

  private calculateFrontendKpis(frontendMetrics: PerformanceMetric[], dailyMetrics: PerformanceMetric[]): Record<string, any> {
    const dailyFrontendMetrics = dailyMetrics.filter(m => m.type === 'frontend');
    
    return {
      loadTime: {
        current: this.calculateAverage(frontendMetrics),
        daily: this.calculateAverage(dailyFrontendMetrics),
        p95: this.calculatePercentile(frontendMetrics, 95),
        p99: this.calculatePercentile(frontendMetrics, 99),
        min: Math.min(...frontendMetrics.map(m => m.value)),
        max: Math.max(...frontendMetrics.map(m => m.value))
      },
      throughput: {
        current: frontendMetrics.length, // page loads per hour
        daily: dailyFrontendMetrics.length,
        pps: frontendMetrics.length / 3600 // page loads per second
      },
      slowPages: {
        current: frontendMetrics.filter(m => m.value > this.config.frontendLoadTimeThreshold).length,
        daily: dailyFrontendMetrics.filter(m => m.value > this.config.frontendLoadTimeThreshold).length
      }
    };
  }

  private calculateSystemKpis(systemMetrics: PerformanceMetric[]): Record<string, any> {
    const memoryMetrics = systemMetrics.filter(m => m.name === 'memory-usage');
    const cpuMetrics = systemMetrics.filter(m => m.name === 'cpu-usage');
    
    return {
      memory: {
        current: memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0,
        average: this.calculateAverage(memoryMetrics),
        max: Math.max(...memoryMetrics.map(m => m.value)),
        threshold: this.config.systemMemoryThreshold
      },
      cpu: {
        current: cpuMetrics.length > 0 ? cpuMetrics[cpuMetrics.length - 1].value : 0,
        average: this.calculateAverage(cpuMetrics),
        max: Math.max(...cpuMetrics.map(m => m.value))
      },
      uptime: {
        current: process.uptime(),
        formatted: this.formatUptime(process.uptime())
      }
    };
  }

  private calculatePerformanceTrends(weeklyMetrics: PerformanceMetric[]): Record<string, any> {
    const apiTrend = this.calculateTrend(weeklyMetrics.filter(m => m.type === 'api'));
    const dbTrend = this.calculateTrend(weeklyMetrics.filter(m => m.type === 'database'));
    const frontendTrend = this.calculateTrend(weeklyMetrics.filter(m => m.type === 'frontend'));
    
    return {
      api: apiTrend,
      database: dbTrend,
      frontend: frontendTrend,
      overall: this.calculateOverallTrend([apiTrend, dbTrend, frontendTrend])
    };
  }

  private calculateSlaCompliance(apiKpis: any, dbKpis: any, frontendKpis: any): Record<string, any> {
    const apiSla = this.calculateApiSla(apiKpis);
    const dbSla = this.calculateDatabaseSla(dbKpis);
    const frontendSla = this.calculateFrontendSla(frontendKpis);
    
    return {
      api: apiSla,
      database: dbSla,
      frontend: frontendSla,
      overall: (apiSla.compliance + dbSla.compliance + frontendSla.compliance) / 3
    };
  }

  private calculateApiSla(apiKpis: any): Record<string, any> {
    const responseTimeCompliance = apiKpis.responseTime.p95 <= this.config.apiResponseTimeThreshold ? 100 : 
      Math.max(0, 100 - ((apiKpis.responseTime.p95 - this.config.apiResponseTimeThreshold) / this.config.apiResponseTimeThreshold) * 100);
    
    const availabilityCompliance = apiKpis.availability.current;
    const errorRateCompliance = Math.max(0, 100 - apiKpis.errorRate.current);
    
    return {
      responseTime: responseTimeCompliance,
      availability: availabilityCompliance,
      errorRate: errorRateCompliance,
      compliance: (responseTimeCompliance + availabilityCompliance + errorRateCompliance) / 3
    };
  }

  private calculateDatabaseSla(dbKpis: any): Record<string, any> {
    const queryTimeCompliance = dbKpis.queryTime.p95 <= this.config.databaseQueryTimeThreshold ? 100 : 
      Math.max(0, 100 - ((dbKpis.queryTime.p95 - this.config.databaseQueryTimeThreshold) / this.config.databaseQueryTimeThreshold) * 100);
    
    const errorRateCompliance = Math.max(0, 100 - dbKpis.errorRate.current);
    const slowQueriesCompliance = Math.max(0, 100 - (dbKpis.slowQueries.current / Math.max(dbKpis.throughput.current, 1)) * 100);
    
    return {
      queryTime: queryTimeCompliance,
      errorRate: errorRateCompliance,
      slowQueries: slowQueriesCompliance,
      compliance: (queryTimeCompliance + errorRateCompliance + slowQueriesCompliance) / 3
    };
  }

  private calculateFrontendSla(frontendKpis: any): Record<string, any> {
    const loadTimeCompliance = frontendKpis.loadTime.p95 <= this.config.frontendLoadTimeThreshold ? 100 : 
      Math.max(0, 100 - ((frontendKpis.loadTime.p95 - this.config.frontendLoadTimeThreshold) / this.config.frontendLoadTimeThreshold) * 100);
    
    const slowPagesCompliance = Math.max(0, 100 - (frontendKpis.slowPages.current / Math.max(frontendKpis.throughput.current, 1)) * 100);
    
    return {
      loadTime: loadTimeCompliance,
      slowPages: slowPagesCompliance,
      compliance: (loadTimeCompliance + slowPagesCompliance) / 2
    };
  }

  private calculateTrend(metrics: PerformanceMetric[]): Record<string, any> {
    if (metrics.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = metrics.slice(-10);
    const older = metrics.slice(-20, -10);
    
    if (recent.length === 0 || older.length === 0) return { direction: 'stable', percentage: 0 };
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    
    if (olderAvg === 0) return { direction: 'stable', percentage: 0 };
    
    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: percentage > 5 ? 'improving' : percentage < -5 ? 'degrading' : 'stable',
      percentage: Math.round(percentage * 100) / 100
    };
  }

  private calculateOverallTrend(trends: any[]): Record<string, any> {
    const improving = trends.filter(t => t.direction === 'improving').length;
    const degrading = trends.filter(t => t.direction === 'degrading').length;
    const stable = trends.filter(t => t.direction === 'stable').length;
    
    return {
      direction: degrading > improving ? 'degrading' : improving > degrading ? 'improving' : 'stable',
      improving,
      degrading,
      stable,
      total: trends.length
    };
  }

  private calculatePercentile(metrics: PerformanceMetric[], percentile: number): number {
    if (metrics.length === 0) return 0;
    
    const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const errorMetrics = metrics.filter(m => m.metadata?.failed || m.metadata?.error);
    return (errorMetrics.length / metrics.length) * 100;
  }

  private calculateAvailability(metrics: PerformanceMetric[]): number {
    return Math.max(0, 100 - this.calculateErrorRate(metrics));
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return Math.round(sum / metrics.length);
  }

  private calculateSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const criticalAlerts = this.alerts.filter(alert => alert.type === 'critical').length;
    const warningAlerts = this.alerts.filter(alert => alert.type === 'warning').length;

    if (criticalAlerts > 0) return 'critical';
    if (warningAlerts > 5) return 'warning';
    return 'healthy';
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config-updated', this.config);
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default PerformanceMonitoringService;
