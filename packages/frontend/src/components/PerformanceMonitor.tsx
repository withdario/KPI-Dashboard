import React, { useEffect, useState } from 'react';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';
import { TOUCH_BUTTON, RESPONSIVE_SPACING } from '@/utils/responsive';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  memoryUsage?: number;
  batteryLevel?: number;
}

interface PerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  onPerformanceIssue?: (issue: string) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className = '',
  showDetails = false,
  onPerformanceIssue
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  useEffect(() => {
    if ('performance' in window) {
      const measurePerformance = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const layoutShift = performance.getEntriesByType('layout-shift');
        
        if (navigation) {
          const newMetrics: PerformanceMetrics = {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: layoutShift.reduce((sum, entry: any) => sum + entry.value, 0),
            firstInputDelay: 0,
            timeToInteractive: navigation.domInteractive - navigation.navigationStart
          };

          // Get battery information if available
          if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
              setMetrics(prev => prev ? { ...prev, batteryLevel: battery.level } : null);
            });
          }

          // Get memory information if available
          if ('memory' in performance) {
            const memory = (performance as any).memory;
            newMetrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
          }

          setMetrics(newMetrics);
          calculatePerformanceScore(newMetrics);
        }
      };

      // Measure initial performance
      measurePerformance();

      // Measure performance after user interaction
      const handleFirstInput = () => {
        if (metrics && !metrics.firstInputDelay) {
          const now = performance.now();
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const delay = now - navigation.navigationStart;
          
          setMetrics(prev => prev ? { ...prev, firstInputDelay: delay } : null);
          if (delay > 100) {
            onPerformanceIssue?.('First input delay is high, consider optimizing event handlers');
          }
        }
      };

      document.addEventListener('click', handleFirstInput, { once: true });
      document.addEventListener('touchstart', handleFirstInput, { once: true });

      // Monitor for performance issues
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcp = entry.startTime;
            setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lcp } : null);
            
            if (lcp > 2500) {
              onPerformanceIssue?.('Largest Contentful Paint is slow, optimize images and critical resources');
            }
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      return () => {
        observer.disconnect();
        document.removeEventListener('click', handleFirstInput);
        document.removeEventListener('touchstart', handleFirstInput);
      };
    }
  }, [onPerformanceIssue]);

  const calculatePerformanceScore = (metrics: PerformanceMetrics) => {
    let score = 100;

    // Deduct points for slow metrics
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 1800) score -= 15;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
    if (metrics.firstInputDelay > 100) score -= 10;
    if (metrics.timeToInteractive > 3800) score -= 20;

    setPerformanceScore(Math.max(0, score));
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  if (!metrics) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Performance Monitor</h3>
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={TOUCH_BUTTON.icon}
            aria-label="Toggle performance details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Performance Score */}
      <div className="p-4">
        <div className="text-center mb-4">
          <div className={`text-3xl font-bold ${getPerformanceColor(performanceScore)}`}>
            {performanceScore}
          </div>
          <div className="text-sm text-gray-600">{getPerformanceStatus(performanceScore)}</div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(metrics.loadTime)}ms
            </div>
            <div className="text-xs text-gray-600">Load Time</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(metrics.firstContentfulPaint)}ms
            </div>
            <div className="text-xs text-gray-600">FCP</div>
          </div>
        </div>

        {/* Performance Issues */}
        {performanceScore < 90 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Performance Issues Detected</span>
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              Consider optimizing images, reducing bundle size, and implementing lazy loading
            </div>
          </div>
        )}
      </div>

      {/* Detailed Metrics */}
      {isVisible && showDetails && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Detailed Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Largest Contentful Paint:</span>
              <span className="font-medium">{Math.round(metrics.largestContentfulPaint)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cumulative Layout Shift:</span>
              <span className="font-medium">{metrics.cumulativeLayoutShift.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">First Input Delay:</span>
              <span className="font-medium">{Math.round(metrics.firstInputDelay)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time to Interactive:</span>
              <span className="font-medium">{Math.round(metrics.timeToInteractive)}ms</span>
            </div>
            {metrics.memoryUsage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-medium">{(metrics.memoryUsage * 100).toFixed(1)}%</span>
              </div>
            )}
            {metrics.batteryLevel && (
              <div className="flex justify-between">
                <span className="text-gray-600">Battery Level:</span>
                <span className="font-medium">{(metrics.batteryLevel * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
