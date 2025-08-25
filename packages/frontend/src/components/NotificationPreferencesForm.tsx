import React, { useState, useEffect } from 'react';
import { NotificationPreferences } from '../contexts/UserSettingsContext';
import useUserSettings from '../hooks/useUserSettings';

interface NotificationPreferencesFormProps {
  onSave?: (preferences: NotificationPreferences) => void;
  onCancel?: () => void;
  className?: string;
}

const NotificationPreferencesForm: React.FC<NotificationPreferencesFormProps> = ({ 
  onSave, 
  onCancel, 
  className = '' 
}) => {
  const { useNotificationPreferences, useUpdateNotificationPreferences } = useUserSettings();
  const { data: preferences, isLoading, error } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const [formData, setFormData] = useState<NotificationPreferences>({
    email: true,
    push: false,
    sms: false,
    frequency: 'daily'
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleInputChange = (field: keyof NotificationPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedPreferences = await updatePreferences.mutateAsync(formData);
      setIsDirty(false);
      onSave?.(updatedPreferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const handleCancel = () => {
    if (preferences) {
      setFormData(preferences);
      setIsDirty(false);
    }
    onCancel?.();
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 p-4 border border-red-200 rounded-lg ${className}`}>
        <p>Failed to load notification preferences: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} data-testid="notification-preferences-form">
      <div className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Notification Channels</h3>
          <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-900">
                    Email Notifications
                  </label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="email"
                checked={formData.email}
                onChange={(e) => handleInputChange('email', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <label htmlFor="push" className="text-sm font-medium text-gray-900">
                    Push Notifications
                  </label>
                  <p className="text-xs text-gray-500">Receive notifications on your device</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="push"
                checked={formData.push}
                onChange={(e) => handleInputChange('push', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <label htmlFor="sms" className="text-sm font-medium text-gray-900">
                    SMS Notifications
                  </label>
                  <p className="text-xs text-gray-500">Receive notifications via text message</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="sms"
                checked={formData.sms}
                onChange={(e) => handleInputChange('sms', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Notification Frequency</h3>
          <p className="text-sm text-gray-600">How often would you like to receive notifications?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="frequency"
                value="immediate"
                checked={formData.frequency === 'immediate'}
                onChange={(e) => handleInputChange('frequency', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Immediate</p>
                    <p className="text-gray-500">Get notified right away</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.frequency === 'immediate' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={formData.frequency === 'daily'}
                onChange={(e) => handleInputChange('frequency', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Daily Digest</p>
                    <p className="text-gray-500">Once per day summary</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.frequency === 'daily' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={formData.frequency === 'weekly'}
                onChange={(e) => handleInputChange('frequency', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Weekly Summary</p>
                    <p className="text-gray-500">Once per week summary</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.frequency === 'weekly' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
          <p className="text-sm text-gray-600">Choose which types of notifications you want to receive</p>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="systemAlerts"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="systemAlerts" className="ml-2 text-sm text-gray-700">
                System alerts and maintenance notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="performanceAlerts"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="performanceAlerts" className="ml-2 text-sm text-gray-700">
                Performance and automation alerts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="businessUpdates"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="businessUpdates" className="ml-2 text-sm text-gray-700">
                Business metrics and insights updates
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="securityAlerts"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="securityAlerts" className="ml-2 text-sm text-gray-700">
                Security and access notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featureUpdates"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featureUpdates" className="ml-2 text-sm text-gray-700">
                New features and product updates
              </label>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Quiet Hours</h3>
          <p className="text-sm text-gray-600">Set times when you don't want to receive notifications</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quietStart" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                id="quietStart"
                defaultValue="22:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="quietEnd" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                id="quietEnd"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="quietHoursEnabled"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="quietHoursEnabled" className="ml-2 text-sm text-gray-700">
              Enable quiet hours (only urgent notifications during this time)
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isDirty || updatePreferences.isPending}
          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            updatePreferences.isPending ? 'animate-pulse' : ''
          }`}
        >
          {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default NotificationPreferencesForm;
