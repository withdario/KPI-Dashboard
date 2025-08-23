import React from 'react';

interface DashboardWidgetProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
  'data-testid'?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  children,
  title,
  subtitle,
  loading = false,
  error = null,
  className = '',
  'data-testid': dataTestId
}) => {
  if (loading) {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
        data-testid={dataTestId}
      >
        <div className="animate-pulse">
          {title && (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/3"></div>
          )}
          {subtitle && (
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
          )}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6 ${className}`}
        data-testid={dataTestId}
      >
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-2">
            <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Error Loading Widget</h3>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
      data-testid={dataTestId}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardWidget;
