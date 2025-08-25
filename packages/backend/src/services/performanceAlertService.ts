import PerformanceMonitoringService from './performanceMonitoringService';
import DatabaseMonitoringService from './databaseMonitoringService';

export interface PerformanceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'api' | 'database' | 'system' | 'frontend' | 'custom';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  dismissedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'database' | 'system' | 'frontend' | 'custom';
  metric: string;
  condition: 'above' | 'below' | 'equals' | 'not_equals' | 'contains' | 'not_contains';
  threshold: number | string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // seconds
  lastTriggered?: Date;
  notificationChannels: string[];
  tags: string[];
}

export interface AlertNotification {
  id: string;
  alertId: string;
  channel: 'email' | 'slack' | 'webhook' | 'sms' | 'dashboard';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  recipient?: string;
  metadata?: Record<string, any>;
}

export interface AlertSummary {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  dismissedAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
  alertsByCategory: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  recentAlerts: PerformanceAlert[];
}

export class PerformanceAlertService {
  private performanceService: PerformanceMonitoringService;
  private databaseService: DatabaseMonitoringService;
  private alerts: PerformanceAlert[] = [];
  private rules: AlertRule[] = [];
  private notifications: AlertNotification[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(
    performanceService: PerformanceMonitoringService,
    databaseService: DatabaseMonitoringService
  ) {
    this.performanceService = performanceService;
    this.databaseService = databaseService;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.rules = [
      // API Performance Rules
      {
        id: 'api_response_time_critical',
        name: 'API Response Time Critical',
        description: 'Alert when API response time exceeds critical threshold',
        category: 'api',
        metric: 'responseTime',
        condition: 'above',
        threshold: 2000,
        severity: 'critical',
        enabled: true,
        cooldown: 300,
        notificationChannels: ['email', 'slack', 'dashboard'],
        tags: ['api', 'performance', 'critical']
      },
      {
        id: 'api_response_time_warning',
        name: 'API Response Time Warning',
        description: 'Alert when API response time exceeds warning threshold',
        category: 'api',
        metric: 'responseTime',
        condition: 'above',
        threshold: 1000,
        severity: 'medium',
        enabled: true,
        cooldown: 300,
        notificationChannels: ['dashboard'],
        tags: ['api', 'performance', 'warning']
      },
      {
        id: 'api_error_rate_critical',
        name: 'API Error Rate Critical',
        description: 'Alert when API error rate exceeds critical threshold',
        category: 'api',
        metric: 'errorRate',
        condition: 'above',
        threshold: 10,
        severity: 'critical',
        enabled: true,
        cooldown: 60,
        notificationChannels: ['email', 'slack', 'dashboard'],
        tags: ['api', 'reliability', 'critical']
      },
      {
        id: 'api_throughput_low',
        name: 'API Throughput Low',
        description: 'Alert when API throughput falls below threshold',
        category: 'api',
        metric: 'throughput',
        condition: 'below',
        threshold: 10,
        severity: 'medium', // Changed from 'warning' to 'medium'
        enabled: true,
        cooldown: 300,
        notificationChannels: ['dashboard'],
        tags: ['api', 'performance', 'warning']
      },

      // Database Performance Rules
      {
        id: 'db_query_time_critical',
        name: 'Database Query Time Critical',
        description: 'Alert when database query time exceeds critical threshold',
        category: 'database',
        metric: 'queryTime',
        condition: 'above',
        threshold: 1000,
        severity: 'critical',
        enabled: true,
        cooldown: 300,
        notificationChannels: ['email', 'slack', 'dashboard'],
        tags: ['database', 'performance', 'critical']
      },
      {
        id: 'db_connection_pool_high',
        name: 'Database Connection Pool High',
        description: 'Alert when database connection pool usage is high',
        category: 'database',
        metric: 'connectionPoolUsage',
        condition: 'above',
        threshold: 80,
        severity: 'medium',
        enabled: true,
        cooldown: 300,
        notificationChannels: ['dashboard'],
        tags: ['database', 'resources', 'warning']
      },

      // System Performance Rules
      {
        id: 'cpu_usage_critical',
        name: 'CPU Usage Critical',
        description: 'Alert when CPU usage exceeds critical threshold',
        category: 'system',
        metric: 'cpuUsage',
        condition: 'above',
        threshold: 90,
        severity: 'critical',
        enabled: true,
        cooldown: 60,
        notificationChannels: ['email', 'slack', 'dashboard'],
        tags: ['system', 'resources', 'critical']
      },
      {
        id: 'memory_usage_warning',
        name: 'Memory Usage Warning',
        description: 'Alert when memory usage exceeds warning threshold',
        category: 'system',
        metric: 'memoryUsage',
        condition: 'above',
        threshold: 80,
        severity: 'medium',
        enabled: true,
        cooldown: 300,
        notificationChannels: ['dashboard'],
        tags: ['system', 'resources', 'warning']
      },
      {
        id: 'disk_usage_warning',
        name: 'Disk Usage Warning',
        description: 'Alert when disk usage exceeds warning threshold',
        category: 'system',
        metric: 'diskUsage',
        condition: 'above',
        threshold: 85,
        severity: 'medium',
        enabled: true,
        cooldown: 600,
        notificationChannels: ['dashboard'],
        tags: ['system', 'resources', 'warning']
      },

      // Frontend Performance Rules
      {
        id: 'frontend_load_time_critical',
        name: 'Frontend Load Time Critical',
        description: 'Alert when frontend page load time exceeds critical threshold',
        category: 'frontend',
        metric: 'loadTime',
        condition: 'above',
        threshold: 5000,
        severity: 'critical',
        enabled: true,
        cooldown: 300,
        notificationChannels: ['email', 'slack', 'dashboard'],
        tags: ['frontend', 'performance', 'critical']
      },
      {
        id: 'frontend_bundle_size_large',
        name: 'Frontend Bundle Size Large',
        description: 'Alert when frontend bundle size exceeds threshold',
        category: 'frontend',
        metric: 'bundleSize',
        condition: 'above',
        threshold: 2048, // 2MB
        severity: 'medium',
        enabled: true,
        cooldown: 600,
        notificationChannels: ['dashboard'],
        tags: ['frontend', 'performance', 'warning']
      }
    ];
  }

  // Start monitoring performance metrics
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      throw new Error('Performance monitoring is already active');
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkPerformanceMetrics();
    }, intervalMs);

    console.log('Performance alert monitoring started');
  }

  // Stop monitoring performance metrics
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('Performance alert monitoring stopped');
  }

  // Check performance metrics against alert rules
  private async checkPerformanceMetrics(): Promise<void> {
    try {
      const metrics = this.performanceService.getMetricsSummary();
      
      // Check API metrics
      if (metrics.api) {
        await this.checkApiMetrics(metrics.api);
      }
      
      // Check database metrics
      if (metrics.database) {
        await this.checkDatabaseMetrics(metrics.database);
      }
      
      // Check system metrics
      if (metrics.system) {
        await this.checkSystemMetrics(metrics.system);
      }
      
      // Check frontend metrics
      if (metrics.frontend) {
        await this.checkFrontendMetrics(metrics.frontend);
      }
      
    } catch (error) {
      console.error('Error checking performance metrics:', error);
    }
  }

  // Check API metrics against rules
  private async checkApiMetrics(apiMetrics: any): Promise<void> {
    const apiRules = this.rules.filter(r => r.category === 'api' && r.enabled);
    
    for (const rule of apiRules) {
      if (this.shouldCheckRule(rule)) {
        const value = this.extractMetricValue(apiMetrics, rule.metric);
        if (value !== null && this.evaluateCondition(value, rule.condition, rule.threshold)) {
          await this.createAlert(rule, value, rule.threshold, apiMetrics);
          rule.lastTriggered = new Date();
        }
      }
    }
  }

  // Check database metrics against rules
  private async checkDatabaseMetrics(dbMetrics: any): Promise<void> {
    const dbRules = this.rules.filter(r => r.category === 'database' && r.enabled);
    
    for (const rule of dbRules) {
      if (this.shouldCheckRule(rule)) {
        const value = this.extractMetricValue(dbMetrics, rule.metric);
        if (value !== null && this.evaluateCondition(value, rule.condition, rule.threshold)) {
          await this.createAlert(rule, value, rule.threshold, dbMetrics);
          rule.lastTriggered = new Date();
        }
      }
    }
  }

  // Check system metrics against rules
  private async checkSystemMetrics(systemMetrics: any): Promise<void> {
    const systemRules = this.rules.filter(r => r.category === 'system' && r.enabled);
    
    for (const rule of systemRules) {
      if (this.shouldCheckRule(rule)) {
        const value = this.extractMetricValue(systemMetrics, rule.metric);
        if (value !== null && this.evaluateCondition(value, rule.condition, rule.threshold)) {
          await this.createAlert(rule, value, rule.threshold, systemMetrics);
          rule.lastTriggered = new Date();
        }
      }
    }
  }

  // Check frontend metrics against rules
  private async checkFrontendMetrics(frontendMetrics: any): Promise<void> {
    const frontendRules = this.rules.filter(r => r.category === 'frontend' && r.enabled);
    
    for (const rule of frontendRules) {
      if (this.shouldCheckRule(rule)) {
        const value = this.extractMetricValue(frontendMetrics, rule.metric);
        if (value !== null && this.evaluateCondition(value, rule.condition, rule.threshold)) {
          await this.createAlert(rule, value, rule.threshold, frontendMetrics);
          rule.lastTriggered = new Date();
        }
      }
    }
  }

  // Check if rule should be evaluated (cooldown check)
  private shouldCheckRule(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return true;
    
    const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
    return timeSinceLastTrigger >= rule.cooldown * 1000;
  }

  // Extract metric value from metrics object
  private extractMetricValue(metrics: any, metricName: string): number | null {
    const metricPath = metricName.split('.');
    let value = metrics;
    
    for (const path of metricPath) {
      if (value && typeof value === 'object' && path in value) {
        value = value[path];
      } else {
        return null;
      }
    }
    
    // Try to get current value first, then fallback to other values
    if (value && typeof value === 'object') {
      if (value.current !== undefined) return value.current;
      if (value.average !== undefined) return value.average;
      if (value.value !== undefined) return value.value;
    }
    
    return typeof value === 'number' ? value : null;
  }

  // Evaluate condition
  private evaluateCondition(value: number, condition: string, threshold: number | string): boolean {
    // Convert threshold to number for comparison
    const thresholdNum = typeof threshold === 'string' ? parseFloat(threshold) || 0 : threshold;
    
    switch (condition) {
      case 'above':
        return value > thresholdNum;
      case 'below':
        return value < thresholdNum;
      case 'equals':
        return value === thresholdNum;
      case 'not_equals':
        return value !== thresholdNum;
      case 'contains':
        return String(value).includes(String(threshold));
      case 'not_contains':
        return !String(value).includes(String(threshold));
      default:
        return false;
    }
  }

  // Create a new alert
  private async createAlert(
    rule: AlertRule,
    currentValue: number,
    threshold: number | string,
    context: any
  ): Promise<void> {
    const alert: PerformanceAlert = {
      id: this.generateId(),
      type: this.getAlertType(rule.severity),
      category: rule.category,
      title: rule.name,
      description: rule.description,
      metric: rule.metric,
      currentValue,
      threshold: typeof threshold === 'string' ? parseFloat(threshold) || 0 : threshold,
      severity: rule.severity,
      status: 'active',
      createdAt: new Date(),
      metadata: {
        ruleId: rule.id,
        context,
        tags: rule.tags
      }
    };

    this.alerts.push(alert);
    
    // Send notifications
    await this.sendNotifications(alert, rule);
    
    console.log(`Performance alert created: ${alert.title} (${alert.severity})`);
  }

  // Get alert type based on severity
  private getAlertType(severity: string): 'critical' | 'warning' | 'info' {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'critical';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }

  // Send notifications for an alert
  private async sendNotifications(alert: PerformanceAlert, rule: AlertRule): Promise<void> {
    for (const channel of rule.notificationChannels) {
      const notification: AlertNotification = {
        id: this.generateId(),
        alertId: alert.id,
        channel: channel as any,
        status: 'pending',
        metadata: {
          ruleId: rule.id,
          severity: alert.severity
        }
      };

      this.notifications.push(notification);

      try {
        await this.sendNotification(notification, alert, rule);
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = 'failed';
        notification.failedAt = new Date();
        notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send notification via ${channel}:`, error);
      }
    }
  }

  // Send a single notification
  private async sendNotification(
    notification: AlertNotification,
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    switch (notification.channel) {
      case 'email':
        await this.sendEmailNotification(notification, alert, rule);
        break;
      case 'slack':
        await this.sendSlackNotification(notification, alert, rule);
        break;
      case 'webhook':
        await this.sendWebhookNotification(notification, alert, rule);
        break;
      case 'sms':
        await this.sendSmsNotification(notification, alert, rule);
        break;
      case 'dashboard':
        // Dashboard notifications are handled by the frontend
        break;
      default:
        throw new Error(`Unsupported notification channel: ${notification.channel}`);
    }
  }

  // Send email notification (simulated)
  private async sendEmailNotification(
    notification: AlertNotification,
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    // Simulate email sending
    await this.delay(100);
    console.log(`Email notification sent for alert: ${alert.title}`);
  }

  // Send Slack notification (simulated)
  private async sendSlackNotification(
    notification: AlertNotification,
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    // Simulate Slack notification
    await this.delay(100);
    console.log(`Slack notification sent for alert: ${alert.title}`);
  }

  // Send webhook notification (simulated)
  private async sendWebhookNotification(
    notification: AlertNotification,
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    // Simulate webhook call
    await this.delay(100);
    console.log(`Webhook notification sent for alert: ${alert.title}`);
  }

  // Send SMS notification (simulated)
  private async sendSmsNotification(
    notification: AlertNotification,
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    // Simulate SMS sending
    await this.delay(100);
    console.log(`SMS notification sent for alert: ${alert.title}`);
  }

  // Acknowledge an alert
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<PerformanceAlert> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.status !== 'active') {
      throw new Error('Alert cannot be acknowledged in its current status');
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    return alert;
  }

  // Resolve an alert
  async resolveAlert(alertId: string, resolvedBy: string): Promise<PerformanceAlert> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.status === 'resolved' || alert.status === 'dismissed') {
      throw new Error('Alert cannot be resolved in its current status');
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;

    return alert;
  }

  // Dismiss an alert
  async dismissAlert(alertId: string, dismissedBy: string): Promise<PerformanceAlert> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.status === 'resolved' || alert.status === 'dismissed') {
      throw new Error('Alert cannot be dismissed in its current status');
    }

    alert.status = 'dismissed';
    alert.dismissedAt = new Date();

    return alert;
  }

  // Create a custom alert
  async createCustomAlert(
    category: 'api' | 'database' | 'system' | 'frontend' | 'custom',
    title: string,
    description: string,
    metric: string,
    currentValue: number,
    threshold: number,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, any>
  ): Promise<PerformanceAlert> {
    const alert: PerformanceAlert = {
      id: this.generateId(),
      type: this.getAlertType(severity),
      category,
      title,
      description,
      metric,
      currentValue,
      threshold,
      severity,
      status: 'active',
      createdAt: new Date(),
      metadata
    };

    this.alerts.push(alert);
    return alert;
  }

  // Get alert summary
  getAlertSummary(): AlertSummary {
    const activeAlerts = this.alerts.filter(a => a.status === 'active');
    const acknowledgedAlerts = this.alerts.filter(a => a.status === 'acknowledged');
    const resolvedAlerts = this.alerts.filter(a => a.status === 'resolved');
    const dismissedAlerts = this.alerts.filter(a => a.status === 'dismissed');

    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical');
    const warningAlerts = this.alerts.filter(a => a.severity === 'medium');
    const infoAlerts = this.alerts.filter(a => a.severity === 'low');

    const alertsByCategory = this.alerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsBySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAlerts: this.alerts.length,
      activeAlerts: activeAlerts.length,
      acknowledgedAlerts: acknowledgedAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      dismissedAlerts: dismissedAlerts.length,
      criticalAlerts: criticalAlerts.length,
      warningAlerts: warningAlerts.length,
      infoAlerts: infoAlerts.length,
      alertsByCategory,
      alertsBySeverity,
      recentAlerts: this.alerts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
    };
  }

  // Get alerts with filtering
  getAlerts(filters?: {
    status?: string;
    severity?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): PerformanceAlert[] {
    let filteredAlerts = [...this.alerts];

    if (filters?.status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === filters.status);
    }

    if (filters?.severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
    }

    if (filters?.category) {
      filteredAlerts = filteredAlerts.filter(a => a.category === filters.category);
    }

    // Sort by creation date (newest first)
    filteredAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || filteredAlerts.length;
    
    return filteredAlerts.slice(offset, offset + limit);
  }

  // Get alert by ID
  getAlert(alertId: string): PerformanceAlert | undefined {
    return this.alerts.find(a => a.id === alertId);
  }

  // Get all rules
  getRules(): AlertRule[] {
    return this.rules;
  }

  // Get rule by ID
  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.find(r => r.id === ruleId);
  }

  // Create a new rule
  createRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: this.generateId()
    };

    this.rules.push(newRule);
    return newRule;
  }

  // Update a rule
  updateRule(ruleId: string, updates: Partial<AlertRule>): AlertRule {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    Object.assign(rule, updates);
    return rule;
  }

  // Delete a rule
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) {
      return false;
    }

    this.rules.splice(index, 1);
    return true;
  }

  // Get notification history
  getNotifications(alertId?: string): AlertNotification[] {
    if (alertId) {
      return this.notifications.filter(n => n.alertId === alertId);
    }
    return this.notifications;
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if monitoring is active
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  // Get monitoring status
  getMonitoringStatus(): { isActive: boolean; intervalMs?: number } {
    return {
      isActive: this.isMonitoring,
      intervalMs: this.monitoringInterval ? 30000 : undefined
    };
  }
}

export default PerformanceAlertService;
