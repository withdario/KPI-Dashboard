import DashboardLayout from '@/components/DashboardLayout';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardWidget from '@/components/DashboardWidget';
import { Building, Users, DollarSign, Calendar, TrendingUp, Target, CheckCircle, Clock, UserPlus, Phone, Mail, MapPin } from 'lucide-react';

const CRMPage = () => {
  const salesMetrics = [
    { label: 'Closed Sales This Month', value: '24', change: '+18%', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Revenue This Month', value: '$127,500', change: '+22%', icon: DollarSign, color: 'text-blue-600' },
    { label: 'Meetings This Week', value: '18', change: '+12%', icon: Calendar, color: 'text-purple-600' },
    { label: 'New Leads This Week', value: '42', change: '+8%', icon: UserPlus, color: 'text-orange-600' }
  ];

  const salesPipeline = [
    { stage: 'Qualified Leads', count: 156, value: '$89,000', conversion: '68%' },
    { stage: 'Proposals Sent', count: 89, value: '$156,000', conversion: '45%' },
    { stage: 'Negotiations', count: 34, value: '$89,000', conversion: '38%' },
    { stage: 'Closed Won', count: 24, value: '$127,500', conversion: '71%' }
  ];

  const recentDeals = [
    { company: 'TechCorp Solutions', value: '$25,000', stage: 'Closed Won', closeDate: 'Dec 15, 2024', owner: 'Sarah Johnson' },
    { company: 'Global Industries', value: '$18,500', stage: 'Negotiations', closeDate: 'Dec 20, 2024', owner: 'Michael Chen' },
    { company: 'StartupXYZ', value: '$32,000', stage: 'Proposal Sent', closeDate: 'Dec 25, 2024', owner: 'Emily Rodriguez' },
    { company: 'Enterprise Corp', value: '$45,000', stage: 'Qualified Lead', closeDate: 'Jan 5, 2025', owner: 'David Kim' }
  ];

  const topCustomers = [
    { name: 'TechCorp Solutions', revenue: '$125,000', deals: 8, lastContact: '2 days ago', status: 'Active' },
    { name: 'Global Industries', revenue: '$89,000', deals: 5, lastContact: '1 week ago', status: 'Active' },
    { name: 'StartupXYZ', revenue: '$67,000', deals: 3, lastContact: '3 days ago', status: 'Active' },
    { name: 'Enterprise Corp', revenue: '$156,000', deals: 12, lastContact: '5 days ago', status: 'Active' }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Negotiations':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal Sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'Qualified Lead':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title="CRM Dashboard"
      subtitle="Track sales performance, customer relationships, and revenue metrics"
    >
      <DashboardGrid cols={12} gap="lg">
        {/* Sales Overview */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Sales Overview"
            subtitle="Key sales metrics and performance indicators"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {salesMetrics.map((metric, index) => (
                <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className={`${metric.color} mb-2`}>
                    <metric.icon className="h-8 w-8 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {metric.label}
                  </div>
                  <div className="text-xs text-green-600">
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Sales Pipeline */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Sales Pipeline"
            subtitle="Current sales pipeline and conversion rates"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesPipeline.map((stage, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <Target className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stage.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stage.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stage.conversion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Revenue Forecast */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Revenue Forecast"
            subtitle="Projected revenue for current month"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Revenue forecast chart</p>
                <p className="text-sm text-gray-400">Chart component will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Recent Deals */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Recent Deals"
            subtitle="Latest sales opportunities and their status"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Close Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDeals.map((deal, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <Building className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{deal.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.closeDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.owner}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Top Customers */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Top Customers"
            subtitle="Highest revenue generating customers"
          >
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Revenue: {customer.revenue}
                  </div>
                  <div className="text-xs text-gray-500">
                    {customer.deals} deals • Last contact: {customer.lastContact}
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Customer Activity */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Customer Activity"
            subtitle="Recent customer interactions and touchpoints"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Call with TechCorp Solutions</div>
                  <div className="text-xs text-gray-500">Product demo scheduled for next week</div>
                </div>
                <div className="text-xs text-gray-400">2 hours ago</div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Email to Global Industries</div>
                  <div className="text-xs text-gray-500">Proposal sent and follow-up scheduled</div>
                </div>
                <div className="text-xs text-gray-400">1 day ago</div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Meeting with StartupXYZ</div>
                  <div className="text-xs text-gray-500">On-site presentation completed</div>
                </div>
                <div className="text-xs text-gray-400">3 days ago</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Sales Performance */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Sales Performance"
            subtitle="Team performance and individual metrics"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">SJ</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Sarah Johnson</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$45,000</div>
                  <div className="text-xs text-green-600">+25% vs last month</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">MC</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Michael Chen</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$38,500</div>
                  <div className="text-xs text-green-600">+18% vs last month</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">ER</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Emily Rodriguez</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">$32,000</div>
                  <div className="text-xs text-green-600">+12% vs last month</div>
                </div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default CRMPage;
