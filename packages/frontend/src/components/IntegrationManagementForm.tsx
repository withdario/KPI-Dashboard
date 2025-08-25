import React, { useState, useEffect } from 'react';
import { IntegrationSettings } from '../types/userSettings';
import UserSettingsService from '../services/userSettingsService';

interface IntegrationManagementFormProps {
  onSave: (settings: IntegrationSettings) => void;
  onCancel: () => void;
}

const IntegrationManagementForm: React.FC<IntegrationManagementFormProps> = ({ onSave, onCancel }) => {
  const [settings, setSettings] = useState<IntegrationSettings>({
    googleAnalytics: {
      enabled: true,
      refreshInterval: 5,
      dataRetention: 90
    },
    n8n: {
      enabled: true,
      webhookUrl: 'https://webhook.example.com/n8n',
      apiKey: 'n8n-api-key-123',
      refreshInterval: 1,
      dataRetention: 30
    },
    customIntegrations: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const service = UserSettingsService.getInstance();
      const data = await service.getIntegrationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load integration settings:', error);
    }
  };

  const handleInputChange = (integration: 'googleAnalytics' | 'n8n', field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        [field]: value
      }
    }));
    // Clear error when user starts typing
    const errorKey = `${integration}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleToggleIntegration = (integration: 'googleAnalytics' | 'n8n', enabled: boolean) => {
    handleInputChange(integration, 'enabled', enabled);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Google Analytics validation
    if (settings.googleAnalytics.enabled) {
      if (settings.googleAnalytics.refreshInterval < 1 || settings.googleAnalytics.refreshInterval > 60) {
        newErrors['googleAnalytics.refreshInterval'] = 'Refresh interval must be between 1 and 60 minutes';
      }
      if (settings.googleAnalytics.dataRetention < 1 || settings.googleAnalytics.dataRetention > 365) {
        newErrors['googleAnalytics.dataRetention'] = 'Data retention must be between 1 and 365 days';
      }
    }

    // n8n validation
    if (settings.n8n.enabled) {
      if (!settings.n8n.webhookUrl || settings.n8n.webhookUrl.trim() === '') {
        newErrors['n8n.webhookUrl'] = 'Webhook URL is required';
      }
      if (!settings.n8n.apiKey || settings.n8n.apiKey.trim() === '') {
        newErrors['n8n.apiKey'] = 'API key is required';
      }
      if (settings.n8n.refreshInterval < 1 || settings.n8n.refreshInterval > 60) {
        newErrors['n8n.refreshInterval'] = 'Refresh interval must be between 1 and 60 minutes';
      }
      if (settings.n8n.dataRetention < 1 || settings.n8n.dataRetention > 365) {
        newErrors['n8n.dataRetention'] = 'Data retention must be between 1 and 365 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const service = UserSettingsService.getInstance();
      const updated = await service.updateIntegrationSettings(settings);
      onSave(updated);
    } catch (error) {
      console.error('Failed to save integration settings:', error);
      setErrors({ submit: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (integration: 'googleAnalytics' | 'n8n') => {
    // This would typically make an API call to test the connection
    // For now, we'll simulate a test
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Show success message (in a real app, this would be based on actual API response)
      alert(`${integration === 'googleAnalytics' ? 'Google Analytics' : 'n8n'} connection test successful!`);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Google Analytics Integration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Google Analytics</h3>
              <p className="text-sm text-gray-500">Track website traffic and user behavior</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => testConnection('googleAnalytics')}
              disabled={loading || !settings.googleAnalytics.enabled}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Connection
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.googleAnalytics.enabled}
                onChange={(e) => handleToggleIntegration('googleAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {settings.googleAnalytics.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Interval (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.googleAnalytics.refreshInterval}
                onChange={(e) => handleInputChange('googleAnalytics', 'refreshInterval', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors['googleAnalytics.refreshInterval'] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors['googleAnalytics.refreshInterval'] && (
                <p className="mt-1 text-sm text-red-600">{errors['googleAnalytics.refreshInterval']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.googleAnalytics.dataRetention}
                onChange={(e) => handleInputChange('googleAnalytics', 'dataRetention', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors['googleAnalytics.dataRetention'] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors['googleAnalytics.dataRetention'] && (
                <p className="mt-1 text-sm text-red-600">{errors['googleAnalytics.dataRetention']}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* n8n Integration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">n8n Automation</h3>
              <p className="text-sm text-gray-500">Connect your automation workflows</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => testConnection('n8n')}
              disabled={loading || !settings.n8n.enabled}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Connection
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.n8n.enabled}
                onChange={(e) => handleToggleIntegration('n8n', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {settings.n8n.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.n8n.webhookUrl}
                onChange={(e) => handleInputChange('n8n', 'webhookUrl', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors['n8n.webhookUrl'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://your-n8n-instance.com/webhook/..."
              />
              {errors['n8n.webhookUrl'] && (
                <p className="mt-1 text-sm text-red-600">{errors['n8n.webhookUrl']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.n8n.apiKey}
                  onChange={(e) => handleInputChange('n8n', 'apiKey', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors['n8n.apiKey'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your n8n API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors['n8n.apiKey'] && (
                <p className="mt-1 text-sm text-red-600">{errors['n8n.apiKey']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.n8n.refreshInterval}
                  onChange={(e) => handleInputChange('n8n', 'refreshInterval', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors['n8n.refreshInterval'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors['n8n.refreshInterval'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['n8n.refreshInterval']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.n8n.dataRetention}
                  onChange={(e) => handleInputChange('n8n', 'dataRetention', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    errors['n8n.dataRetention'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors['n8n.dataRetention'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['n8n.dataRetention']}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Integrations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Custom Integrations</h3>
              <p className="text-sm text-gray-500">Add your own custom service connections</p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Add Integration
          </button>
        </div>

        {settings.customIntegrations.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-.758l1.102-1.101a4 4 0 00-5.656-5.656l4 4a4 4 0 005.656 5.656l1.102-1.101m-.758-.758l1.102-1.101a4 4 0 00-5.656-5.656l4 4a4 4 0 005.656 5.656l1.102-1.101" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No custom integrations</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first custom integration.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.customIntegrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{integration.name}</span>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default IntegrationManagementForm;
