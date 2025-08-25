import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import DashboardGrid from '../components/DashboardGrid';
import DashboardWidget from '../components/DashboardWidget';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleRefresh = () => {
    toast.success('Dashboard refreshed');
  };

  const handleExport = () => {
    toast.success('Dashboard data exported');
  };

  const handleDateRangeChange = () => {
    toast.success('Date range updated');
  };

  return (
    <DashboardLayout
      title="Business Intelligence Dashboard"
      subtitle="Monitor your business performance and automation ROI in real-time"
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDateRangeChange}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      }
    >
      {/* Summary Metrics Row */}
      <DashboardGrid cols={4} gap="lg" className="mb-8">
        <DashboardGrid.Item>
          <DashboardWidget
            title="Total Sessions"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">12,847</div>
              <div className="text-sm text-green-600 mt-1">+12.5% vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Conversion Rate"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">3.2%</div>
              <div className="text-sm text-green-600 mt-1">+0.8% vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Automation ROI"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">247%</div>
              <div className="text-sm text-green-600 mt-1">+45% vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Time Saved"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">127h</div>
              <div className="text-sm text-green-600 mt-1">+23h vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>

      {/* Main Dashboard Content */}
      <DashboardGrid cols={12} gap="lg">
        {/* Google Analytics Overview */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Traffic Overview"
            subtitle="Google Analytics data for the last 30 days"
            actions={
              <button className="text-sm text-indigo-600 hover:text-indigo-500">
                View Details →
              </button>
            }
          >
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-lg">Chart Component</div>
                <div className="text-gray-400 text-sm">Traffic trends and patterns</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Automation Performance */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Automation Performance"
            subtitle="n8n workflow execution status"
            actions={
              <button className="text-sm text-indigo-600 hover:text-indigo-500">
                View All →
              </button>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Workflows</span>
                <span className="text-sm font-medium text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">98.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Execution</span>
                <span className="text-sm font-medium text-gray-900">2.3s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time Saved</span>
                <span className="text-sm font-medium text-blue-600">127h</span>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Recent Activity */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Recent Activity"
            subtitle="Latest automation executions and data updates"
          >
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Workflow {item} completed successfully
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Quick Actions */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Quick Actions"
            subtitle="Common tasks and shortcuts"
          >
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200">
                <div className="text-sm font-medium text-indigo-900">Generate Report</div>
                <div className="text-xs text-indigo-600">Create custom analytics report</div>
              </button>
              <button className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <div className="text-sm font-medium text-green-900">View Trends</div>
                <div className="text-xs text-green-600">Analyze performance trends</div>
              </button>
              <button className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                <div className="text-sm font-medium text-purple-900">Automation Status</div>
                <div className="text-xs text-purple-600">Check workflow health</div>
              </button>
              <button className="p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors duration-200">
                <div className="text-sm font-medium text-yellow-900">Export Data</div>
                <div className="text-xs text-yellow-600">Download metrics and insights</div>
              </button>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default DashboardPage;
