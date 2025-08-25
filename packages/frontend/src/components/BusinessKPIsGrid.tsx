import React from 'react';
import { BusinessKPI } from '../types/businessOverview';
import { TrendingUp, TrendingDown, Minus, Target, AlertTriangle } from 'lucide-react';

interface BusinessKPIsGridProps {
  kpis: BusinessKPI[];
  className?: string;
  showTargets?: boolean;
}

const BusinessKPIsGrid: React.FC<BusinessKPIsGridProps> = ({ 
  kpis, 
  className = '',
  showTargets = true
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'traffic':
        return 'bg-blue-100 text-blue-800';
      case 'engagement':
        return 'bg-purple-100 text-purple-800';
      case 'conversion':
        return 'bg-green-100 text-green-800';
      case 'automation':
        return 'bg-orange-100 text-orange-800';
      case 'business':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'USD' || unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} (${sign}${changePercent.toFixed(1)}%)`;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`p-4 rounded-lg border ${getStatusColor(kpi.status)} hover:shadow-md transition-shadow`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(kpi.status)}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(kpi.category)}`}>
                {kpi.category}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(kpi.trend)}
            </div>
          </div>

          {/* KPI Name */}
          <h3 className="text-sm font-medium text-gray-900 mb-2">{kpi.name}</h3>

          {/* Value */}
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatValue(kpi.value, kpi.unit)}
            </span>
          </div>

          {/* Change and Target */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                {formatChange(kpi.change, kpi.changePercent)}
              </span>
            </div>
            
            {showTargets && kpi.target && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Target className="w-3 h-3" />
                <span>Target: {formatValue(kpi.target, kpi.unit)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar for Target */}
          {showTargets && kpi.target && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    kpi.value >= kpi.target ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BusinessKPIsGrid;
