import React, { useState, useEffect } from 'react';
import { DashboardCustomization } from '../contexts/UserSettingsContext';
import useUserSettings from '../hooks/useUserSettings';

interface DashboardCustomizationFormProps {
  onSave?: (customization: DashboardCustomization) => void;
  onCancel?: () => void;
  className?: string;
}

const DashboardCustomizationForm: React.FC<DashboardCustomizationFormProps> = ({ 
  onSave, 
  onCancel, 
  className = '' 
}) => {
  const { useDashboardCustomization, useUpdateDashboardCustomization } = useUserSettings();
  const { data: customization, isLoading, error } = useDashboardCustomization();
  const updateCustomization = useUpdateDashboardCustomization();

  const [formData, setFormData] = useState<DashboardCustomization>({
    layout: 'grid',
    widgets: [],
    sidebarCollapsed: false
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (customization) {
      setFormData(customization);
    }
  }, [customization]);

  const handleInputChange = (field: keyof DashboardCustomization, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleWidgetToggle = (widget: string) => {
    setFormData(prev => ({
      ...prev,
      widgets: prev.widgets.includes(widget)
        ? prev.widgets.filter(w => w !== widget)
        : [...prev.widgets, widget]
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedCustomization = await updateCustomization.mutateAsync(formData);
      setIsDirty(false);
      onSave?.(updatedCustomization);
    } catch (error) {
      console.error('Failed to update dashboard customization:', error);
    }
  };

  const handleCancel = () => {
    if (customization) {
      setFormData(customization);
      setIsDirty(false);
    }
    onCancel?.();
  };

  const availableWidgets = [
    { id: 'metrics', name: 'Key Metrics', description: 'Display important business metrics' },
    { id: 'charts', name: 'Data Charts', description: 'Visualize data with charts and graphs' },
    { id: 'alerts', name: 'Performance Alerts', description: 'Show system and business alerts' },
    { id: 'recent', name: 'Recent Activity', description: 'Display recent user activities' },
    { id: 'tasks', name: 'Task Management', description: 'Manage and track tasks' },
    { id: 'calendar', name: 'Calendar View', description: 'Show upcoming events and deadlines' }
  ];

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
        <p>Failed to load dashboard customization: {error.message}</p>
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
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} data-testid="dashboard-customization-form">
      <div className="space-y-6">
        {/* Layout Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dashboard Layout</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="layout"
                value="grid"
                checked={formData.layout === 'grid'}
                onChange={(e) => handleInputChange('layout', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Grid Layout</p>
                    <p className="text-gray-500">Organized card-based view</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zM3 14h7v7H3v-7zM14 3h7v7h-7V3zM14 14h7v7h-7v-7z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.layout === 'grid' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="layout"
                value="list"
                checked={formData.layout === 'list'}
                onChange={(e) => handleInputChange('layout', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">List Layout</p>
                    <p className="text-gray-500">Vertical list view</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.layout === 'list' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="layout"
                value="compact"
                checked={formData.layout === 'compact'}
                onChange={(e) => handleInputChange('layout', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Compact Layout</p>
                    <p className="text-gray-500">Dense information view</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.layout === 'compact' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>
          </div>
        </div>

        {/* Widget Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dashboard Widgets</h3>
          <p className="text-sm text-gray-600">Select which widgets to display on your dashboard</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableWidgets.map((widget) => (
              <label key={widget.id} className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
                <input
                  type="checkbox"
                  checked={formData.widgets.includes(widget.id)}
                  onChange={() => handleWidgetToggle(widget.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{widget.name}</p>
                  <p className="text-xs text-gray-500">{widget.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Sidebar Settings</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sidebarCollapsed"
              checked={formData.sidebarCollapsed}
              onChange={(e) => handleInputChange('sidebarCollapsed', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sidebarCollapsed" className="ml-2 text-sm text-gray-700">
              Collapse sidebar by default
            </label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            This will make the sidebar collapsed when you first load the dashboard
          </p>
        </div>

        {/* Layout Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Layout Preview</h3>
          
          <div className="p-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2 text-sm font-medium">Layout Preview</p>
              <p className="text-xs">Selected layout: {formData.layout}</p>
              <p className="text-xs">Selected widgets: {formData.widgets.length}</p>
            </div>
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
          disabled={!isDirty || updateCustomization.isPending}
          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            updateCustomization.isPending ? 'animate-pulse' : ''
          }`}
        >
          {updateCustomization.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default DashboardCustomizationForm;
