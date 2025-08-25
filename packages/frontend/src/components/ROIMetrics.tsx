import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Target,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';
import { N8nROICalculation } from '../types/n8n';

interface ROIMetricsProps {
  roiData: N8nROICalculation[];
  onWorkflowClick?: (roi: N8nROICalculation) => void;
  showDetails?: boolean;
}

const ROIMetrics: React.FC<ROIMetricsProps> = ({ 
  roiData, 
  onWorkflowClick,
  showDetails = true
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (milliseconds: number) => {
    const hours = milliseconds / (1000 * 60 * 60);
    if (hours < 1) return `${(milliseconds / (1000 * 60)).toFixed(1)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  const formatPaybackPeriod = (months: number) => {
    if (months < 1) return '< 1 month';
    if (months === 1) return '1 month';
    if (months < 12) return `${months.toFixed(1)} months`;
    const years = months / 12;
    if (years === 1) return '1 year';
    return `${years.toFixed(1)} years`;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600';
    if (roi >= 200) return 'text-green-500';
    if (roi >= 100) return 'text-blue-600';
    if (roi >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROIBadgeColor = (roi: number) => {
    if (roi >= 300) return 'bg-green-100 text-green-800';
    if (roi >= 200) return 'bg-green-100 text-green-800';
    if (roi >= 100) return 'bg-blue-100 text-blue-800';
    if (roi >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = (roi: number) => {
    if (roi >= 200) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (roi >= 100) return <TrendingUp className="h-4 w-4 text-blue-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Calculate summary metrics
  const totalROI = roiData.reduce((sum, item) => sum + item.roi, 0);
  const averageROI = roiData.length > 0 ? totalROI / roiData.length : 0;
  const totalCostSavings = roiData.reduce((sum, item) => sum + item.estimatedCostSavings, 0);
  const totalAutomationCost = roiData.reduce((sum, item) => sum + item.automationCost, 0);
  const netROI = totalCostSavings > 0 ? ((totalCostSavings - totalAutomationCost) / totalAutomationCost) * 100 : 0;

  // Sort by ROI (highest first)
  const sortedROI = [...roiData].sort((a, b) => b.roi - a.roi);

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average ROI */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average ROI</p>
              <p className={`text-2xl font-bold ${getROIColor(averageROI)}`}>
                {averageROI.toFixed(0)}%
              </p>
            </div>
            <div className={`p-2 rounded-full ${getROIBadgeColor(averageROI)}`}>
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Cost Savings */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalCostSavings)}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100 text-green-800">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Investment */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investment</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAutomationCost)}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100 text-blue-800">
              <Target className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Net ROI */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net ROI</p>
              <p className={`text-2xl font-bold ${getROIColor(netROI)}`}>
                {netROI.toFixed(0)}%
              </p>
            </div>
            <div className={`p-2 rounded-full ${getROIBadgeColor(netROI)}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ROI Breakdown */}
      {showDetails && (
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Workflow ROI Breakdown</h3>
            <p className="text-sm text-gray-600">Individual workflow return on investment</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sortedROI.map((roi, index) => (
              <div
                key={roi.workflowId}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  onWorkflowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onWorkflowClick?.(roi)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Workflow Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Zap className="h-4 w-4 text-indigo-500" />
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {roi.workflowName}
                        </h4>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(roi.timeSavedPerExecution)} per execution
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {roi.totalExecutions} executions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ROI Metrics */}
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(roi.estimatedCostSavings)}
                      </p>
                      <p className="text-xs text-gray-500">Cost Savings</p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-bold ${getROIColor(roi.roi)}`}>
                        {roi.roi.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">ROI</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPaybackPeriod(roi.paybackPeriod)}
                      </p>
                      <p className="text-xs text-gray-500">Payback</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Investment: {formatCurrency(roi.automationCost)}</span>
                    <span>Return: {formatCurrency(roi.estimatedCostSavings)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        roi.roi >= 200 ? 'bg-green-500' :
                        roi.roi >= 100 ? 'bg-blue-500' :
                        roi.roi >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min((roi.estimatedCostSavings / (roi.automationCost * 2)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-blue-100 text-blue-800">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">ROI Insights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {roiData.length > 0 && (
                <>
                  <li>• {roiData.filter(r => r.roi >= 200).length} workflows have exceptional ROI (200%+)</li>
                  <li>• {roiData.filter(r => r.roi >= 100).length} workflows are profitable (100%+ ROI)</li>
                  <li>• Average payback period: {formatPaybackPeriod(
                    roiData.reduce((sum, r) => sum + r.paybackPeriod, 0) / roiData.length
                  )}</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROIMetrics;
