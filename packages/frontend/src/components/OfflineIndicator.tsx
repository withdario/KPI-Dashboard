import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { TOUCH_BUTTON, RESPONSIVE_SPACING } from '@/utils/responsive';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isInstalled, isUpdateAvailable, updateServiceWorker, clearCache } = useServiceWorker();
  const [showOfflineMenu, setShowOfflineMenu] = useState(false);

  if (isOnline && !isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 mb-2">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">You're offline</span>
            <button
              onClick={() => setShowOfflineMenu(!showOfflineMenu)}
              className={`${TOUCH_BUTTON.icon} ml-2`}
              aria-label="Toggle offline menu"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showOfflineMenu && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="text-xs text-red-600 mb-2">
                Some features may be limited while offline
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className={`${TOUCH_BUTTON.secondary} text-xs px-2 py-1`}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </button>
                {isInstalled && (
                  <button
                    onClick={clearCache}
                    className={`${TOUCH_BUTTON.secondary} text-xs px-2 py-1`}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Clear Cache
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Available */}
      {isUpdateAvailable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Update available</span>
            <button
              onClick={updateServiceWorker}
              className={`${TOUCH_BUTTON.primary} text-xs px-3 py-1`}
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border-2 border-gray-200">
        {isOnline ? (
          <Wifi className="w-6 h-6 text-green-600" />
        ) : (
          <WifiOff className="w-6 h-6 text-red-600" />
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
