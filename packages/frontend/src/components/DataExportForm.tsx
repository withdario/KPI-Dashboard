import React, { useState, useEffect } from 'react';
import { DataPreferences } from '../types/userSettings';
import UserSettingsService from '../services/userSettingsService';

interface DataExportFormProps {
  onSave: (preferences: DataPreferences) => void;
  onCancel: () => void;
}

const DataExportForm: React.FC<DataExportFormProps> = ({ onSave, onCancel }) => {
  const [preferences, setPreferences] = useState<DataPreferences>({
    exportFormat: 'csv',
    includeMetadata: true,
    autoExport: false,
    exportSchedule: 'never',
    dataRetention: 365,
    backupEnabled: true,
    backupFrequency: 'weekly'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const service = UserSettingsService.getInstance();
      const data = await service.getDataPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load data preferences:', error);
    }
  };

  const handleInputChange = (field: keyof DataPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (preferences.dataRetention < 1 || preferences.dataRetention > 3650) {
      newErrors.dataRetention = 'Data retention must be between 1 and 3650 days';
    }

    if (preferences.autoExport && preferences.exportSchedule === 'never') {
      newErrors.exportSchedule = 'Export schedule is required when auto-export is enabled';
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
      const updated = await service.updateDataPreferences(preferences);
      onSave(updated);
    } catch (error) {
      console.error('Failed to save data preferences:', error);
      setErrors({ submit: 'Failed to save preferences. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const service = UserSettingsService.getInstance();
      const exportData = await service.exportUserData();
      
      // Create and download file
      const blob = new Blob([exportData], { 
        type: preferences.exportFormat === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.${preferences.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      setErrors({ export: 'Failed to export data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Export Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Export Format
        </label>
        <select
          value={preferences.exportFormat}
          onChange={(e) => handleInputChange('exportFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {/* Include Metadata */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeMetadata"
          checked={preferences.includeMetadata}
          onChange={(e) => handleInputChange('includeMetadata', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="includeMetadata" className="ml-2 block text-sm text-gray-900">
          Include metadata and settings in exports
        </label>
      </div>

      {/* Auto Export */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoExport"
          checked={preferences.autoExport}
          onChange={(e) => handleInputChange('autoExport', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="autoExport" className="ml-2 block text-sm text-gray-900">
          Enable automatic data export
        </label>
      </div>

      {/* Export Schedule */}
      {preferences.autoExport && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Schedule
          </label>
          <select
            value={preferences.exportSchedule}
            onChange={(e) => handleInputChange('exportSchedule', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.exportSchedule ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="never">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {errors.exportSchedule && (
            <p className="mt-1 text-sm text-red-600">{errors.exportSchedule}</p>
          )}
        </div>
      )}

      {/* Data Retention */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Retention (days)
        </label>
        <input
          type="number"
          min="1"
          max="3650"
          value={preferences.dataRetention}
          onChange={(e) => handleInputChange('dataRetention', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.dataRetention ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.dataRetention && (
          <p className="mt-1 text-sm text-red-600">{errors.dataRetention}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          How long to keep your data (1-3650 days)
        </p>
      </div>

      {/* Backup Settings */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="backupEnabled"
            checked={preferences.backupEnabled}
            onChange={(e) => handleInputChange('backupEnabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="backupEnabled" className="ml-2 block text-sm text-gray-900">
            Enable automatic backups
          </label>
        </div>

        {preferences.backupEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={preferences.backupFrequency}
              onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Export Your Data</h4>
        <p className="text-sm text-gray-600 mb-4">
          Download a copy of your current data and settings.
        </p>
        <button
          type="button"
          onClick={handleExportData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Exporting...' : 'Export Data'}
        </button>
        {errors.export && (
          <p className="mt-2 text-sm text-red-600">{errors.export}</p>
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
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
};

export default DataExportForm;
