import React, { useState, useEffect } from 'react';
import { ThemeSettings } from '../contexts/UserSettingsContext';
import useUserSettings from '../hooks/useUserSettings';

interface ThemeSettingsFormProps {
  onSave?: (theme: ThemeSettings) => void;
  onCancel?: () => void;
  className?: string;
}

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({ 
  onSave, 
  onCancel, 
  className = '' 
}) => {
  const { useThemeSettings, useUpdateThemeSettings } = useUserSettings();
  const { data: theme, isLoading, error } = useThemeSettings();
  const updateTheme = useUpdateThemeSettings();

  const [formData, setFormData] = useState<ThemeSettings>({
    mode: 'auto',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    colorBlindness: 'none'
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (theme) {
      setFormData(theme);
    }
  }, [theme]);

  const handleInputChange = (field: keyof ThemeSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedTheme = await updateTheme.mutateAsync(formData);
      setIsDirty(false);
      onSave?.(updatedTheme);
    } catch (error) {
      console.error('Failed to update theme settings:', error);
    }
  };

  const handleCancel = () => {
    if (theme) {
      setFormData(theme);
      setIsDirty(false);
    }
    onCancel?.();
  };

  const presetColors = [
    { name: 'Blue', primary: '#3B82F6', accent: '#10B981' },
    { name: 'Purple', primary: '#8B5CF6', accent: '#F59E0B' },
    { name: 'Green', primary: '#10B981', accent: '#3B82F6' },
    { name: 'Red', primary: '#EF4444', accent: '#F59E0B' },
    { name: 'Orange', primary: '#F59E0B', accent: '#8B5CF6' },
    { name: 'Teal', primary: '#14B8A6', accent: '#F59E0B' }
  ];

  const applyPreset = (preset: typeof presetColors[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      accentColor: preset.accent
    }));
    setIsDirty(true);
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
        <p>Failed to load theme settings: {error.message}</p>
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
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} data-testid="theme-settings-form">
      <div className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Theme Mode</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="theme-mode"
                value="light"
                checked={formData.mode === 'light'}
                onChange={(e) => handleInputChange('mode', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Light</p>
                    <p className="text-gray-500">Clean, bright interface</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.mode === 'light' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="theme-mode"
                value="dark"
                checked={formData.mode === 'dark'}
                onChange={(e) => handleInputChange('mode', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Dark</p>
                    <p className="text-gray-500">Easy on the eyes</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.mode === 'dark' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none">
              <input
                type="radio"
                name="theme-mode"
                value="auto"
                checked={formData.mode === 'auto'}
                onChange={(e) => handleInputChange('mode', e.target.value as any)}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Auto</p>
                    <p className="text-gray-500">Follows system</p>
                  </div>
                </div>
                <div className="shrink-0 text-blue-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5H18a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 0021 16.5v-2.818a3 3 0 00-.878-2.121l-6.5-6.499c-.204-.204-.517-.288-.906-.22A6.75 6.75 0 0015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 7.5a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                formData.mode === 'auto' ? 'border-blue-500' : 'border-transparent'
              }`}></div>
            </label>
          </div>
        </div>

        {/* Color Customization */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Color Customization</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="accentColor"
                  value={formData.accentColor}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#10B981"
                />
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Color Presets
              </label>
              <div className="grid grid-cols-3 gap-3">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex space-x-1 mb-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: preset.primary }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: preset.accent }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Typography</h3>
          
          <div>
            <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              id="fontSize"
              value={formData.fontSize}
              onChange={(e) => handleInputChange('fontSize', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small (14px)</option>
              <option value="medium">Medium (16px)</option>
              <option value="large">Large (18px)</option>
            </select>
          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Accessibility</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="highContrast"
                checked={formData.highContrast}
                onChange={(e) => handleInputChange('highContrast', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="highContrast" className="ml-2 text-sm text-gray-700">
                High Contrast Mode
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="reducedMotion"
                checked={formData.reducedMotion}
                onChange={(e) => handleInputChange('reducedMotion', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="reducedMotion" className="ml-2 text-sm text-gray-700">
                Reduced Motion
              </label>
            </div>

            <div>
              <label htmlFor="colorBlindness" className="block text-sm font-medium text-gray-700 mb-2">
                Color Blindness Support
              </label>
              <select
                id="colorBlindness"
                value={formData.colorBlindness}
                onChange={(e) => handleInputChange('colorBlindness', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
          
          <div 
            className="p-6 rounded-lg border-2 border-dashed border-gray-300"
            style={{
              backgroundColor: formData.mode === 'dark' ? '#1F2937' : '#FFFFFF',
              color: formData.mode === 'dark' ? '#F9FAFB' : '#111827'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Sample Dashboard</h4>
                <div className="flex space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: formData.primaryColor }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: formData.accentColor }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: formData.mode === 'dark' ? '#374151' : '#F3F4F6' }}
                >
                  <div className="text-sm font-medium mb-2">Metric Card</div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: formData.primaryColor }}
                  >
                    1,234
                  </div>
                  <div className="text-xs text-gray-500">Total Users</div>
                </div>
                
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: formData.mode === 'dark' ? '#374151' : '#F3F4F6' }}
                >
                  <div className="text-sm font-medium mb-2">Status</div>
                  <div 
                    className="text-sm px-2 py-1 rounded-full inline-block"
                    style={{ 
                      backgroundColor: formData.accentColor,
                      color: '#FFFFFF'
                    }}
                  >
                    Active
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Font size: {formData.fontSize === 'small' ? '14px' : formData.fontSize === 'medium' ? '16px' : '18px'}
                {formData.highContrast && ' • High contrast enabled'}
                {formData.reducedMotion && ' • Reduced motion enabled'}
                {formData.colorBlindness !== 'none' && ` • ${formData.colorBlindness} support`}
              </div>
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
          disabled={!isDirty || updateTheme.isPending}
          className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            updateTheme.isPending ? 'animate-pulse' : ''
          }`}
        >
          {updateTheme.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ThemeSettingsForm;
