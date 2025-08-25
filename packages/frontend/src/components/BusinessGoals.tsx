import React from 'react';
import { BusinessGoal } from '../types/businessOverview';
import { Calendar, Target, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface BusinessGoalsProps {
  goals: BusinessGoal[];
  className?: string;
}

const BusinessGoals: React.FC<BusinessGoalsProps> = ({ 
  goals, 
  className = '' 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'on-track':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'behind':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'on-track':
        return 'border-blue-200 bg-blue-50';
      case 'at-risk':
        return 'border-yellow-200 bg-yellow-50';
      case 'behind':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'on-track':
        return 'On Track';
      case 'at-risk':
        return 'At Risk';
      case 'behind':
        return 'Behind';
      default:
        return 'Unknown';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'on-track':
        return 'text-blue-700';
      case 'at-risk':
        return 'text-yellow-700';
      case 'behind':
        return 'text-orange-700';
      default:
        return 'text-gray-700';
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
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

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysUntil = getDaysUntilDeadline(deadline);
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'urgent';
    if (daysUntil <= 30) return 'soon';
    return 'future';
  };

  const getDeadlineColor = (deadline: string) => {
    const status = getDeadlineStatus(deadline);
    switch (status) {
      case 'overdue':
        return 'text-red-600';
      case 'urgent':
        return 'text-orange-600';
      case 'soon':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDeadlineText = (deadline: string) => {
    const daysUntil = getDaysUntilDeadline(deadline);
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    if (daysUntil <= 30) return `Due in ${daysUntil} days`;
    return `Due in ${daysUntil} days`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Business Goals</h3>
          <div className="text-sm text-gray-500">
            {goals.filter(g => g.status === 'completed').length} of {goals.length} completed
          </div>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-4 rounded-lg border ${getStatusColor(goal.status)}`}
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(goal.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Target: {formatValue(goal.target, goal.unit)}</span>
                      <span>Current: {formatValue(goal.current, goal.unit)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusTextColor(goal.status)}`}>
                    {getStatusText(goal.status)}
                  </div>
                  <div className={`text-xs ${getDeadlineColor(goal.deadline)}`}>
                    {getDeadlineText(goal.deadline)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(goal.progress, goal.status)}`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Deadline Info */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {goals.filter(g => g.status === 'on-track').length}
              </div>
              <div className="text-xs text-gray-500">On Track</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {goals.filter(g => g.status === 'at-risk').length}
              </div>
              <div className="text-xs text-gray-500">At Risk</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {goals.filter(g => g.status === 'behind').length}
              </div>
              <div className="text-xs text-gray-500">Behind</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessGoals;
