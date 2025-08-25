import React, { useState } from 'react';
import UserProfileForm from './UserProfileForm';
import DashboardCustomizationForm from './DashboardCustomizationForm';
import NotificationPreferencesForm from './NotificationPreferencesForm';
import ThemeSettingsForm from './ThemeSettingsForm';
import DataExportForm from './DataExportForm';
import IntegrationManagementForm from './IntegrationManagementForm';
import PrivacySecurityForm from './PrivacySecurityForm';

interface UserSettingsDashboardProps {
  className?: string;
}

type SettingsTab = 'profile' | 'dashboard' | 'notifications' | 'theme' | 'data' | 'integrations' | 'privacy';

const UserSettingsDashboard: React.FC<UserSettingsDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [savedMessage, setSavedMessage] = useState<string>('');

  const tabs: Array<{ id: SettingsTab; name: string; icon: React.ReactNode; description: string }> = [
    {
      id: 'profile',
      name: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Manage your personal information and account details'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'Customize your dashboard layout and preferences'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4H20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4.19c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        </svg>
      ),
      description: 'Configure your notification preferences'
    },
    {
      id: 'theme',
      name: 'Theme',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      description: 'Customize colors, fonts, and appearance'
    },
    {
      id: 'data',
      name: 'Data & Export',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Manage data export and backup settings'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-.758l1.102-1.101a4 4 0 00-5.656-5.656l4 4a4 4 0 005.656 5.656l1.102-1.101m-.758-.758l1.102-1.101a4 4 0 00-5.656-5.656l4 4a4 4 0 005.656 5.656l1.102-1.101" />
        </svg>
      ),
      description: 'Configure connected services and APIs'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      description: 'Control your privacy and data sharing settings'
    }
  ];

  const handleSave = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <UserProfileForm
            onSave={(profile) => handleSave(`Profile updated successfully for ${profile.firstName} ${profile.lastName}`)}
            onCancel={() => setActiveTab('profile')}
          />
        );
      case 'dashboard':
        return (
          <DashboardCustomizationForm
            onSave={(customization) => handleSave(`Dashboard customization saved with ${customization.layout} layout`)}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'notifications':
        return (
          <NotificationPreferencesForm
            onSave={(preferences) => handleSave('Notification preferences updated successfully')}
            onCancel={() => setActiveTab('notifications')}
          />
        );
      case 'theme':
        return (
          <ThemeSettingsForm
            onSave={(theme) => handleSave(`Theme updated to ${theme.mode} mode`)}
            onCancel={() => setActiveTab('theme')}
          />
        );
      case 'data':
        return (
          <DataExportForm
            onSave={(preferences) => handleSave(`Data export preferences saved with ${preferences.exportFormat} format`)}
            onCancel={() => setActiveTab('data')}
          />
        );
      case 'integrations':
        return (
          <IntegrationManagementForm
            onSave={(settings) => handleSave('Integration settings updated successfully')}
            onCancel={() => setActiveTab('integrations')}
          />
        );
      case 'privacy':
        return (
          <PrivacySecurityForm
            onSave={(settings) => handleSave('Privacy and security settings updated successfully')}
            onCancel={() => setActiveTab('privacy')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
        <p className="mt-2 text-gray-600">
          Customize your dashboard experience and manage your preferences
        </p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{savedMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {tabs.find(tab => tab.id === activeTab)?.name}
          </h2>
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">Update Profile</p>
              <p className="text-xs text-gray-500">Change your personal information</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">Customize Theme</p>
              <p className="text-xs text-gray-500">Change colors and appearance</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4H20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4.19c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              </svg>
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">Notification Settings</p>
              <p className="text-xs text-gray-500">Manage your alerts</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsDashboard;
