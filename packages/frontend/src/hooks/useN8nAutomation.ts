import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import n8nService from '../services/n8nService';
import { 
  N8nDashboardFilters, 
  N8nExportData,
  N8nDashboardFilters as Filters 
} from '../types/n8n';

// Mock business entity ID for development
const MOCK_BUSINESS_ENTITY_ID = 'dev-business-123';

export const useN8nAutomation = (businessEntityId: string = MOCK_BUSINESS_ENTITY_ID) => {
  const queryClient = useQueryClient();

  // Get n8n integration
  const {
    data: integration,
    isLoading: integrationLoading,
    error: integrationError,
    refetch: refetchIntegration
  } = useQuery({
    queryKey: ['n8n', 'integration', businessEntityId],
    queryFn: () => n8nService.getIntegration(businessEntityId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });

  // Get execution metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['n8n', 'metrics', businessEntityId],
    queryFn: () => n8nService.getMetrics(integration?.id || ''),
    enabled: !!integration?.id,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 1000, // 15 seconds
  });

  // Get workflow status
  const {
    data: workflows,
    isLoading: workflowsLoading,
    error: workflowsError,
    refetch: refetchWorkflows
  } = useQuery({
    queryKey: ['n8n', 'workflows', businessEntityId],
    queryFn: () => n8nService.getWorkflowStatus(integration?.id || ''),
    enabled: !!integration?.id,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 1000, // 15 seconds
  });

  // Get performance alerts
  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['n8n', 'alerts', businessEntityId],
    queryFn: () => n8nService.getPerformanceAlerts(integration?.id || ''),
    enabled: !!integration?.id,
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Get ROI calculations
  const {
    data: roi,
    isLoading: roiLoading,
    error: roiError,
    refetch: refetchROI
  } = useQuery({
    queryKey: ['n8n', 'roi', businessEntityId],
    queryFn: () => n8nService.calculateROI(integration?.id || ''),
    enabled: !!integration?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Get webhook events with filters
  const getWebhookEvents = (filters: Filters, limit: number = 100, offset: number = 0) => {
    return useQuery({
      queryKey: ['n8n', 'events', businessEntityId, filters, limit, offset],
      queryFn: () => n8nService.getWebhookEvents(integration?.id || '', limit, offset),
      enabled: !!integration?.id,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: (filters: N8nDashboardFilters) => 
      n8nService.exportData(integration?.id || '', filters),
    onSuccess: (data) => {
      if (data) {
        // Trigger download
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `n8n-automation-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    onError: (error) => {
      console.error('Export failed:', error);
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (payload: any) => n8nService.testWebhook(payload),
    onSuccess: (success) => {
      if (success) {
        // Invalidate and refetch data
        queryClient.invalidateQueries({ queryKey: ['n8n', businessEntityId] });
      }
    }
  });

  // Refresh all data
  const refreshAll = () => {
    refetchIntegration();
    refetchMetrics();
    refetchWorkflows();
    refetchAlerts();
    refetchROI();
  };

  // Loading states
  const isLoading = integrationLoading || metricsLoading || workflowsLoading || alertsLoading || roiLoading;
  const hasError = integrationError || metricsError || workflowsError || alertsError || roiError;

  // Filtered workflows based on search and status
  const getFilteredWorkflows = (filters: Partial<N8nDashboardFilters> = {}) => {
    if (!workflows) return [];
    
    return workflows.filter(workflow => {
      // Search filter
      if (filters.search && !workflow.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status && filters.status.length > 0 && !filters.status.includes(workflow.status)) {
        return false;
      }
      
      // Category filter
      if (filters.category && filters.category.length > 0 && workflow.metadata?.category) {
        if (!filters.category.includes(workflow.metadata.category)) {
          return false;
        }
      }
      
      // Priority filter
      if (filters.priority && filters.priority.length > 0 && workflow.metadata?.priority) {
        if (!filters.priority.includes(workflow.metadata.priority)) {
          return false;
        }
      }
      
      return true;
    });
  };

  return {
    // Data
    integration,
    metrics,
    workflows,
    alerts,
    roi,
    
    // Loading states
    isLoading,
    integrationLoading,
    metricsLoading,
    workflowsLoading,
    alertsLoading,
    roiLoading,
    
    // Error states
    hasError,
    integrationError,
    metricsError,
    workflowsError,
    alertsError,
    roiError,
    
    // Actions
    refreshAll,
    refetchIntegration,
    refetchMetrics,
    refetchWorkflows,
    refetchAlerts,
    refetchROI,
    
    // Mutations
    exportMutation,
    testWebhookMutation,
    
    // Utilities
    getWebhookEvents,
    getFilteredWorkflows,
    
    // Computed values
    activeWorkflows: workflows?.filter(w => w.status === 'running') || [],
    failedWorkflows: workflows?.filter(w => w.status === 'failed') || [],
    criticalAlerts: alerts?.filter(a => a.severity === 'critical') || [],
    highROIWorkflows: roi?.filter(r => r.roi > 200) || []
  };
};
