import { 
  N8nWorkflowStatus, 
  N8nExecutionMetrics, 
  N8nWorkflowEvent, 
  N8nIntegration,
  N8nPerformanceAlert,
  N8nROICalculation,
  N8nDashboardFilters,
  N8nExportData
} from '../types/n8n';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class N8nService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get n8n integration details for a business entity
   */
  async getIntegration(businessEntityId: string): Promise<N8nIntegration | null> {
    try {
      const response = await this.makeRequest<{ success: boolean; integration?: N8nIntegration }>(
        `/n8n/integration/${businessEntityId}`
      );
      return response.integration || null;
    } catch (error) {
      console.error('Error fetching n8n integration:', error);
      return null;
    }
  }

  /**
   * Get webhook events for an integration
   */
  async getWebhookEvents(
    integrationId: string, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<N8nWorkflowEvent[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; events: N8nWorkflowEvent[] }>(
        `/n8n/events/${integrationId}?limit=${limit}&offset=${offset}`
      );
      return response.events || [];
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      return [];
    }
  }

  /**
   * Get performance metrics for an integration
   */
  async getMetrics(integrationId: string): Promise<N8nExecutionMetrics | null> {
    try {
      const response = await this.makeRequest<{ success: boolean; metrics: N8nExecutionMetrics }>(
        `/n8n/metrics/${integrationId}`
      );
      return response.metrics || null;
    } catch (error) {
      console.error('Error fetching n8n metrics:', error);
      return null;
    }
  }

  /**
   * Get workflow status and performance data
   */
  async getWorkflowStatus(integrationId: string): Promise<N8nWorkflowStatus[]> {
    try {
      const events = await this.getWebhookEvents(integrationId, 1000);
      
      // Group events by workflow and calculate status
      const workflowMap = new Map<string, N8nWorkflowStatus>();
      
      events.forEach(event => {
        if (!workflowMap.has(event.workflowId)) {
          workflowMap.set(event.workflowId, {
            id: event.workflowId,
            name: event.workflowName,
            status: event.status,
            executionId: event.executionId,
            startTime: event.startTime,
            endTime: event.endTime,
            duration: event.duration,
            successRate: 0,
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0,
            timeSaved: 0,
            lastRun: event.createdAt,
            metadata: event.metadata
          });
        }
        
        const workflow = workflowMap.get(event.workflowId)!;
        workflow.totalExecutions++;
        
        if (event.status === 'completed') {
          workflow.successfulExecutions++;
        } else if (event.status === 'failed') {
          workflow.failedExecutions++;
        }
        
        if (event.duration) {
          workflow.timeSaved += event.duration;
        }
        
        // Update last run time
        if (new Date(event.createdAt) > new Date(workflow.lastRun)) {
          workflow.lastRun = event.createdAt;
        }
      });
      
      // Calculate derived metrics
      workflowMap.forEach(workflow => {
        workflow.successRate = workflow.totalExecutions > 0 
          ? (workflow.successfulExecutions / workflow.totalExecutions) * 100 
          : 0;
        
        workflow.averageExecutionTime = workflow.totalExecutions > 0 
          ? workflow.timeSaved / workflow.totalExecutions 
          : 0;
      });
      
      return Array.from(workflowMap.values());
    } catch (error) {
      console.error('Error calculating workflow status:', error);
      return [];
    }
  }

  /**
   * Calculate ROI for automation workflows
   */
  async calculateROI(integrationId: string): Promise<N8nROICalculation[]> {
    try {
      const workflows = await this.getWorkflowStatus(integrationId);
      const metrics = await this.getMetrics(integrationId);
      
      if (!metrics) return [];
      
      // Assume average hourly cost of $50 for manual work
      const HOURLY_COST = 50;
      const MILLISECONDS_PER_HOUR = 3600000;
      
      return workflows.map(workflow => {
        const timeSavedHours = workflow.timeSaved / MILLISECONDS_PER_HOUR;
        const estimatedCostSavings = timeSavedHours * HOURLY_COST;
        
        // Assume automation cost is $100 per workflow per month
        const automationCost = 100;
        const roi = estimatedCostSavings > 0 ? ((estimatedCostSavings - automationCost) / automationCost) * 100 : 0;
        const paybackPeriod = automationCost > 0 ? automationCost / (estimatedCostSavings / 12) : 0;
        
        return {
          workflowId: workflow.id,
          workflowName: workflow.name,
          timeSavedPerExecution: workflow.averageExecutionTime,
          totalExecutions: workflow.totalExecutions,
          totalTimeSaved: workflow.timeSaved,
          estimatedCostSavings,
          automationCost,
          roi,
          paybackPeriod
        };
      });
    } catch (error) {
      console.error('Error calculating ROI:', error);
      return [];
    }
  }

  /**
   * Get performance alerts based on thresholds
   */
  async getPerformanceAlerts(integrationId: string): Promise<N8nPerformanceAlert[]> {
    try {
      const workflows = await this.getWorkflowStatus(integrationId);
      const alerts: N8nPerformanceAlert[] = [];
      
      workflows.forEach(workflow => {
        // Success rate drop alert
        if (workflow.successRate < 90) {
          alerts.push({
            id: `alert-${workflow.id}-success-rate`,
            workflowId: workflow.id,
            workflowName: workflow.name,
            alertType: 'success_rate_drop',
            severity: workflow.successRate < 70 ? 'critical' : workflow.successRate < 80 ? 'high' : 'medium',
            message: `Success rate dropped to ${workflow.successRate.toFixed(1)}%`,
            threshold: 90,
            currentValue: workflow.successRate,
            triggeredAt: new Date().toISOString(),
            isResolved: false
          });
        }
        
        // Execution time increase alert
        if (workflow.averageExecutionTime > 10000) { // 10 seconds
          alerts.push({
            id: `alert-${workflow.id}-execution-time`,
            workflowId: workflow.id,
            workflowName: workflow.name,
            alertType: 'execution_time_increase',
            severity: workflow.averageExecutionTime > 30000 ? 'high' : 'medium',
            message: `Average execution time increased to ${(workflow.averageExecutionTime / 1000).toFixed(1)}s`,
            threshold: 10000,
            currentValue: workflow.averageExecutionTime,
            triggeredAt: new Date().toISOString(),
            isResolved: false
          });
        }
        
        // Failure spike alert
        if (workflow.failedExecutions > 5) {
          alerts.push({
            id: `alert-${workflow.id}-failure-spike`,
            workflowId: workflow.id,
            workflowName: workflow.name,
            alertType: 'failure_spike',
            severity: workflow.failedExecutions > 10 ? 'critical' : 'high',
            message: `Failure count increased to ${workflow.failedExecutions}`,
            threshold: 5,
            currentValue: workflow.failedExecutions,
            triggeredAt: new Date().toISOString(),
            isResolved: false
          });
        }
      });
      
      return alerts;
    } catch (error) {
      console.error('Error generating performance alerts:', error);
      return [];
    }
  }

  /**
   * Export automation data for reporting
   */
  async exportData(
    integrationId: string, 
    filters: N8nDashboardFilters
  ): Promise<N8nExportData | null> {
    try {
      const [workflows, metrics, events, alerts, roi] = await Promise.all([
        this.getWorkflowStatus(integrationId),
        this.getMetrics(integrationId),
        this.getWebhookEvents(integrationId, 1000),
        this.getPerformanceAlerts(integrationId),
        this.calculateROI(integrationId)
      ]);
      
      if (!metrics) return null;
      
      return {
        workflows,
        metrics,
        events,
        alerts,
        roi,
        exportDate: new Date().toISOString(),
        dateRange: filters.dateRange
      };
    } catch (error) {
      console.error('Error exporting automation data:', error);
      return null;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(payload: any): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ success: boolean }>(
        '/n8n/test/webhook',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );
      return response.success;
    } catch (error) {
      console.error('Error testing webhook:', error);
      return false;
    }
  }
}

export default new N8nService();
