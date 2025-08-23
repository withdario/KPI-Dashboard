import DashboardLayout from '@/components/DashboardLayout';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardWidget from '@/components/DashboardWidget';
import { Zap, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const AutomationPage = () => {
  const workflows = [
    { id: 1, name: 'Lead Qualification', status: 'active', success: 98.2, avgTime: '2.3s', timeSaved: '15h', lastRun: '2 min ago' },
    { id: 2, name: 'Email Marketing', status: 'active', success: 99.1, avgTime: '1.8s', timeSaved: '23h', lastRun: '5 min ago' },
    { id: 3, name: 'Data Sync', status: 'active', success: 97.5, avgTime: '4.2s', timeSaved: '8h', lastRun: '10 min ago' },
    { id: 4, name: 'Invoice Generation', status: 'paused', success: 95.8, avgTime: '3.1s', timeSaved: '12h', lastRun: '1 hour ago' },
    { id: 5, name: 'Customer Support', status: 'active', success: 99.5, avgTime: '1.2s', timeSaved: '18h', lastRun: '15 min ago' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title="Automation Dashboard"
      subtitle="n8n workflow performance, ROI, and time savings"
    >
      {/* Summary Metrics */}
      <DashboardGrid cols={4} gap="lg" className="mb-8">
        <DashboardGrid.Item>
          <DashboardWidget
            title="Active Workflows"
            subtitle="Currently running automations"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">12</div>
              <div className="text-sm text-green-600 mt-1">+2 this month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Success Rate"
            subtitle="Average workflow success"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">98.2%</div>
              <div className="text-sm text-green-600 mt-1">+1.2% vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="Time Saved"
            subtitle="Total automation time savings"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">127h</div>
              <div className="text-sm text-green-600 mt-1">+23h vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item>
          <DashboardWidget
            title="ROI"
            subtitle="Return on automation investment"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">247%</div>
              <div className="text-sm text-green-600 mt-1">+45% vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>

      {/* Main Content */}
      <DashboardGrid cols={12} gap="lg">
        {/* Workflow Performance Chart */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Workflow Performance Trends"
            subtitle="Success rates and execution times over time"
          >
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-lg">Performance Chart</div>
                <div className="text-gray-400 text-sm">Workflow success rates and execution times</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Workflow Status */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Workflow Status"
            subtitle="Current automation health"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm text-green-700">Active</span>
                <span className="text-sm font-medium text-green-900">8</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-yellow-700">Paused</span>
                <span className="text-sm font-medium text-yellow-900">2</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm text-red-700">Error</span>
                <span className="text-sm font-medium text-red-900">1</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Draft</span>
                <span className="text-sm font-medium text-gray-900">1</span>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Workflow List */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Workflow Details"
            subtitle="Individual workflow performance and status"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Saved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-indigo-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{workflow.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1 capitalize">{workflow.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workflow.success}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workflow.avgTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {workflow.timeSaved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.lastRun}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default AutomationPage;
