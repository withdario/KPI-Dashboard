import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  RefreshCw,
  Calendar,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { N8nDashboardFilters } from '../types/n8n';

interface WorkflowFiltersProps {
  filters: N8nDashboardFilters;
  onFiltersChange: (filters: N8nDashboardFilters) => void;
  onRefresh?: () => void;
  availableCategories?: string[];
  availablePriorities?: string[];
  isLoading?: boolean;
}

const WorkflowFilters: React.FC<WorkflowFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  availableCategories = [],
  availablePriorities = [],
  isLoading = false
}) => {
  const [localFilters, setLocalFilters] = useState<N8nDashboardFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof N8nDashboardFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    const newFilters = { 
      ...localFilters, 
      dateRange: { start, end } 
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusToggle = (status: string) => {
    const currentStatuses = localFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    handleFilterChange('status', newStatuses);
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = localFilters.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleFilterChange('category', newCategories);
  };

  const handlePriorityToggle = (priority: string) => {
    const currentPriorities = localFilters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    handleFilterChange('priority', newPriorities);
  };

  const clearFilters = () => {
    const clearedFilters: N8nDashboardFilters = {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.status && localFilters.status.length > 0) count += localFilters.status.length;
    if (localFilters.category && localFilters.category.length > 0) count += localFilters.category.length;
    if (localFilters.priority && localFilters.priority.length > 0) count += localFilters.priority.length;
    if (localFilters.search) count += 1;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Workflow Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {localFilters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={localFilters.dateRange.start}
                onChange={(e) => handleDateRangeChange(e.target.value, localFilters.dateRange.end)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="date"
                value={localFilters.dateRange.end}
                onChange={(e) => handleDateRangeChange(localFilters.dateRange.start, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['running', 'completed', 'failed', 'cancelled', 'waiting', 'error'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium border transition-colors
                    ${(localFilters.status || []).includes(status)
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }
                  `}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${(localFilters.category || []).includes(category)
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Priority Filter */}
          {availablePriorities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePriorities.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityToggle(priority)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${(localFilters.priority || []).includes(priority)
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }
                    `}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="pt-2 border-t">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowFilters;
