import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
  formatValue?: (val: number) => string;
  className?: string;
  isLoading?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changePercent,
  trend,
  formatValue,
  className = '',
  isLoading = false,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeIcon = () => {
    if (change && change > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    } else if (change && change < 0) {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (change && change > 0) {
      return 'text-green-600';
    } else if (change && change < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div data-testid="loading-skeleton" className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {trend && getTrendIcon()}
      </div>
      
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900">
          {formatValue ? formatValue(Number(value)) : formatNumber(Number(value))}
        </p>
      </div>

      {(change !== undefined || changePercent !== undefined) && (
        <div className="flex items-center gap-2">
          {getChangeIcon()}
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change !== undefined && (
              <span className="mr-1">
                {change > 0 ? '+' : ''}{formatNumber(Math.abs(change))}
              </span>
            )}
            {changePercent !== undefined && (
              <span>{formatPercentage(changePercent)}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
