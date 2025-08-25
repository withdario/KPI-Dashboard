import React from 'react';
import { BusinessHealthScore as BusinessHealthScoreType } from '../types/businessOverview';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface BusinessHealthScoreProps {
  healthScore: BusinessHealthScoreType;
  className?: string;
}

const BusinessHealthScore: React.FC<BusinessHealthScoreProps> = ({ 
  healthScore, 
  className = '' 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-300';
    if (score >= 60) return 'border-yellow-300';
    return 'border-red-300';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const categories = [
    { key: 'traffic', label: 'Traffic', score: healthScore.traffic },
    { key: 'engagement', label: 'Engagement', score: healthScore.engagement },
    { key: 'conversion', label: 'Conversion', score: healthScore.conversion },
    { key: 'automation', label: 'Automation', score: healthScore.automation }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Business Health Score</h3>
            <p className="text-sm text-gray-500">Last updated: {new Date(healthScore.lastUpdated).toLocaleString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(healthScore.trend)}
            <span className={`text-sm font-medium ${getTrendColor(healthScore.trend)}`}>
              {getTrendText(healthScore.trend)}
            </span>
          </div>
        </div>

        {/* Overall Score */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(healthScore.overall)} ${getScoreBorderColor(healthScore.overall)} border-4`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(healthScore.overall)}`}>
                {healthScore.overall}
              </div>
              <div className={`text-sm font-medium ${getScoreColor(healthScore.overall)}`}>
                /100
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2">
            {getStatusIcon(healthScore.overall)}
            <span className={`text-lg font-semibold ${getStatusColor(healthScore.overall)}`}>
              {getStatusText(healthScore.overall)}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {categories.map((category) => (
            <div key={category.key} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor(category.score)} ${getScoreBorderColor(category.score)} border-2`}>
                <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                  {category.score}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-900">{category.label}</div>
                <div className={`text-xs ${getScoreColor(category.score)}`}>
                  {category.score >= 80 ? 'Excellent' : category.score >= 60 ? 'Good' : category.score >= 40 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {healthScore.recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {healthScore.recommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessHealthScore;
