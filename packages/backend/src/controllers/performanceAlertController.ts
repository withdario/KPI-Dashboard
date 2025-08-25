import PerformanceAlertService from '../services/performanceAlertService';

export default class PerformanceAlertController {
  private alertService: PerformanceAlertService;

  constructor(alertService: PerformanceAlertService) {
    this.alertService = alertService;
  }

  // Get alert summary
  getAlertSummary() {
    return this.alertService.getAlertSummary();
  }

  // Get alerts with filtering
  getAlerts(filters?: any) {
    return this.alertService.getAlerts(filters);
  }

  // Get alert by ID
  getAlert(alertId: string) {
    if (!alertId) {
      throw new Error('Alert ID is required');
    }
    return this.alertService.getAlert(alertId);
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    if (!alertId || !acknowledgedBy) {
      throw new Error('Alert ID and acknowledgedBy are required');
    }
    return await this.alertService.acknowledgeAlert(alertId, acknowledgedBy);
  }

  // Resolve alert
  async resolveAlert(alertId: string, resolvedBy: string, resolutionNotes?: string) {
    if (!alertId || !resolvedBy) {
      throw new Error('Alert ID and resolvedBy are required');
    }
    return await this.alertService.resolveAlert(alertId, resolvedBy);
  }

  // Dismiss alert
  async dismissAlert(alertId: string, dismissedBy: string, dismissalReason?: string) {
    if (!alertId || !dismissedBy) {
      throw new Error('Alert ID and dismissedBy are required');
    }
    return await this.alertService.dismissAlert(alertId, dismissedBy);
  }

  // Create custom alert
  async createCustomAlert(
    category: 'api' | 'database' | 'system' | 'frontend' | 'custom',
    title: string,
    description: string,
    metric: string,
    currentValue: number,
    threshold: number,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, any>
  ) {
    if (!category || !title || !description || !metric || currentValue === undefined || threshold === undefined || !severity) {
      throw new Error('All required fields must be provided');
    }
    return await this.alertService.createCustomAlert(
      category, title, description, metric, currentValue, threshold, severity, metadata
    );
  }

  // Get all rules
  getRules() {
    return this.alertService.getRules();
  }

  // Get rule by ID
  getRule(ruleId: string) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }
    return this.alertService.getRule(ruleId);
  }

  // Create new rule
  createRule(ruleData: any) {
    if (!ruleData.name || !ruleData.category || !ruleData.metric || !ruleData.condition || 
        ruleData.threshold === undefined || !ruleData.severity) {
      throw new Error('Missing required rule fields');
    }
    return this.alertService.createRule(ruleData);
  }

  // Update rule
  updateRule(ruleId: string, updates: any) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }
    return this.alertService.updateRule(ruleId, updates);
  }

  // Delete rule
  deleteRule(ruleId: string) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }
    return this.alertService.deleteRule(ruleId);
  }

  // Get notification history
  getNotifications(alertId?: string) {
    return this.alertService.getNotifications(alertId);
  }

  // Get monitoring status
  getMonitoringStatus() {
    return this.alertService.getMonitoringStatus();
  }

  // Start monitoring
  startMonitoring(intervalMs?: number) {
    this.alertService.startMonitoring(intervalMs);
  }

  // Stop monitoring
  stopMonitoring() {
    this.alertService.stopMonitoring();
  }
}
