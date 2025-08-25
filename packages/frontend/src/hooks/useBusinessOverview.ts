import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import BusinessOverviewService from '../services/businessOverviewService';
import { BusinessOverviewData, BusinessOverviewFilters } from '../types/businessOverview';

const businessOverviewService = new BusinessOverviewService();

export const useBusinessOverview = (filters: BusinessOverviewFilters) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Main business overview data query
  const {
    data: businessOverview,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['businessOverview', filters],
    queryFn: () => businessOverviewService.getBusinessOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Export functionality
  const exportMutation = useMutation({
    mutationFn: (exportFilters: BusinessOverviewFilters) => 
      businessOverviewService.exportBusinessOverview(exportFilters),
    onSuccess: (csvData) => {
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-overview-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error('Export failed:', error);
    }
  });

  // Manual refresh function
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Invalidate and refetch data
  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['businessOverview'] });
    refetch();
  };

  // Get filtered KPIs by category
  const getKPIsByCategory = (category: string) => {
    if (!businessOverview?.kpis) return [];
    return businessOverview.kpis.filter(kpi => kpi.category === category);
  };

  // Get KPIs with specific status
  const getKPIsByStatus = (status: 'good' | 'warning' | 'critical') => {
    if (!businessOverview?.kpis) return [];
    return businessOverview.kpis.filter(kpi => kpi.status === status);
  };

  // Get high-priority recommendations
  const getHighPriorityRecommendations = () => {
    if (!businessOverview?.recommendations) return [];
    return businessOverview.recommendations.filter(rec => rec.impact === 'high');
  };

  // Get goals by status
  const getGoalsByStatus = (status: string) => {
    if (!businessOverview?.goals) return [];
    return businessOverview.goals.filter(goal => goal.status === status);
  };

  // Get custom metrics by category
  const getCustomMetricsByCategory = (category: string) => {
    if (!businessOverview?.customMetrics) return [];
    return businessOverview.customMetrics.filter(metric => metric.category === category);
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!businessOverview) return null;

    const totalKPIs = businessOverview.kpis.length;
    const goodKPIs = businessOverview.kpis.filter(kpi => kpi.status === 'good').length;
    const warningKPIs = businessOverview.kpis.filter(kpi => kpi.status === 'warning').length;
    const criticalKPIs = businessOverview.kpis.filter(kpi => kpi.status === 'critical').length;

    const onTrackGoals = businessOverview.goals.filter(goal => goal.status === 'on-track').length;
    const totalGoals = businessOverview.goals.length;

    const actionableRecommendations = businessOverview.recommendations.filter(rec => rec.actionable).length;

    return {
      totalKPIs,
      goodKPIs,
      warningKPIs,
      criticalKPIs,
      kpiHealthPercentage: totalKPIs > 0 ? Math.round((goodKPIs / totalKPIs) * 100) : 0,
      onTrackGoals,
      totalGoals,
      goalsProgressPercentage: totalGoals > 0 ? Math.round((onTrackGoals / totalGoals) * 100) : 0,
      actionableRecommendations
    };
  };

  // Get trend data for specific metric
  const getTrendData = (metric: keyof BusinessOverviewData['trends'][0]) => {
    if (!businessOverview?.trends) return [];
    return businessOverview.trends.map(trend => ({
      date: trend.date,
      value: trend[metric]
    }));
  };

  // Check if data is stale
  const isDataStale = () => {
    if (!businessOverview?.lastUpdated) return true;
    const lastUpdated = new Date(businessOverview.lastUpdated);
    const now = new Date();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes
    return (now.getTime() - lastUpdated.getTime()) > staleThreshold;
  };

  return {
    // Data
    businessOverview,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error handling
    error,
    
    // Actions
    refreshData,
    invalidateAndRefetch,
    exportData: exportMutation.mutate,
    isExporting: exportMutation.isPending,
    
    // Filtered data getters
    getKPIsByCategory,
    getKPIsByStatus,
    getHighPriorityRecommendations,
    getGoalsByStatus,
    getCustomMetricsByCategory,
    
    // Computed values
    getSummaryStats,
    getTrendData,
    isDataStale,
    
    // Query utilities
    refetch
  };
};
