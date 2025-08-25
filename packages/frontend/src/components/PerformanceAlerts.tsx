import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  XCircle,
  Clock,
  TrendingDown,
  Zap,
  CheckCircle
} from 'lucide-react';
import { N8nPerformanceAlert } from '../types/n8n';

interface PerformanceAlertsProps {
  alerts: N8nPerformanceAlert[];
  onAlertClick?: (alert: N8nPerformanceAlert) => void;
  onResolveAlert?: (alertId: string) => void;
  maxAlerts?: number;
}

const PerformanceAlerts: React.FC<PerformanceAlertsProps> = ({ 
  alerts, 
  onAlertClick, 
  onResolveAlert,
  maxAlerts = 5
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'high':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'low':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'success_rate_drop':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'execution_time_increase':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failure_spike':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'workflow_error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'success_rate_drop':
        return 'Success Rate Drop';
      case 'execution_time_increase':
        return 'Execution Time Increase';
      case 'failure_spike':
        return 'Failure Spike';
      case 'workflow_error':
        return 'Workflow Error';
      default:
        return 'Performance Alert';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatValue = (alertType: string, value: number) => {
    switch (alertType) {
      case 'success_rate_drop':
        return `${value.toFixed(1)}%`;
      case 'execution_time_increase':
        return `${(value / 1000).toFixed(1)}s`;
      case 'failure_spike':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const formatThreshold = (alertType: string, threshold: number) => {
    switch (alertType) {
      case 'success_rate_drop':
        return `${threshold}%`;
      case 'execution_time_increase':
        return `${(threshold / 1000).toFixed(1)}s`;
      case 'failure_spike':
        return threshold.toString();
      default:
        return threshold.toString();
    }
  };

  const displayedAlerts = alerts.slice(0, maxAlerts);
  const hasMoreAlerts = alerts.length > maxAlerts;

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-800 font-medium">All systems operational</span>
        </div>
        <p className="text-green-700 text-sm mt-1">No performance alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </span>
          {alerts.some(a => a.severity === 'critical') && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Critical
            </span>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {displayedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              border rounded-lg p-3 cursor-pointer transition-colors
              ${getSeverityColor(alert.severity)}
            `}
            onClick={() => onAlertClick?.(alert)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Severity Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {getAlertTypeIcon(alert.alertType)}
                      <span className="ml-1">{getAlertTypeLabel(alert.alertType)}</span>
                    </span>
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded text-xs font-medium
                      ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {alert.severity}
                    </span>
                  </div>

                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {alert.workflowName}
                  </h4>
                  
                  <p className="text-gray-700 text-sm mb-2">
                    {alert.message}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>
                      Current: <span className="font-medium">{formatValue(alert.alertType, alert.currentValue)}</span>
                    </span>
                    <span>
                      Threshold: <span className="font-medium">{formatThreshold(alert.alertType, alert.threshold)}</span>
                    </span>
                    <span>
                      {formatTimestamp(alert.triggeredAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-3">
                {!alert.isResolved && onResolveAlert && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveAlert(alert.id);
                    }}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </button>
                )}
                
                {alert.isResolved && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Link */}
      {hasMoreAlerts && (
        <div className="text-center pt-2">
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View {alerts.length - maxAlerts} more alert{alerts.length - maxAlerts !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default PerformanceAlerts;
