import React, { useState, useEffect } from 'react';
import { CHART_RESPONSIVE, TOUCH_BUTTON } from '@/utils/responsive';

interface ResponsiveChartProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  variant?: 'mobile' | 'tablet' | 'desktop' | 'container';
  showControls?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  children,
  title,
  className = '',
  variant = 'container',
  showControls = false,
  onRefresh,
  onExport,
  isLoading = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartHeight, setChartHeight] = useState<string>('');

  useEffect(() => {
    const updateChartHeight = () => {
      const height = CHART_RESPONSIVE[variant];
      setChartHeight(height);
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, [variant]);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            {showControls && onRefresh && (
              <button
                onClick={handleRefresh}
                className={`${TOUCH_BUTTON.secondary} space-x-2`}
                disabled={isLoading}
              >
                <span>Refresh</span>
              </button>
            )}
            {showControls && onExport && (
              <button
                onClick={handleExport}
                className={`${TOUCH_BUTTON.primary} space-x-2`}
              >
                <span>Export</span>
              </button>
            )}
            <button
              onClick={handleFullscreenToggle}
              className={TOUCH_BUTTON.icon}
              aria-label="Exit fullscreen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {showControls && onRefresh && (
            <button
              onClick={handleRefresh}
              className={TOUCH_BUTTON.icon}
              disabled={isLoading}
              aria-label="Refresh chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {showControls && onExport && (
            <button
              onClick={handleExport}
              className={TOUCH_BUTTON.icon}
              aria-label="Export chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleFullscreenToggle}
            className={TOUCH_BUTTON.icon}
            aria-label="Enter fullscreen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className={`${chartHeight} overflow-x-auto`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveChart;
