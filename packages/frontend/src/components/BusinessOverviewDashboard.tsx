import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Filter, TrendingUp, BarChart3, Target, Lightbulb, Calculator } from 'lucide-react';
import { useBusinessOverview } from '../hooks/useBusinessOverview';
import { BusinessOverviewFilters } from '../types/businessOverview';
import BusinessHealthScore from './BusinessHealthScore';
import BusinessKPIsGrid from './BusinessKPIsGrid';
import BusinessGoals from './BusinessGoals';
import BusinessRecommendations from './BusinessRecommendations';
import CustomMetrics from './CustomMetrics';
import DateRangePicker from './DateRangePicker';
import { TOUCH_BUTTON, RESPONSIVE_SPACING, MOBILE_FIRST } from '@/utils/responsive';

interface BusinessOverviewDashboardProps {
  className?: string;
}

const BusinessOverviewDashboard: React.FC<BusinessOverviewDashboardProps> = ({ 
  className = '' 
}) => {
  const [filters, setFilters] = useState<BusinessOverviewFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0] // today
    },
    categories: [],
    includeCustomMetrics: true,
    includeRecommendations: true
  });

  const {
    businessOverview,
    isLoading,
    error,
    refreshData,
    exportData,
    isExporting,
    getSummaryStats,
    isDataStale
  } = useBusinessOverview(filters);

  const [activeTab, setActiveTab] = useState('overview');

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start: startDate, end: endDate }
    }));
  };

  const handleExport = () => {
    exportData(filters);
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const summaryStats = getSummaryStats();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Business Overview</div>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!businessOverview) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-600 text-lg font-medium mb-2">No Data Available</div>
          <p className="text-gray-600">Business overview data is not available for the selected date range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className={`bg-white rounded-lg shadow-sm border ${RESPONSIVE_SPACING.md}`}>
        <div className={`${MOBILE_FIRST.stack} items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0`}>
          <div className={`${MOBILE_FIRST.center}`}>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Business Overview</h1>
            <p className="text-gray-600 text-sm sm:text-base">Comprehensive view of your business performance and insights</p>
          </div>
          <div className={`${MOBILE_FIRST.stack} items-center space-y-2 sm:space-y-0 sm:space-x-3`}>
            {isDataStale() && (
              <div className="flex items-center space-x-2 text-yellow-600 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Data may be stale</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              className={`${TOUCH_BUTTON.secondary} space-x-2`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`${TOUCH_BUTTON.primary} space-x-2`}
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className={`${MOBILE_FIRST.stack} items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4`}>
          <DateRangePicker
            startDate={filters.dateRange.start}
            endDate={filters.dateRange.end}
            onDateRangeChange={handleDateRangeChange}
          />
          <div className="text-sm text-gray-500">
            Last updated: {new Date(businessOverview.lastUpdated).toLocaleString()}
          </div>
        </div>

        {/* Summary Stats */}
        {summaryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{summaryStats.kpiHealthPercentage}%</div>
              <div className="text-xs sm:text-sm text-blue-600">KPI Health</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{summaryStats.goalsProgressPercentage}%</div>
              <div className="text-xs sm:text-sm text-green-600">Goals Progress</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{summaryStats.actionableRecommendations}</div>
              <div className="text-xs sm:text-sm text-purple-600">Actionable Items</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{businessOverview.customMetrics.length}</div>
              <div className="text-xs sm:text-sm text-orange-600">Custom Metrics</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto space-x-4 sm:space-x-8 px-4 sm:px-6">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'kpis', label: 'KPIs', icon: BarChart3 },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'custom', label: 'Custom Metrics', icon: Calculator }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className={`${RESPONSIVE_SPACING.md}`}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <BusinessHealthScore healthScore={businessOverview.healthScore} />
              </div>
              <div className="lg:col-span-2">
                <BusinessKPIsGrid 
                  kpis={businessOverview.kpis.slice(0, 6)} 
                  showTargets={false}
                />
              </div>
            </div>
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <div className={`${MOBILE_FIRST.stack} items-start sm:items-center justify-between space-y-4 sm:space-y-0`}>
                <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
                <div className={`${MOBILE_FIRST.stack} items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-2`}>
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-2">
                    {['traffic', 'engagement', 'conversion', 'automation', 'business'].map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`px-3 py-2 rounded-full text-xs font-medium ${TOUCH_BUTTON.base} ${
                          filters.categories.includes(category)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <BusinessKPIsGrid 
                kpis={
                  filters.categories.length > 0
                    ? businessOverview.kpis.filter(kpi => filters.categories.includes(kpi.category))
                    : businessOverview.kpis
                }
                showTargets={true}
              />
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <BusinessGoals goals={businessOverview.goals} />
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <BusinessRecommendations 
              recommendations={businessOverview.recommendations}
              maxDisplay={10}
            />
          )}

          {/* Custom Metrics Tab */}
          {activeTab === 'custom' && (
            <CustomMetrics 
              customMetrics={businessOverview.customMetrics}
              onAddMetric={(metric) => {
                // In a real implementation, this would call an API
                console.log('Adding metric:', metric);
              }}
              onUpdateMetric={(id, updates) => {
                // In a real implementation, this would call an API
                console.log('Updating metric:', id, updates);
              }}
              onDeleteMetric={(id) => {
                // In a real implementation, this would call an API
                console.log('Deleting metric:', id);
              }}
              onToggleActive={(id, isActive) => {
                // In a real implementation, this would call an API
                console.log('Toggling metric:', id, isActive);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessOverviewDashboard;
