import { useQuery, useMutation, useQueryClient } from 'react-query';
import { googleAnalyticsService } from '../services/googleAnalyticsService';
import { MetricsFilter, DateRange } from '../types/googleAnalytics';

export const useGoogleAnalytics = () => {
  const queryClient = useQueryClient();

  // Query key factory
  const getQueryKey = (filter: MetricsFilter) => ['google-analytics', 'metrics', filter];

  // Get metrics display data
  const useMetricsData = (filter: MetricsFilter) => {
    return useQuery({
      queryKey: getQueryKey(filter),
      queryFn: () => googleAnalyticsService.getMetricsDisplayData(filter),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      enabled: !!filter.propertyId && !!filter.dateRange.startDate && !!filter.dateRange.endDate,
    });
  };

  // Get metrics comparison data
  const useMetricsComparison = (
    propertyId: string,
    currentRange: DateRange,
    previousRange: DateRange
  ) => {
    return useQuery({
      queryKey: ['google-analytics', 'comparison', propertyId, currentRange, previousRange],
      queryFn: () => googleAnalyticsService.getMetricsComparison(
        propertyId,
        currentRange.startDate,
        currentRange.endDate,
        previousRange.startDate,
        previousRange.endDate
      ),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      enabled: !!propertyId && !!currentRange.startDate && !!currentRange.endDate && !!previousRange.startDate && !!previousRange.endDate,
    });
  };

  // Refresh metrics data
  const refreshMetrics = useMutation({
    mutationFn: (filter: MetricsFilter) => googleAnalyticsService.getMetricsDisplayData(filter),
    onSuccess: (data, filter) => {
      queryClient.setQueryData(getQueryKey(filter), data);
      queryClient.invalidateQueries(['google-analytics', 'metrics']);
    },
  });

  // Export metrics data
  const exportMetrics = useMutation({
    mutationFn: (filter: MetricsFilter) => googleAnalyticsService.exportMetricsCSV(filter),
    onSuccess: (csvData, filter) => {
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google-analytics-metrics-${filter.dateRange.startDate}-to-${filter.dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
  });

  // Check service health
  const useServiceHealth = () => {
    return useQuery({
      queryKey: ['google-analytics', 'health'],
      queryFn: () => googleAnalyticsService.checkHealth(),
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
  };

  // Invalidate and refetch all metrics data
  const invalidateMetrics = () => {
    queryClient.invalidateQueries(['google-analytics']);
  };

  // Prefetch metrics data for better UX
  const prefetchMetrics = (filter: MetricsFilter) => {
    queryClient.prefetchQuery({
      queryKey: getQueryKey(filter),
      queryFn: () => googleAnalyticsService.getMetricsDisplayData(filter),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    useMetricsData,
    useMetricsComparison,
    refreshMetrics,
    exportMetrics,
    useServiceHealth,
    invalidateMetrics,
    prefetchMetrics,
  };
};
