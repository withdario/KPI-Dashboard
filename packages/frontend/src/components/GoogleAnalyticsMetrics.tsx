import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Settings, AlertCircle } from 'lucide-react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { MetricsFilter, DateRange, ChartDataPoint } from '../types/googleAnalytics';
import DateRangePicker from './DateRangePicker';
import MetricsCard from './MetricsCard';
import SimpleLineChart from './SimpleLineChart';

interface GoogleAnalyticsMetricsProps {
  propertyId: string;
  className?: string;
}

const GoogleAnalyticsMetrics: React.FC<GoogleAnalyticsMetricsProps> = ({
  propertyId,
  className = '',
}) => {
  const [filter, setFilter] = useState<MetricsFilter>({
    propertyId,
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      endDate: new Date().toISOString().split('T')[0], // today
    },
    includeEngagement: true,
    includeConversions: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minutes

  const {
    useMetricsData,
    useMetricsComparison,
    refreshMetrics,
    exportMetrics,
    useServiceHealth,
  } = useGoogleAnalytics();

  // Get current metrics data
  const { data: metricsData, isLoading, error, refetch } = useMetricsData(filter);

  // Get comparison data (current vs previous period)
  const previousRange = {
    startDate: new Date(new Date(filter.dateRange.startDate).getTime() - 
      (new Date(filter.dateRange.endDate).getTime() - new Date(filter.dateRange.startDate).getTime())).toISOString().split('T')[0],
    endDate: filter.dateRange.startDate,
  };

  const { data: comparisonData } = useMetricsComparison(
    propertyId,
    filter.dateRange,
    previousRange
  );

  // Check service health
  const { data: isHealthy } = useServiceHealth();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Handle date range change
  const handleDateRangeChange = (dateRange: DateRange) => {
    setFilter(prev => ({ ...prev, dateRange }));
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await refreshMetrics.mutateAsync(filter);
    } catch (error) {
      // Error handling is done by React Query
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportMetrics.mutateAsync(filter);
    } catch (error) {
      // Error handling is done by React Query
    }
  };

  // Convert metrics data to chart format
  const convertToChartData = (data: any[], metric: string): ChartDataPoint[] => {
    return data.map(item => ({
      date: item.date,
      value: item[metric] || 0,
      label: metric,
    }));
  };

  // Format duration in seconds to readable format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h2 className="text-lg font-medium">Error Loading Metrics</h2>
        </div>
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Google Analytics Metrics</h1>
          <p className="text-gray-600">Property ID: {propertyId}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={filter.dateRange}
            onChange={handleDateRangeChange}
          />
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleExport}
            disabled={isLoading || !metricsData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            title="Export data"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Settings</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
            
            {autoRefresh && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Interval:</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={1800}>30 minutes</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service health indicator */}
      {!isHealthy && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Google Analytics service may be experiencing issues</span>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      {metricsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Traffic Metrics */}
          <MetricsCard
            title="Sessions"
            value={metricsData.traffic.sessions}
            change={comparisonData?.traffic?.sessions?.change}
            changePercent={comparisonData?.traffic?.sessions?.changePercent}
            trend={comparisonData?.traffic?.sessions?.trend}
          />
          
          <MetricsCard
            title="Users"
            value={metricsData.traffic.users}
            change={comparisonData?.traffic?.users?.change}
            changePercent={comparisonData?.traffic?.users?.changePercent}
            trend={comparisonData?.traffic?.users?.trend}
          />
          
          <MetricsCard
            title="Pageviews"
            value={metricsData.traffic.pageviews}
            change={comparisonData?.traffic?.pageviews?.change}
            changePercent={comparisonData?.traffic?.pageviews?.changePercent}
            trend={comparisonData?.traffic?.pageviews?.trend}
          />

          {/* Engagement Metrics */}
          <MetricsCard
            title="Bounce Rate"
            value={metricsData.engagement.bounceRate}
            formatValue={formatPercentage}
            change={comparisonData?.engagement?.bounceRate?.change}
            changePercent={comparisonData?.engagement?.bounceRate?.changePercent}
            trend={comparisonData?.engagement?.bounceRate?.trend}
          />
          
          <MetricsCard
            title="Session Duration"
            value={metricsData.engagement.sessionDuration}
            formatValue={formatDuration}
            change={comparisonData?.engagement?.sessionDuration?.change}
            changePercent={comparisonData?.engagement?.sessionDuration?.changePercent}
            trend={comparisonData?.engagement?.sessionDuration?.trend}
          />
          
          <MetricsCard
            title="Pages per Session"
            value={metricsData.engagement.pagesPerSession}
            change={comparisonData?.engagement?.pagesPerSession?.change}
            changePercent={comparisonData?.engagement?.pagesPerSession?.changePercent}
            trend={comparisonData?.engagement?.pagesPerSession?.trend}
          />

          {/* Conversion Metrics */}
          <MetricsCard
            title="Conversion Rate"
            value={metricsData.conversions.conversionRate}
            formatValue={formatPercentage}
            change={comparisonData?.conversions?.conversionRate?.change}
            changePercent={comparisonData?.conversions?.conversionRate?.changePercent}
            trend={comparisonData?.conversions?.conversionRate?.trend}
          />
          
          <MetricsCard
            title="Goal Completions"
            value={metricsData.conversions.goalCompletions}
            change={comparisonData?.conversions?.goalCompletions?.change}
            changePercent={comparisonData?.conversions?.goalCompletions?.changePercent}
            trend={comparisonData?.conversions?.goalCompletions?.trend}
          />
          
          <MetricsCard
            title="Revenue"
            value={metricsData.conversions.revenue}
            formatValue={formatCurrency}
            change={comparisonData?.conversions?.revenue?.change}
            changePercent={comparisonData?.conversions?.revenue?.changePercent}
            trend={comparisonData?.conversions?.revenue?.trend}
          />
        </div>
      )}

      {/* Charts */}
      {metricsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleLineChart
            data={convertToChartData(metricsData.trends, 'sessions')}
            title="Sessions Trend"
            color="#3B82F6"
          />
          
          <SimpleLineChart
            data={convertToChartData(metricsData.trends, 'users')}
            title="Users Trend"
            color="#10B981"
          />
          
          <SimpleLineChart
            data={convertToChartData(metricsData.trends, 'pageviews')}
            title="Pageviews Trend"
            color="#F59E0B"
          />
          
          <SimpleLineChart
            data={convertToChartData(metricsData.trends, 'bounceRate')}
            title="Bounce Rate Trend"
            color="#EF4444"
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <MetricsCard
              key={index}
              title="Loading..."
              value={0}
              isLoading={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleAnalyticsMetrics;
