import React from 'react';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { TOUCH_BUTTON, RESPONSIVE_SPACING } from '@/utils/responsive';

export type LoadingState = 'loading' | 'success' | 'error' | 'idle';

interface MobileLoadingProps {
  state: LoadingState;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
  showProgress?: boolean;
  progress?: number;
  onRetry?: () => void;
  className?: string;
  fullScreen?: boolean;
}

const MobileLoading: React.FC<MobileLoadingProps> = ({
  state,
  message,
  size = 'md',
  variant = 'spinner',
  showProgress = false,
  progress = 0,
  onRetry,
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        switch (variant) {
          case 'dots':
            return (
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            );
          case 'bars':
            return (
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-1 bg-blue-600 rounded-full animate-pulse`}
                    style={{ 
                      height: `${size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '48px'}`,
                      animationDelay: `${i * 0.1}s` 
                    }}
                  />
                ))}
              </div>
            );
          case 'pulse':
            return (
              <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`} />
            );
          default:
            return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />;
        }
      case 'success':
        return <CheckCircle className={`${sizeClasses[size]} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${sizeClasses[size]} text-red-600`} />;
      default:
        return null;
    }
  };

  const getStateMessage = () => {
    if (message) return message;
    
    switch (state) {
      case 'loading':
        return 'Loading...';
      case 'success':
        return 'Completed successfully';
      case 'error':
        return 'An error occurred';
      default:
        return '';
    }
  };

  const getStateClasses = () => {
    switch (state) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Icon/Spinner */}
      <div className="flex items-center justify-center">
        {getStateIcon()}
      </div>
      
      {/* Message */}
      {getStateMessage() && (
        <div className={`text-center ${getStateClasses()}`}>
          <p className="text-sm font-medium">{getStateMessage()}</p>
        </div>
      )}
      
      {/* Progress Bar */}
      {showProgress && state === 'loading' && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
        </div>
      )}
      
      {/* Retry Button */}
      {state === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className={`${TOUCH_BUTTON.secondary} space-x-2`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loading component for content placeholders
interface MobileSkeletonProps {
  type: 'text' | 'avatar' | 'button' | 'card' | 'table';
  lines?: number;
  className?: string;
}

export const MobileSkeleton: React.FC<MobileSkeletonProps> = ({
  type,
  lines = 3,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {[...Array(lines)].map((_, i) => (
              <div
                key={i}
                className={`h-4 bg-gray-200 rounded animate-pulse ${
                  i === lines - 1 ? 'w-3/4' : 'w-full'
                }`}
              />
            ))}
          </div>
        );
      
      case 'avatar':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          </div>
        );
      
      case 'button':
        return (
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
        );
      
      case 'card':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-3">
            {[...Array(lines)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

// Loading overlay component
interface MobileLoadingOverlayProps {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}

export const MobileLoadingOverlay: React.FC<MobileLoadingOverlayProps> = ({
  isVisible,
  children,
  className = ''
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <MobileLoading state="loading" variant="spinner" size="lg" />
      </div>
    </div>
  );
};

export default MobileLoading;
