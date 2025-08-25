import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  DollarSign
} from 'lucide-react';
import { useN8nAutomation } from '../hooks/useN8nAutomation';
import { N8nDashboardFilters, N8nWorkflowStatus, N8nROICalculation } from '../types/n8n';
import WorkflowStatusCard from './WorkflowStatusCard';
import PerformanceAlerts from './PerformanceAlerts';
import ROIMetrics from './ROIMetrics';
import WorkflowFilters from './WorkflowFilters';
import DashboardWidget from './DashboardWidget';
import DashboardGrid from './DashboardGrid';

interface N8nAutomationDashboardProps {
  businessEntityId?: string;
  className?: string;
}

const N8nAutomationDashboard: React.FC<N8nAutomationDashboardProps> = ({
  businessEntityId,
  className = ''
}) => {
  const [filters, setFilters] = useState<N8nDashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  const {
    integration,
    metrics,
    workflows,
    alerts,
    roi,
    isLoading,
    hasError,
    refreshAll,
    exportMutation,
    getFilteredWorkflows
  } = useN8nAutomation(businessEntityId);

  const filteredWorkflows = getFilteredWorkflows(filters);

  // Extract available categories and priorities from workflows
  const availableCategories = Array.from(
    new Set(
      workflows
        ?.map(w => w.metadata?.category)
        .filter(Boolean) || []
    )
  ) as string[];

  const availablePriorities = Array.from(
    new Set(
      workflows
        ?.map(w => w.metadata?.priority)
        .filter(Boolean) || []
    )
  ) as string[];

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  const handleWorkflowClick = (workflow: N8nWorkflowStatus) => {
    // TODO: Implement workflow detail view
    console.log('Workflow clicked:', workflow);
  };

  const handleROIClick = (roiData: N8nROICalculation) => {
    // TODO: Implement ROI detail view
    console.log('ROI clicked:', roiData);
  };

  const handleAlertClick = (alert: any) => {
    // TODO: Implement alert detail view
    console.log('Alert clicked:', alert);
  };

  const handleResolveAlert = (alertId: string) => {
    // TODO: Implement alert resolution
    console.log('Resolve alert:', alertId);
  };

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700 mb-4">
          There was an error loading the automation dashboard. Please check your connection and try again.
        </p>
        <button
          onClick={refreshAll}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">n8n Automation Dashboard</h1>
          <p className="text-gray-600">
            Monitor workflow performance, track ROI, and manage automation health
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshAll}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            disabled={isLoading || exportMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportMutation.isPending ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <DashboardGrid cols={4} gap="lg">
        <DashboardGrid.Item>
          <DashboardWidget
            title="Active Workflows"
            subtitle="Currently running automations"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {metrics?.activeWorkflows || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                of {metrics?.totalWorkflows || 0} total
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Success Rate"
            subtitle="Average workflow success"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics?.successRate ? `${metrics.successRate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {metrics?.successfulWorkflows || 0} successful
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Time Saved"
            subtitle="Total automation time savings"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metrics?.totalTimeSaved ? 
                  `${(metrics.totalTimeSaved / (1000 * 60 * 60)).toFixed(1)}h` : '0h'
                }
              </div>
              <div className="text-sm text-gray-600 mt-1">
                This month
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Active Alerts"
            subtitle="Performance notifications"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {alerts?.filter(a => !a.isResolved).length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {alerts?.filter(a => a.severity === 'critical').length || 0} critical
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>

      {/* Filters */}
      <WorkflowFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={refreshAll}
        availableCategories={availableCategories}
        availablePriorities={availablePriorities}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <DashboardGrid cols={12} gap="lg">
        {/* Workflow Status Overview */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Workflow Status Overview"
            subtitle="Individual workflow performance and health"
          >
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredWorkflows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowStatusCard
                    key={workflow.id}
                    workflow={workflow}
                    onWorkflowClick={handleWorkflowClick}
                  />
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Found</h3>
                  <p className="text-gray-600">
                    {filters.search || filters.status?.length || filters.category?.length || filters.priority?.length
                      ? 'Try adjusting your filters or search terms.'
                      : 'No workflows have been configured yet.'
                    }
                  </p>
                </div>
              </div>
            )}
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Performance Alerts */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Performance Alerts"
            subtitle="Active notifications and warnings"
          >
            <PerformanceAlerts
              alerts={alerts || []}
              onAlertClick={handleAlertClick}
              onResolveAlert={handleResolveAlert}
              maxAlerts={5}
            />
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* ROI Metrics */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Automation ROI Analysis"
            subtitle="Return on investment calculations and cost savings"
          >
            {roi && roi.length > 0 ? (
              <ROIMetrics
                roiData={roi}
                onWorkflowClick={handleROIClick}
                showDetails={true}
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-center">
                <div>
                  <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No ROI data available yet.</p>
                </div>
              </div>
            )}
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>

      {/* Integration Status */}
      {integration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">n8n Integration Status</h4>
                <p className="text-sm text-blue-700">
                  Connected to {integration.webhookUrl} • 
                  {integration.isActive ? ' Active' : ' Inactive'} • 
                  {integration.webhookCount} webhooks received
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                integration.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {integration.isActive ? 'Connected' : 'Disconnected'}
              </span>
              
              {integration.lastWebhookAt && (
                <span className="text-xs text-blue-600">
                  Last: {new Date(integration.lastWebhookAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default N8nAutomationDashboard;
