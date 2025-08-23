import DashboardLayout from '@/components/DashboardLayout';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardWidget from '@/components/DashboardWidget';
import { Settings, Database, Shield, Bell, Palette, Globe, Key, Users, Zap, BarChart3 } from 'lucide-react';

const SettingsPage = () => {
  const settingCategories = [
    {
      title: 'General Settings',
      description: 'Basic platform configuration',
      icon: Settings,
      color: 'text-blue-600',
      settings: ['Site Information', 'Language & Region', 'Time Zone', 'Currency']
    },
    {
      title: 'Security',
      description: 'Authentication and access control',
      icon: Shield,
      color: 'text-red-600',
      settings: ['Password Policy', 'Two-Factor Authentication', 'Session Management', 'IP Whitelist']
    },
    {
      title: 'Notifications',
      description: 'Email and push notification preferences',
      icon: Bell,
      color: 'text-green-600',
      settings: ['Email Alerts', 'Push Notifications', 'SMS Notifications', 'Webhook Settings']
    },
    {
      title: 'Appearance',
      description: 'UI customization and branding',
      icon: Palette,
      color: 'text-purple-600',
      settings: ['Theme Selection', 'Color Scheme', 'Logo & Branding', 'Custom CSS']
    },
    {
      title: 'Integrations',
      description: 'Third-party service connections',
      icon: Zap,
      color: 'text-yellow-600',
      settings: ['Google Analytics', 'n8n Workflows', 'Email Services', 'Payment Gateways']
    },
    {
      title: 'Data & Privacy',
      description: 'Data management and compliance',
      icon: Database,
      color: 'text-indigo-600',
      settings: ['Data Retention', 'GDPR Compliance', 'Data Export', 'Backup Settings']
    }
  ];

  const systemStatus = [
    { name: 'Database', status: 'Healthy', uptime: '99.9%', lastCheck: '2 minutes ago' },
    { name: 'API Services', status: 'Healthy', uptime: '99.8%', lastCheck: '1 minute ago' },
    { name: 'File Storage', status: 'Healthy', uptime: '99.9%', lastCheck: '3 minutes ago' },
    { name: 'Email Service', status: 'Warning', uptime: '98.5%', lastCheck: '5 minutes ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-100 text-green-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title="Platform Settings"
      subtitle="Configure your platform, manage integrations, and customize the experience"
    >
      <DashboardGrid cols={12} gap="lg">
        {/* Settings Overview */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Settings Overview"
            subtitle="Manage all aspects of your platform configuration"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settingCategories.map((category, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className={`${category.color} mb-4`}>
                    <category.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <ul className="space-y-2">
                    {category.settings.map((setting, settingIndex) => (
                      <li key={settingIndex} className="text-sm text-gray-700 flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                        {setting}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* System Status */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="System Status"
            subtitle="Monitor the health and performance of your platform"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Check
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemStatus.map((service, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <BarChart3 className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {service.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.uptime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.lastCheck}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Quick Actions */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Quick Actions"
            subtitle="Common configuration tasks"
          >
            <div className="space-y-3">
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </div>
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </div>
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Domains
                </div>
              </button>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Integrations
                </div>
              </button>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Environment Variables */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Environment Configuration"
            subtitle="Manage environment variables and configuration files"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Database className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Environment variables</p>
                <p className="text-sm text-gray-400">Configuration management will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Backup & Restore */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Backup & Restore"
            subtitle="Data backup and recovery settings"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Shield className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Backup configuration</p>
                <p className="text-sm text-gray-400">Backup system will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Advanced Settings */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Advanced Settings"
            subtitle="Developer and administrator configurations"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Development</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-700">Enable Debug Mode</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-700">Show Performance Metrics</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-700">Enable API Logging</span>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Performance</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-700">Enable Caching</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-700">Compress Responses</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-700">Enable CDN</span>
                  </label>
                </div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default SettingsPage;
