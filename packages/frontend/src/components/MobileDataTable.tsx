import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, SortAsc, SortDesc } from 'lucide-react';
import { TOUCH_BUTTON, RESPONSIVE_SPACING, MOBILE_FIRST } from '@/utils/responsive';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  mobilePriority?: 'high' | 'medium' | 'low';
}

interface MobileDataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  className?: string;
  itemsPerPage?: number;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onRowClick?: (row: any) => void;
  onExport?: () => void;
  loading?: boolean;
}

const MobileDataTable: React.FC<MobileDataTableProps> = ({
  data,
  columns,
  title,
  className = '',
  itemsPerPage = 10,
  searchable = true,
  filterable = true,
  exportable = true,
  onRowClick,
  onExport,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row => {
      if (!searchTerm) return true;
      
      return columns.some(column => {
        const value = row[column.key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        return false;
      });
    });

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(row => row[key] === value);
      }
    });

    // Sort data
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection, selectedFilters, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle filter change
  const handleFilterChange = (columnKey: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Get mobile priority columns
  const mobileColumns = useMemo(() => {
    return columns.filter(col => col.mobilePriority !== 'low');
  }, [columns]);

  // Get unique values for filter options
  const getFilterOptions = (columnKey: string) => {
    const values = [...new Set(data.map(row => row[columnKey]))];
    return values.filter(value => value !== null && value !== undefined);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className={`${RESPONSIVE_SPACING.md} border-b border-gray-200`}>
        <div className={`${MOBILE_FIRST.stack} items-center justify-between`}>
          {title && (
            <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">{title}</h3>
          )}
          
          <div className={`${MOBILE_FIRST.stack} items-center space-y-2 sm:space-y-0 sm:space-x-2`}>
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
            )}
            
            {/* Filter Toggle */}
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${TOUCH_BUTTON.secondary} space-x-2`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            )}
            
            {/* Export */}
            {exportable && onExport && (
              <button
                onClick={onExport}
                className={`${TOUCH_BUTTON.primary} space-x-2`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && filterable && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.map(column => {
                const options = getFilterOptions(column.key);
                if (options.length <= 1) return null;
                
                return (
                  <div key={column.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {column.label}
                    </label>
                    <select
                      value={selectedFilters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {mobileColumns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {mobileColumns.map(column => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`${RESPONSIVE_SPACING.md} border-t border-gray-200`}>
          <div className={`${MOBILE_FIRST.stack} items-center justify-between`}>
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of{' '}
              {filteredAndSortedData.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`${TOUCH_BUTTON.icon} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`${TOUCH_BUTTON.icon} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || Object.keys(selectedFilters).length > 0 ? (
              <>
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No data available</p>
                <p className="text-sm">There are no items to display</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDataTable;
