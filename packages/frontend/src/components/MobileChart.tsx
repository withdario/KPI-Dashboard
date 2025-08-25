import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import TouchGestureHandler from './TouchGestureHandler';
import { TOUCH_BUTTON, CHART_RESPONSIVE } from '../utils/responsive';

interface MobileChartProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  variant?: 'mobile' | 'tablet' | 'desktop' | 'container';
  showControls?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const MobileChart: React.FC<MobileChartProps> = ({
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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePinchIn = (scale: number) => {
    setZoom(prev => Math.max(prev * scale, 0.5));
  };

  const handlePinchOut = (scale: number) => {
    setZoom(prev => Math.min(prev * scale, 3));
  };

  const handleDoubleTap = () => {
    handleReset();
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.style.transform = `scale(${zoom}) rotate(${rotation}deg)`;
    }
  }, [zoom, rotation]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            {showControls && onRefresh && (
              <button
                onClick={onRefresh}
                className={`${TOUCH_BUTTON.secondary} space-x-2`}
                disabled={isLoading}
              >
                <span>Refresh</span>
              </button>
            )}
            {showControls && onExport && (
              <button
                onClick={onExport}
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
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <TouchGestureHandler
            onPinchIn={handlePinchIn}
            onPinchOut={handlePinchOut}
            onDoubleTap={handleDoubleTap}
          >
            <div ref={chartRef} className="transition-transform duration-200 origin-center">
              {children}
            </div>
          </TouchGestureHandler>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className={TOUCH_BUTTON.icon}
            aria-label="Zoom out"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className={TOUCH_BUTTON.icon}
            aria-label="Zoom in"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          {/* Rotation Control */}
          <button
            onClick={handleRotate}
            className={TOUCH_BUTTON.icon}
            aria-label="Rotate chart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          {/* Reset Control */}
          <button
            onClick={handleReset}
            className={TOUCH_BUTTON.icon}
            aria-label="Reset chart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          {/* Chart Controls */}
          {showControls && onRefresh && (
            <button
              onClick={onRefresh}
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
              onClick={onExport}
              className={TOUCH_BUTTON.icon}
              aria-label="Export chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          
          {/* Fullscreen Control */}
          <button
            onClick={handleFullscreenToggle}
            className={TOUCH_BUTTON.icon}
            aria-label="Enter fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className={`${CHART_RESPONSIVE[variant]} overflow-hidden`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <TouchGestureHandler
              onPinchIn={handlePinchIn}
              onPinchOut={handlePinchOut}
              onDoubleTap={handleDoubleTap}
            >
              <div 
                ref={chartRef} 
                className="transition-transform duration-200 origin-center"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              >
                {children}
              </div>
            </TouchGestureHandler>
          )}
        </div>
        
        {/* Zoom Indicator */}
        {zoom !== 1 && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileChart;
