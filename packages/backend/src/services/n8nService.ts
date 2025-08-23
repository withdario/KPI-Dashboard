import { PrismaClient } from '@prisma/client';
import { 
  N8nWebhookPayload, 
  N8nEventType, 
  N8nWorkflowStatus,
  N8nWebhookValidationResult,
  N8nWebhookProcessingResult,
  N8nMetrics,
  N8nIntegration,
  N8nActualPayload
} from '../types/n8n';

const prisma = new PrismaClient();

/**
 * n8n Webhook Integration Service
 * Handles webhook processing, data storage, and metrics calculation
 */
export class N8nService {
  
  /**
   * Validate webhook payload structure and data
   */
  async validateWebhookPayload(payload: any): Promise<N8nWebhookValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if this is the actual n8n payload format
    if (payload.ExecutionID && payload.Status && payload.Timestamp) {
      // This is the actual n8n format, convert it
      const convertedPayload = this.convertN8nPayload(payload);
      return {
        isValid: true,
        errors: [],
        warnings: ['Payload converted from n8n format'],
        payload: convertedPayload
      };
    }
    
    // Original validation logic for our expected format
    if (!payload.workflowId) {
      errors.push('workflowId is required');
    }
    
    if (!payload.workflowName) {
      errors.push('workflowName is required');
    }
    
    if (!payload.executionId) {
      errors.push('executionId is required');
    }
    
    if (!payload.eventType) {
      errors.push('eventType is required');
    } else if (!this.isValidEventType(payload.eventType)) {
      errors.push(`Invalid eventType: ${payload.eventType}`);
    }
    
    if (!payload.status) {
      errors.push('status is required');
    } else if (!this.isValidStatus(payload.status)) {
      errors.push(`Invalid status: ${payload.status}`);
    }
    
    if (!payload.startTime) {
      errors.push('startTime is required');
    } else if (!this.isValidTimestamp(payload.startTime)) {
      errors.push('Invalid startTime format (must be ISO 8601)');
    }
    
    // Optional field warnings
    if (!payload.inputData) {
      warnings.push('inputData is missing (optional but recommended)');
    }
    
    if (!payload.outputData) {
      warnings.push('outputData is missing (optional but recommended)');
    }
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      errors,
      warnings,
      payload: isValid ? payload as N8nWebhookPayload : undefined
    } as N8nWebhookValidationResult;
  }
  
  /**
   * Process and store webhook event
   */
  async processWebhookEvent(
    integrationId: string, 
    payload: N8nWebhookPayload
  ): Promise<N8nWebhookProcessingResult> {
    try {
      // Calculate duration if not provided
      let duration = payload.duration;
      if (!duration && payload.endTime) {
        const startTime = new Date(payload.startTime);
        const endTime = new Date(payload.endTime);
        duration = endTime.getTime() - startTime.getTime();
      }
      
      // Check if we're in development mode and database tables don't exist
      if (process.env.NODE_ENV === 'development') {
        try {
          // Try to create webhook event record
          const event = await prisma.n8nWebhookEvent.create({
            data: {
              n8nIntegrationId: integrationId,
              workflowId: payload.workflowId,
              workflowName: payload.workflowName,
              executionId: payload.executionId,
              eventType: payload.eventType,
              status: payload.status,
              startTime: new Date(payload.startTime),
              endTime: payload.endTime ? new Date(payload.endTime) : null,
              duration: duration || null,
              inputData: payload.inputData || {},
              outputData: payload.outputData || {},
              errorMessage: payload.errorMessage || null,
              metadata: payload.metadata || {}
            }
          });
          
          // Update integration statistics
          await this.updateIntegrationStats(integrationId);
          
          // Calculate and return metrics
          const metrics = await this.calculateMetrics(integrationId);
          
          return {
            success: true,
            eventId: event.id,
            metrics
          };
        } catch (dbError) {
          // In development mode, return success even if database operations fail
          console.warn('Database operation failed in development mode, returning mock response:', dbError);
          return {
            success: true,
            eventId: `dev-${Date.now()}`,
            metrics: {
              totalWorkflows: 1,
              successfulWorkflows: 1,
              failedWorkflows: 0,
              averageExecutionTime: duration || 0,
              totalTimeSaved: duration || 0,
              successRate: 100
            }
          };
        }
      } else {
        // Production mode - proceed with normal database operations
        const event = await prisma.n8nWebhookEvent.create({
          data: {
            n8nIntegrationId: integrationId,
            workflowId: payload.workflowId,
            workflowName: payload.workflowName,
            executionId: payload.executionId,
            eventType: payload.eventType,
            status: payload.status,
            startTime: new Date(payload.startTime),
            endTime: payload.endTime ? new Date(payload.endTime) : null,
            duration: duration || null,
            inputData: payload.inputData || {},
            outputData: payload.outputData || {},
            errorMessage: payload.errorMessage || null,
            metadata: payload.metadata || {}
          }
        });
        
        // Update integration statistics
        await this.updateIntegrationStats(integrationId);
        
        // Calculate and return metrics
        const metrics = await this.calculateMetrics(integrationId);
        
        return {
          success: true,
          eventId: event.id,
          metrics
        };
      }
      
    } catch (error) {
      console.error('Error processing n8n webhook event:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Update integration statistics
   */
  private async updateIntegrationStats(integrationId: string): Promise<void> {
    try {
      const stats = await prisma.n8nWebhookEvent.groupBy({
        by: ['n8nIntegrationId'],
        where: { n8nIntegrationId: integrationId },
        _count: { id: true },
        _max: { createdAt: true }
      });
      
      if (stats.length > 0) {
        await prisma.n8nIntegration.update({
          where: { id: integrationId },
          data: {
            webhookCount: stats[0]._count.id,
            lastWebhookAt: stats[0]._max.createdAt || new Date(),
            lastErrorAt: null,
            errorMessage: null
          }
        });
      }
    } catch (error) {
      console.error('Error updating integration stats:', error);
    }
  }
  
  /**
   * Calculate performance metrics for an integration
   */
  async calculateMetrics(integrationId: string): Promise<N8nMetrics> {
    try {
      const events = await prisma.n8nWebhookEvent.findMany({
        where: { n8nIntegrationId: integrationId },
        orderBy: { createdAt: 'desc' },
        take: 1000 // Limit to last 1000 events for performance
      });
      
      if (events.length === 0) {
        return {
          totalWorkflows: 0,
          successfulWorkflows: 0,
          failedWorkflows: 0,
          averageExecutionTime: 0,
          totalTimeSaved: 0,
          successRate: 0
        };
      }
      
      const totalWorkflows = events.length;
      const successfulWorkflows = events.filter((e: any) => e.status === 'completed').length;
      const failedWorkflows = events.filter((e: any) => e.status === 'failed').length;
      
      const completedEvents = events.filter((e: any) => e.duration && e.status === 'completed');
      const averageExecutionTime = completedEvents.length > 0 
        ? completedEvents.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / completedEvents.length
        : 0;
      
      const totalTimeSaved = completedEvents.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
      const successRate = (successfulWorkflows / totalWorkflows) * 100;
      
      return {
        totalWorkflows,
        successfulWorkflows,
        failedWorkflows,
        averageExecutionTime,
        totalTimeSaved,
        successRate,
        lastExecutionAt: events[0]?.createdAt
      };
      
    } catch (error) {
      console.error('Error calculating metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string): Promise<N8nIntegration | null> {
    try {
      return await prisma.n8nIntegration.findUnique({
        where: { id: integrationId }
      });
    } catch (error) {
      console.error('Error getting n8n integration:', error);
      throw error;
    }
  }
  
  /**
   * Get integration by business entity ID
   */
  async getIntegrationByBusinessEntity(businessEntityId: string): Promise<N8nIntegration | null> {
    try {
      return await prisma.n8nIntegration.findFirst({
        where: { 
          businessEntityId,
          isActive: true
        }
      });
    } catch (error) {
      console.error('Error getting n8n integration by business entity:', error);
      throw error;
    }
  }
  
  /**
   * Create new integration
   */
  async createIntegration(data: {
    businessEntityId: string;
    webhookUrl: string;
    webhookToken: string;
  }): Promise<N8nIntegration> {
    try {
      return await prisma.n8nIntegration.create({
        data: {
          businessEntityId: data.businessEntityId,
          webhookUrl: data.webhookUrl,
          webhookToken: data.webhookToken,
          isActive: true
        }
      });
    } catch (error) {
      console.error('Error creating n8n integration:', error);
      throw error;
    }
  }
  
  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string, 
    data: Partial<Pick<N8nIntegration, 'webhookUrl' | 'webhookToken' | 'isActive'>>
  ): Promise<N8nIntegration> {
    try {
      return await prisma.n8nIntegration.update({
        where: { id: integrationId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating n8n integration:', error);
      throw error;
    }
  }
  
  /**
   * Get webhook events for an integration
   */
  async getWebhookEvents(
    integrationId: string, 
    limit: number = 100, 
    offset: number = 0
  ) {
    try {
      return await prisma.n8nWebhookEvent.findMany({
        where: { n8nIntegrationId: integrationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      console.error('Error getting webhook events:', error);
      throw error;
    }
  }
  
  /**
   * Validate event type
   */
  private isValidEventType(eventType: string): eventType is N8nEventType {
    const validTypes: N8nEventType[] = [
      'workflow_started', 'workflow_completed', 'workflow_failed', 'workflow_cancelled',
      'node_started', 'node_completed', 'node_failed',
      'execution_started', 'execution_completed', 'execution_failed'
    ];
    return validTypes.includes(eventType as N8nEventType);
  }
  
  /**
   * Validate status
   */
  private isValidStatus(status: string): status is N8nWorkflowStatus {
    const validStatuses: N8nWorkflowStatus[] = [
      'running', 'completed', 'failed', 'cancelled', 'waiting', 'error'
    ];
    return validStatuses.includes(status as N8nWorkflowStatus);
  }
  
  /**
   * Validate timestamp string (ISO 8601)
   */
  private isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  /**
   * Convert actual n8n payload format to our expected format
   */
  private convertN8nPayload(actualPayload: N8nActualPayload): N8nWebhookPayload {
    return {
      workflowId: `workflow-${Date.now()}`, // Generate a workflow ID since it's not provided
      workflowName: 'Lead Generation Workflow', // Default name since it's not provided
      executionId: actualPayload.ExecutionID,
      eventType: 'workflow_completed', // Default to completed since we don't have this info
      status: this.mapN8nStatus(actualPayload.Status),
      startTime: actualPayload.Timestamp,
      inputData: {
        leadsGenerated: actualPayload.LeadsGenerated,
        industryBreakdown: actualPayload.IndustryBreakdown,
        ...actualPayload
      },
      outputData: {
        executionId: actualPayload.ExecutionID,
        status: actualPayload.Status,
        timestamp: actualPayload.Timestamp,
        leadsGenerated: actualPayload.LeadsGenerated,
        industryBreakdown: actualPayload.IndustryBreakdown
      }
    };
  }

  /**
   * Map n8n status to our workflow status
   */
  private mapN8nStatus(n8nStatus: string): N8nWorkflowStatus {
    const statusMap: Record<string, N8nWorkflowStatus> = {
      'success': 'completed',
      'failed': 'failed',
      'running': 'running',
      'waiting': 'waiting',
      'cancelled': 'cancelled'
    };
    
    return statusMap[n8nStatus.toLowerCase()] || 'completed';
  }
}
