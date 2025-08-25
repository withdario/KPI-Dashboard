import DashboardLayout from '../components/DashboardLayout';
import DashboardGrid from '../components/DashboardGrid';
import DashboardWidget from '../components/DashboardWidget';

const AnalyticsPage = () => {
  return (
    <DashboardLayout
      title="Analytics Dashboard"
      subtitle="Google Analytics metrics and insights for your business"
    >
      <DashboardGrid cols={12} gap="lg">
        {/* Traffic Metrics */}
        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Traffic Overview"
            subtitle="Page views, sessions, and users"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-lg">Traffic Chart</div>
                <div className="text-gray-400 text-sm">Google Analytics data visualization</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item colSpan={6}>
          <DashboardWidget
            title="Conversion Funnel"
            subtitle="User journey and conversion rates"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-lg">Funnel Chart</div>
                <div className="text-gray-400 text-sm">Conversion flow visualization</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Engagement Metrics */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Bounce Rate"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">42.3%</div>
              <div className="text-sm text-red-600 mt-1">+2.1% vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Session Duration"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4m 23s</div>
              <div className="text-sm text-green-600 mt-1">+12s vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Pages per Session"
            subtitle="Last 30 days"
            variant="elevated"
            size="sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">3.2</div>
              <div className="text-sm text-green-600 mt-1">+0.3 vs last month</div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Geographic Data */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Geographic Distribution"
            subtitle="Traffic by country and region"
          >
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-lg">Map Visualization</div>
                <div className="text-gray-400 text-sm">Geographic traffic distribution</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Top Pages */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Top Performing Pages"
            subtitle="Highest traffic and engagement"
          >
            <div className="space-y-3">
              {[
                { page: '/home', views: '12,847', bounce: '23%' },
                { page: '/products', views: '8,234', bounce: '31%' },
                { page: '/about', views: '5,123', bounce: '28%' },
                { page: '/contact', views: '3,456', bounce: '45%' },
                { page: '/blog', views: '2,789', bounce: '52%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.page}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>{item.views}</span>
                    <span className="text-xs">({item.bounce})</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
