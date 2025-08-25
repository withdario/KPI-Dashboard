import React from 'react';
import { BusinessRecommendation } from '../types/businessOverview';
import { AlertTriangle, TrendingUp, Clock, Target, Zap, Lightbulb } from 'lucide-react';

interface BusinessRecommendationsProps {
  recommendations: BusinessRecommendation[];
  className?: string;
  maxDisplay?: number;
}

const BusinessRecommendations: React.FC<BusinessRecommendationsProps> = ({ 
  recommendations, 
  className = '',
  maxDisplay = 5
}) => {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactTextColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-700';
      case 'medium':
        return 'text-yellow-700';
      case 'low':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
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
      case 'general':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-800';
    if (priority === 2) return 'bg-orange-100 text-orange-800';
    if (priority === 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityText = (priority: number) => {
    if (priority === 1) return 'Critical';
    if (priority === 2) return 'High';
    if (priority === 3) return 'Medium';
    return 'Low';
  };

  const sortedRecommendations = recommendations
    .sort((a, b) => {
      // Sort by impact first, then by priority
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;
      return a.priority - b.priority;
    })
    .slice(0, maxDisplay);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Business Recommendations</h3>
          <div className="text-sm text-gray-500">
            {recommendations.filter(r => r.actionable).length} actionable
          </div>
        </div>

        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recommendations at this time</p>
            <p className="text-sm text-gray-400">Your business is performing well!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`p-4 rounded-lg border ${getImpactColor(recommendation.impact)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getImpactIcon(recommendation.impact)}
                    <div>
                      <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                          {recommendation.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                          {getPriorityText(recommendation.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getImpactTextColor(recommendation.impact)}`}>
                      {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
                    </div>
                    {recommendation.actionable && (
                      <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                        <Zap className="w-3 h-3" />
                        <span>Actionable</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Est. effort: {recommendation.estimatedEffort}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3" />
                    <span>Priority #{recommendation.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.impact === 'high').length}
              </div>
              <div className="text-xs text-gray-500">High Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {recommendations.filter(r => r.impact === 'medium').length}
              </div>
              <div className="text-xs text-gray-500">Medium Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.filter(r => r.impact === 'low').length}
              </div>
              <div className="text-xs text-gray-500">Low Impact</div>
            </div>
          </div>
        </div>

        {/* View All Link */}
        {recommendations.length > maxDisplay && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all {recommendations.length} recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessRecommendations;
