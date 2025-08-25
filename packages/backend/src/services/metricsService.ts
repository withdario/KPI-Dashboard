import { PrismaClient } from '@prisma/client';
import {
  Metric,
  AutomationExecution,
  DataArchive,
  CreateMetricInput,
  CreateAutomationExecutionInput,
  CreateDataArchiveInput,
  MetricQuery,
  AutomationExecutionQuery,
  DataArchiveQuery,
  MetricsResponse,
  AutomationExecutionsResponse,
  DataArchivesResponse
} from '../types/metrics';

export class MetricsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Metrics Management
  async createMetric(input: CreateMetricInput): Promise<Metric> {
    const metric = await this.prisma.metric.create({
      data: {
        businessEntityId: input.businessEntityId,
        metricType: input.metricType,
        metricName: input.metricName,
        metricValue: input.metricValue,
        metricUnit: input.metricUnit || null,
        source: input.source,
        sourceId: input.sourceId || null,
        date: input.date,
        timezone: input.timezone || 'UTC',
        metadata: input.metadata || {},
        tags: input.tags || []
      }
    });

    return metric as Metric;
  }

  async getMetrics(query: MetricQuery): Promise<MetricsResponse> {
    const where: any = {
      businessEntityId: query.businessEntityId,
      isArchived: query.isArchived || false
    };

    if (query.metricType) {
      where.metricType = query.metricType;
    }

    if (query.source) {
      where.source = query.source;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = query.startDate;
      }
      if (query.endDate) {
        where.date.lte = query.endDate;
      }
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = {
        hasSome: query.tags
      };
    }

    const [metrics, total] = await Promise.all([
      this.prisma.metric.findMany({
        where,
        orderBy: { date: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0
      }),
      this.prisma.metric.count({ where })
    ]);

    const page = Math.floor((query.offset || 0) / (query.limit || 100)) + 1;
    const hasMore = (query.offset || 0) + (query.limit || 100) < total;

    return {
      metrics: metrics as Metric[],
      total,
      page,
      limit: query.limit || 100,
      hasMore
    };
  }

  async getMetricById(id: string): Promise<Metric | null> {
    const metric = await this.prisma.metric.findUnique({
      where: { id }
    });
    return metric as Metric | null;
  }

  async updateMetric(id: string, updates: Partial<CreateMetricInput>): Promise<Metric> {
    const metric = await this.prisma.metric.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
    return metric as Metric;
  }

  async archiveMetric(id: string): Promise<Metric> {
    const metric = await this.prisma.metric.update({
      where: { id },
      data: {
        isArchived: true,
        updatedAt: new Date()
      }
    });
    return metric as Metric;
  }

  async deleteMetric(id: string): Promise<void> {
    await this.prisma.metric.delete({
      where: { id }
    });
  }

  // Automation Executions Management
  async createAutomationExecution(input: CreateAutomationExecutionInput): Promise<AutomationExecution> {
    const execution = await this.prisma.automationExecution.create({
      data: {
        businessEntityId: input.businessEntityId,
        automationType: input.automationType,
        automationName: input.automationName,
        executionId: input.executionId,
        status: input.status,
        startTime: input.startTime,
        endTime: input.endTime || null,
        duration: input.duration || null,
        triggerType: input.triggerType,
        triggerData: input.triggerData || {},
        inputData: input.inputData || {},
        outputData: input.outputData || {},
        errorMessage: input.errorMessage || null,
        errorCode: input.errorCode || null,
        retryCount: input.retryCount || 0,
        maxRetries: input.maxRetries || 3,
        nextRetryAt: input.nextRetryAt || null,
        metadata: input.metadata || {},
        tags: input.tags || []
      }
    });

    return execution as AutomationExecution;
  }

  async getAutomationExecutions(query: AutomationExecutionQuery): Promise<AutomationExecutionsResponse> {
    const where: any = {
      businessEntityId: query.businessEntityId,
      isArchived: query.isArchived || false
    };

    if (query.automationType) {
      where.automationType = query.automationType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.triggerType) {
      where.triggerType = query.triggerType;
    }

    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) {
        where.startTime.gte = query.startDate;
      }
      if (query.endDate) {
        where.startTime.lte = query.endDate;
      }
    }

    const [executions, total] = await Promise.all([
      this.prisma.automationExecution.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0
      }),
      this.prisma.automationExecution.count({ where })
    ]);

    const page = Math.floor((query.offset || 0) / (query.limit || 100)) + 1;
    const hasMore = (query.offset || 0) + (query.limit || 100) < total;

    return {
      executions: executions as AutomationExecution[],
      total,
      page,
      limit: query.limit || 100,
      hasMore
    };
  }

  async getAutomationExecutionById(id: string): Promise<AutomationExecution | null> {
    const execution = await this.prisma.automationExecution.findUnique({
      where: { id }
    });
    return execution as AutomationExecution | null;
  }

  async updateAutomationExecution(id: string, updates: Partial<CreateAutomationExecutionInput>): Promise<AutomationExecution> {
    const execution = await this.prisma.automationExecution.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });
    return execution as AutomationExecution;
  }

  async updateAutomationExecutionStatus(id: string, status: any, endTime?: Date, duration?: number): Promise<AutomationExecution> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (endTime) {
      updateData.endTime = endTime;
    }

    if (duration !== undefined) {
      updateData.duration = duration;
    }

    const execution = await this.prisma.automationExecution.update({
      where: { id },
      data: updateData
    });
    return execution as AutomationExecution;
  }

  async archiveAutomationExecution(id: string): Promise<AutomationExecution> {
    const execution = await this.prisma.automationExecution.update({
      where: { id },
      data: {
        isArchived: true,
        updatedAt: new Date()
      }
    });
    return execution as AutomationExecution;
  }

  // Data Archival Management
  async createDataArchive(input: CreateDataArchiveInput): Promise<DataArchive> {
    const archive = await this.prisma.dataArchive.create({
      data: {
        businessEntityId: input.businessEntityId,
        archiveType: input.archiveType,
        sourceTable: input.sourceTable,
        sourceRecordId: input.sourceRecordId,
        archivedData: input.archivedData,
        archiveDate: input.archiveDate,
        retentionPolicy: input.retentionPolicy,
        compressionRatio: input.compressionRatio || null,
        storageLocation: input.storageLocation || null,
        isRestorable: input.isRestorable !== undefined ? input.isRestorable : true
      }
    });

    return archive as DataArchive;
  }

  async getDataArchives(query: DataArchiveQuery): Promise<DataArchivesResponse> {
    const where: any = {
      businessEntityId: query.businessEntityId
    };

    if (query.archiveType) {
      where.archiveType = query.archiveType;
    }

    if (query.sourceTable) {
      where.sourceTable = query.sourceTable;
    }

    if (query.isRestorable !== undefined) {
      where.isRestorable = query.isRestorable;
    }

    if (query.startDate || query.endDate) {
      where.archiveDate = {};
      if (query.startDate) {
        where.archiveDate.gte = query.startDate;
      }
      if (query.endDate) {
        where.archiveDate.lte = query.endDate;
      }
    }

    const [archives, total] = await Promise.all([
      this.prisma.dataArchive.findMany({
        where,
        orderBy: { archiveDate: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0
      }),
      this.prisma.dataArchive.count({ where })
    ]);

    const page = Math.floor((query.offset || 0) / (query.limit || 100)) + 1;
    const hasMore = (query.offset || 0) + (query.limit || 100) < total;

    return {
      archives: archives as DataArchive[],
      total,
      page,
      limit: query.limit || 100,
      hasMore
    };
  }

  async getDataArchiveById(id: string): Promise<DataArchive | null> {
    const archive = await this.prisma.dataArchive.findUnique({
      where: { id }
    });
    return archive as DataArchive | null;
  }

  // Utility Methods
  async getMetricsSummary(businessEntityId: string, startDate: Date, endDate: Date): Promise<{
    totalMetrics: number;
    totalAutomations: number;
    successRate: number;
    averageExecutionTime: number;
  }> {
    const [metricsCount, automationsCount, successfulAutomations, executionTimes] = await Promise.all([
      this.prisma.metric.count({
        where: {
          businessEntityId,
          date: { gte: startDate, lte: endDate },
          isArchived: false
        }
      }),
      this.prisma.automationExecution.count({
        where: {
          businessEntityId,
          startTime: { gte: startDate, lte: endDate },
          isArchived: false
        }
      }),
      this.prisma.automationExecution.count({
        where: {
          businessEntityId,
          startTime: { gte: startDate, lte: endDate },
          status: 'completed',
          isArchived: false
        }
      }),
      this.prisma.automationExecution.aggregate({
        where: {
          businessEntityId,
          startTime: { gte: startDate, lte: endDate },
          duration: { not: null },
          isArchived: false
        },
        _avg: { duration: true }
      })
    ]);

    const successRate = automationsCount > 0 ? (successfulAutomations / automationsCount) * 100 : 0;
    const averageExecutionTime = executionTimes._avg.duration || 0;

    return {
      totalMetrics: metricsCount,
      totalAutomations: automationsCount,
      successRate,
      averageExecutionTime
    };
  }

  async getMetricsHistory(
    businessEntityId: string, 
    startDate: Date, 
    endDate: Date, 
    metricType?: string, 
    aggregation: string = 'daily'
  ): Promise<{
    period: string;
    metrics: {
      metricType: string;
      metricName: string;
      totalValue: number;
      averageValue: number;
      count: number;
    }[];
  }[]> {
    const where: any = {
      businessEntityId,
      date: { gte: startDate, lte: endDate },
      isArchived: false
    };

    if (metricType) {
      where.metricType = metricType;
    }

    // Get all metrics in the date range
    const metrics = await this.prisma.metric.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    // Group by aggregation period
    const groupedMetrics = new Map<string, any[]>();
    
    metrics.forEach(metric => {
      let period: string;
      
      if (aggregation === 'daily') {
        period = metric.date.toISOString().split('T')[0];
      } else if (aggregation === 'weekly') {
        const weekStart = new Date(metric.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        period = weekStart.toISOString().split('T')[0];
      } else if (aggregation === 'monthly') {
        period = `${metric.date.getFullYear()}-${String(metric.date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        period = metric.date.toISOString().split('T')[0]; // Default to daily
      }

      if (!groupedMetrics.has(period)) {
        groupedMetrics.set(period, []);
      }
      groupedMetrics.get(period)!.push(metric);
    });

    // Calculate aggregated values for each period
    const result = Array.from(groupedMetrics.entries()).map(([period, periodMetrics]) => {
      const metricGroups = new Map<string, any[]>();
      
      periodMetrics.forEach(metric => {
        const key = `${metric.metricType}:${metric.metricName}`;
        if (!metricGroups.has(key)) {
          metricGroups.set(key, []);
        }
        metricGroups.get(key)!.push(metric);
      });

      const aggregatedMetrics = Array.from(metricGroups.entries()).map(([key, metrics]) => {
        const [type, name] = key.split(':');
        const values = metrics.map(m => m.metricValue);
        const totalValue = values.reduce((sum, val) => sum + val, 0);
        const averageValue = totalValue / values.length;
        
        return {
          metricType: type,
          metricName: name,
          totalValue,
          averageValue,
          count: values.length
        };
      });

      return {
        period,
        metrics: aggregatedMetrics
      };
    });

    return result.sort((a, b) => a.period.localeCompare(b.period));
  }

  async getAutomationPerformance(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    automationType?: string
  ): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    totalTimeSaved: number;
    costSavings: number;
    topPerformingAutomations: {
      automationId: string;
      automationName: string;
      successRate: number;
      averageExecutionTime: number;
      totalExecutions: number;
    }[];
    performanceTrends: {
      date: string;
      successRate: number;
      averageExecutionTime: number;
      totalExecutions: number;
    }[];
  }> {
    const where: any = {
      businessEntityId,
      startTime: { gte: startDate, lte: endDate },
      isArchived: false
    };

    if (automationType) {
      where.automationType = automationType;
    }

    // Get all automation executions in the date range
    const executions = await this.prisma.automationExecution.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    // Calculate average execution time
    const completedExecutions = executions.filter(e => e.duration !== null);
    const averageExecutionTime = completedExecutions.length > 0 
      ? completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / completedExecutions.length 
      : 0;

    // Calculate total time saved (assuming each automation saves time)
    const totalTimeSaved = executions
      .filter(e => e.status === 'completed' && e.duration !== null)
      .reduce((sum, e) => sum + (e.duration || 0), 0);

    // Estimate cost savings (assuming $50/hour for manual work)
    const costSavings = (totalTimeSaved / 3600) * 50;

    // Group by automation for top performers
    const automationGroups = new Map<string, any[]>();
    executions.forEach(execution => {
      const key = execution.executionId || 'unknown';
      if (!automationGroups.has(key)) {
        automationGroups.set(key, []);
      }
      automationGroups.get(key)!.push(execution);
    });

    const topPerformingAutomations = Array.from(automationGroups.entries())
      .map(([executionId, automationExecutions]) => {
        const total = automationExecutions.length;
        const successful = automationExecutions.filter(e => e.status === 'completed').length;
        const successRate = total > 0 ? (successful / total) * 100 : 0;
        const completed = automationExecutions.filter(e => e.duration !== null);
        const averageExecutionTime = completed.length > 0 
          ? completed.reduce((sum, e) => sum + (e.duration || 0), 0) / completed.length 
          : 0;

        return {
          automationId: executionId,
          automationName: automationExecutions[0]?.automationName || 'Unknown Automation',
          successRate,
          averageExecutionTime,
          totalExecutions: total
        };
      })
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5); // Top 5 automations

    // Calculate performance trends by day
    const dailyGroups = new Map<string, any[]>();
    executions.forEach(execution => {
      const date = execution.startTime.toISOString().split('T')[0];
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(execution);
    });

    const performanceTrends = Array.from(dailyGroups.entries())
      .map(([date, dayExecutions]) => {
        const total = dayExecutions.length;
        const successful = dayExecutions.filter(e => e.status === 'completed').length;
        const successRate = total > 0 ? (successful / total) * 100 : 0;
        const completed = dayExecutions.filter(e => e.duration !== null);
        const averageExecutionTime = completed.length > 0 
          ? completed.reduce((sum, e) => sum + (e.duration || 0), 0) / completed.length 
          : 0;

        return {
          date,
          successRate,
          averageExecutionTime,
          totalExecutions: total
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate,
      averageExecutionTime,
      totalTimeSaved,
      costSavings,
      topPerformingAutomations,
      performanceTrends
    };
  }

  async getBusinessInsights(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    _insightType?: string
  ): Promise<{
    roiMetrics: {
      automationROI: number;
      timeSavings: number;
      costSavings: number;
      efficiencyGain: number;
    };
    trends: {
      metric: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      changePercentage: number;
      recommendation: string;
    }[];
    recommendations: {
      category: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
      effort: string;
    }[];
    alerts: {
      type: 'warning' | 'critical' | 'info';
      message: string;
      metric: string;
      threshold: number;
      currentValue: number;
    }[];
  }> {
    // Get automation data for insights
    const automations = await this.prisma.automationExecution.findMany({
      where: {
        businessEntityId,
        startTime: { gte: startDate, lte: endDate },
        isArchived: false
      },
      orderBy: { startTime: 'asc' }
    });

    // Calculate ROI metrics
    const totalTimeSaved = automations
      .filter(e => e.status === 'completed' && e.duration !== null)
      .reduce((sum, e) => sum + (e.duration || 0), 0);
    
    const costSavings = (totalTimeSaved / 3600) * 50; // $50/hour assumption
    const automationROI = costSavings > 0 ? (costSavings / 100) * 100 : 0; // Assuming $100 investment
    const efficiencyGain = automations.length > 0 ? (totalTimeSaved / (automations.length * 300)) * 100 : 0; // 5 min per task assumption

    // Analyze trends
    const trends: any[] = [];
    
    // Analyze automation success rate trend
    if (automations.length > 0) {
      const midPoint = Math.floor(automations.length / 2);
      const firstHalf = automations.slice(0, midPoint);
      const secondHalf = automations.slice(midPoint);
      
      const firstHalfSuccess = firstHalf.filter(e => e.status === 'completed').length / firstHalf.length;
      const secondHalfSuccess = secondHalf.filter(e => e.status === 'completed').length / secondHalf.length;
      
      const changePercentage = ((secondHalfSuccess - firstHalfSuccess) / firstHalfSuccess) * 100;
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let recommendation = 'Maintain current automation performance';
      
      if (changePercentage > 5) {
        trend = 'increasing';
        recommendation = 'Excellent automation performance improvement. Consider expanding automation to other areas.';
      } else if (changePercentage < -5) {
        trend = 'decreasing';
        recommendation = 'Automation performance declining. Review failed workflows and optimize processes.';
      }
      
      trends.push({
        metric: 'Automation Success Rate',
        trend,
        changePercentage,
        recommendation
      });
    }

    // Generate recommendations
    const recommendations = [];
    
    if (automationROI < 100) {
      recommendations.push({
        category: 'ROI',
        priority: 'high' as const,
        title: 'Optimize Automation ROI',
        description: 'Current automation ROI is below 100%. Focus on high-impact workflows.',
        impact: 'High - Improve cost efficiency',
        effort: 'Medium - Process optimization'
      });
    }
    
    if (efficiencyGain < 20) {
      recommendations.push({
        category: 'Efficiency',
        priority: 'medium' as const,
        title: 'Improve Process Efficiency',
        description: 'Automation efficiency gain is below 20%. Review workflow design.',
        impact: 'Medium - Better resource utilization',
        effort: 'Low - Workflow analysis'
      });
    }

    // Generate alerts
    const alerts = [];
    
    if (automationROI < 50) {
      alerts.push({
        type: 'critical' as const,
        message: 'Automation ROI critically low',
        metric: 'ROI',
        threshold: 50,
        currentValue: automationROI
      });
    }
    
    if (efficiencyGain < 10) {
      alerts.push({
        type: 'warning' as const,
        message: 'Low automation efficiency',
        metric: 'Efficiency Gain',
        threshold: 10,
        currentValue: efficiencyGain
      });
    }

    return {
      roiMetrics: {
        automationROI,
        timeSavings: totalTimeSaved,
        costSavings,
        efficiencyGain
      },
      trends,
      recommendations,
      alerts
    };
  }

  async exportMetrics(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    format: string,
    metricType?: string
  ): Promise<string> {
    const where: any = {
      businessEntityId,
      date: { gte: startDate, lte: endDate },
      isArchived: false
    };

    if (metricType) {
      where.metricType = metricType;
    }

    const metrics = await this.prisma.metric.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    if (format === 'csv') {
      // Generate CSV format
      const headers = ['Date', 'Metric Type', 'Metric Name', 'Value', 'Unit', 'Source', 'Tags'];
      const csvRows = [headers.join(',')];
      
      metrics.forEach(metric => {
        const row = [
          metric.date.toISOString().split('T')[0],
          metric.metricType,
          metric.metricName,
          metric.metricValue,
          metric.metricUnit || '',
          metric.source,
          (metric.tags || []).join(';')
        ].map(field => `"${field}"`).join(',');
        
        csvRows.push(row);
      });
      
      return csvRows.join('\n');
    } else if (format === 'json') {
      // Generate JSON format
      return JSON.stringify(metrics, null, 2);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async exportAutomationData(
    businessEntityId: string,
    startDate: Date,
    endDate: Date,
    format: string,
    automationType?: string
  ): Promise<string> {
    const where: any = {
      businessEntityId,
      startTime: { gte: startDate, lte: endDate },
      isArchived: false
    };

    if (automationType) {
      where.automationType = automationType;
    }

    const automations = await this.prisma.automationExecution.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });

    if (format === 'csv') {
      // Generate CSV format
      const headers = ['Start Time', 'End Time', 'Duration', 'Status', 'Automation Type', 'Execution ID', 'Automation Name', 'Error Message'];
      const csvRows = [headers.join(',')];
      
      automations.forEach(automation => {
        const row = [
          automation.startTime.toISOString(),
          automation.endTime?.toISOString() || '',
          automation.duration || '',
          automation.status,
          automation.automationType,
          automation.executionId || '',
          automation.automationName || '',
          automation.errorMessage || ''
        ].map(field => `"${field}"`).join(',');
        
        csvRows.push(row);
      });
      
      return csvRows.join('\n');
    } else if (format === 'json') {
      // Generate JSON format
      return JSON.stringify(automations, null, 2);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async cleanupOldData(businessEntityId: string, retentionDays: number): Promise<{
    archivedMetrics: number;
    archivedAutomations: number;
    archivedWebhooks: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Archive old metrics
    const oldMetrics = await this.prisma.metric.findMany({
      where: {
        businessEntityId,
        date: { lt: cutoffDate },
        isArchived: false
      }
    });

    const archivedMetrics = oldMetrics.length;
    for (const metric of oldMetrics) {
      await this.prisma.metric.update({
        where: { id: metric.id },
        data: { isArchived: true, updatedAt: new Date() }
      });

      // Create archive record
      await this.createDataArchive({
        businessEntityId: metric.businessEntityId,
        archiveType: 'metrics',
        sourceTable: 'metrics',
        sourceRecordId: metric.id,
        archivedData: metric,
        archiveDate: new Date(),
        retentionPolicy: `${retentionDays}_days`
      });
    }

    // Archive old automation executions
    const oldAutomations = await this.prisma.automationExecution.findMany({
      where: {
        businessEntityId,
        startTime: { lt: cutoffDate },
        isArchived: false
      }
    });

    const archivedAutomations = oldAutomations.length;
    for (const automation of oldAutomations) {
      await this.prisma.automationExecution.update({
        where: { id: automation.id },
        data: { isArchived: true, updatedAt: new Date() }
      });

      // Create archive record
      await this.createDataArchive({
        businessEntityId: automation.businessEntityId,
        archiveType: 'automation_executions',
        sourceTable: 'automation_executions',
        sourceRecordId: automation.id,
        archivedData: automation,
        archiveDate: new Date(),
        retentionPolicy: `${retentionDays}_days`
      });
    }

    // Archive old webhook events (from existing n8n webhook events)
    const oldWebhooks = await this.prisma.n8nWebhookEvent.findMany({
      where: {
        n8nIntegration: {
          businessEntityId
        },
        startTime: { lt: cutoffDate }
      }
    });

    const archivedWebhooks = oldWebhooks.length;
    for (const webhook of oldWebhooks) {
      // Create archive record
      await this.createDataArchive({
        businessEntityId,
        archiveType: 'webhook_events',
        sourceTable: 'n8n_webhook_events',
        sourceRecordId: webhook.id,
        archivedData: webhook,
        archiveDate: new Date(),
        retentionPolicy: `${retentionDays}_days`
      });
    }

    return {
      archivedMetrics,
      archivedAutomations,
      archivedWebhooks
    };
  }
}
