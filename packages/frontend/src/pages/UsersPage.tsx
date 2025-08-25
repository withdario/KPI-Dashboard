import DashboardLayout from '../components/DashboardLayout';
import DashboardGrid from '../components/DashboardGrid';
import DashboardWidget from '../components/DashboardWidget';
import { Users, UserPlus, UserCheck, UserX, Mail, Calendar, Shield, Activity } from 'lucide-react';

const UsersPage = () => {
  const userStats = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'text-blue-600' },
    { label: 'New Users', value: '156', change: '+8%', icon: UserPlus, color: 'text-green-600' },
    { label: 'Active Users', value: '2,134', change: '+15%', icon: UserCheck, color: 'text-emerald-600' },
    { label: 'Churned Users', value: '23', change: '-5%', icon: UserX, color: 'text-red-600' }
  ];

  const recentUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
    { id: 2, name: 'Michael Chen', email: 'm.chen@company.com', role: 'User', status: 'Active', lastActive: '1 day ago' },
    { id: 3, name: 'Emily Rodriguez', email: 'e.rodriguez@company.com', role: 'Manager', status: 'Active', lastActive: '3 hours ago' },
    { id: 4, name: 'David Kim', email: 'd.kim@company.com', role: 'User', status: 'Inactive', lastActive: '1 week ago' },
    { id: 5, name: 'Lisa Thompson', email: 'l.thompson@company.com', role: 'User', status: 'Active', lastActive: '5 hours ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'User':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Manage users, roles, and permissions across your platform"
    >
      <DashboardGrid cols={12} gap="lg">
        {/* User Statistics */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="User Overview"
            subtitle="Key user metrics and statistics"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`${stat.color} mb-2`}>
                    <stat.icon className="h-8 w-8 mx-auto" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-green-600">
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Recent Users */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Recent Users"
            subtitle="Latest user activity and status"
            actions={
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                View All Users
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* User Activity */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="User Activity"
            subtitle="Real-time user engagement metrics"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Online Now</span>
                </div>
                <span className="text-sm font-medium text-gray-900">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Active Today</span>
                </div>
                <span className="text-sm font-medium text-gray-900">2,134</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">This Week</span>
                </div>
                <span className="text-sm font-medium text-gray-900">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">This Month</span>
                </div>
                <span className="text-sm font-medium text-gray-900">2,847</span>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* User Growth Chart */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="User Growth"
            subtitle="Monthly user acquisition trends"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Users className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">User growth chart</p>
                <p className="text-sm text-gray-400">Chart component will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* User Engagement */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="User Engagement"
            subtitle="Session duration and page views"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Activity className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Engagement metrics</p>
                <p className="text-sm text-gray-400">Analytics dashboard will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Security & Permissions */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Security & Permissions"
            subtitle="User access control and security settings"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-blue-600 mb-2">
                  <Shield className="h-8 w-8 mx-auto" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Role Management</h4>
                <p className="text-xs text-gray-500">Manage user roles and permissions</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-green-600 mb-2">
                  <Mail className="h-8 w-8 mx-auto" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Email Verification</h4>
                <p className="text-xs text-gray-500">Verify user email addresses</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-purple-600 mb-2">
                  <Calendar className="h-8 w-8 mx-auto" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Access Logs</h4>
                <p className="text-xs text-gray-500">Track user login activity</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default UsersPage;
