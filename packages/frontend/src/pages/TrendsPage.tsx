import DashboardLayout from '../components/DashboardLayout';
import DashboardGrid from '../components/DashboardGrid';
import DashboardWidget from '../components/DashboardWidget';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Users, Activity } from 'lucide-react';

const TrendsPage = () => {
  const trends = [
    { 
      metric: 'Revenue Growth', 
      value: '+12.5%', 
      change: 'up', 
      period: 'vs last month',
      trend: [65, 72, 68, 75, 82, 78, 85, 92, 88, 95, 98, 102]
    },
    { 
      metric: 'Customer Acquisition', 
      value: '+8.2%', 
      change: 'up', 
      period: 'vs last month',
      trend: [45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 78, 82]
    },
    { 
      metric: 'Churn Rate', 
      value: '-2.1%', 
      change: 'down', 
      period: 'vs last month',
      trend: [8.5, 8.2, 7.9, 7.6, 7.3, 7.0, 6.7, 6.4, 6.1, 5.8, 5.5, 5.2]
    },
    { 
      metric: 'Conversion Rate', 
      value: '+3.4%', 
      change: 'up', 
      period: 'vs last month',
      trend: [2.1, 2.3, 2.2, 2.4, 2.6, 2.5, 2.7, 2.9, 2.8, 3.0, 3.2, 3.4]
    }
  ];

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getChangeColor = (change: string) => {
    switch (change) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout
      title="Business Trends"
      subtitle="Track key performance indicators and business trends over time"
    >
      <DashboardGrid cols={12} gap="lg">
        {/* Trends Overview */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Trends Overview"
            subtitle="Key metrics performance over the last 12 months"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trends.map((trend, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getChangeIcon(trend.change)}
                  </div>
                  <div className={`text-2xl font-bold ${getChangeColor(trend.change)} mb-1`}>
                    {trend.value}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {trend.metric}
                  </div>
                  <div className="text-xs text-gray-500">
                    {trend.period}
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Revenue Trends */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Revenue Trends"
            subtitle="Monthly revenue performance"
          >
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">Revenue chart visualization</p>
                <p className="text-sm text-gray-400">Chart component will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Customer Trends */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Customer Trends"
            subtitle="Customer acquisition and retention"
          >
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Users className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">Customer metrics chart</p>
                <p className="text-sm text-gray-400">Chart component will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Performance Metrics */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Performance Metrics"
            subtitle="Detailed breakdown of key performance indicators"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Monthly Recurring Revenue
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $125,000
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $111,000
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +12.6%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Customer Lifetime Value
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $2,450
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $2,180
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +12.4%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Customer Acquisition Cost
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $185
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $210
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      -11.9%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Seasonal Analysis */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Seasonal Analysis"
            subtitle="Identify patterns and seasonality in your data"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Calendar className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Seasonal patterns chart</p>
                <p className="text-sm text-gray-400">Advanced analytics will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Predictive Analytics */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Predictive Analytics"
            subtitle="Forecast future trends based on historical data"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Activity className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Predictive models</p>
                <p className="text-sm text-gray-400">ML-powered forecasting will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default TrendsPage;
