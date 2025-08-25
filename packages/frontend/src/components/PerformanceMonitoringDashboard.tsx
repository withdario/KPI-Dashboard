import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  getMetrics,
  getAlerts,
  getOptimizationRecommendations,
  getBottlenecks,
  getMetricsSummary,
  getAlertSummary,
  getOptimizationStatus,
  getTestStatus,
  getDatabaseOptimizationStatus,
  getApiOptimizationStatus,
  getFrontendOptimizationStatus,
  runBenchmark,
  runStressTest,
  runMemoryTest,
  clearTestHistory,
  analyzeQueries,
  analyzeApiEndpoints,
  analyzeFrontendPerformance,
  detectBottlenecks,
  startMonitoring,
  stopMonitoring
} from '../services/performanceApi';

interface PerformanceMetrics {
  api?: {
    responseTime: { current: number; average: number; p95: number; p99: number };
    throughput: { current: number; average: number };
    errorRate: { current: number; average: number };
    availability: { current: number; average: number };
  };
  database?: {
    queryTime: { current: number; average: number; p95: number; p99: number };
    throughput: { current: number; average: number };
    connectionPool: { current: number; max: number };
    slowQueries: { current: number; average: number };
  };
  system?: {
    cpuUsage: { current: number; average: number };
    memoryUsage: { current: number; average: number; max: number };
    diskUsage: { current: number; average: number; max: number };
    networkUsage: { current: number; average: number };
  };
  frontend?: {
    loadTime: { current: number; average: number; p95: number; p99: number };
    renderTime: { current: number; average: number };
    bundleSize: { current: number; average: number };
    assetCount: { current: number; average: number };
  };
}

interface PerformanceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface OptimizationRecommendation {
  id: string;
  type: string;
  description: string;
  estimatedImprovement: number;
  priority: string;
  status: string;
}

interface Bottleneck {
  id: string;
  type: string;
  severity: string;
  description: string;
  detectedAt: string;
  status: string;
}

const PerformanceMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch performance metrics
      try {
        const metricsData = await getMetrics();
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }

      // Fetch alerts
      try {
        const alertsData = await getAlerts();
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }

      // Fetch optimization recommendations
      try {
        const recommendationsData = await getOptimizationRecommendations();
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }

      // Fetch bottlenecks
      try {
        const bottlenecksData = await getBottlenecks();
        setBottlenecks(bottlenecksData);
      } catch (error) {
        console.error('Error fetching bottlenecks:', error);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'resolved':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatMetricValue = (value: number, unit: string = '') => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K${unit}`;
    }
    return `${value.toFixed(2)}${unit}`;
  };

  const formatTime = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}s`;
    }
    return `${value.toFixed(2)}ms`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="API Response Time"
          value={formatTime(metrics.api?.responseTime?.current || 0)}
          trend={metrics.api?.responseTime?.current || 0 > (metrics.api?.responseTime?.average || 0) ? 'up' : 'down'}
          status={metrics.api?.responseTime?.current || 0 > 1000 ? 'warning' : 'good'}
        />
        <MetricCard
          title="Database Query Time"
          value={formatTime(metrics.database?.queryTime?.current || 0)}
          trend={metrics.database?.queryTime?.current || 0 > (metrics.database?.queryTime?.average || 0) ? 'up' : 'down'}
          status={metrics.database?.queryTime?.current || 0 > 500 ? 'warning' : 'good'}
        />
        <MetricCard
          title="CPU Usage"
          value={formatPercentage(metrics.system?.cpuUsage?.current || 0)}
          trend={metrics.system?.cpuUsage?.current || 0 > (metrics.system?.cpuUsage?.average || 0) ? 'up' : 'down'}
          status={metrics.system?.cpuUsage?.current || 0 > 80 ? 'warning' : 'good'}
        />
        <MetricCard
          title="Memory Usage"
          value={formatPercentage(metrics.system?.memoryUsage?.current || 0)}
          trend={metrics.system?.memoryUsage?.current || 0 > (metrics.system?.memoryUsage?.average || 0) ? 'up' : 'down'}
          status={metrics.system?.memoryUsage?.current || 0 > 80 ? 'warning' : 'good'}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">API Response Time Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateTimeSeriesData(metrics.api?.responseTime?.current || 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={[
              { name: 'CPU', value: metrics.system?.cpuUsage?.current || 0, fill: '#ef4444' },
              { name: 'Memory', value: metrics.system?.memoryUsage?.current || 0, fill: '#f59e0b' },
              { name: 'Disk', value: metrics.system?.diskUsage?.current || 0, fill: '#3b82f6' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getStatusColor(alert.type) }}
                />
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium`}
                      style={{ backgroundColor: getSeverityColor(alert.severity), color: 'white' }}>
                  {alert.severity}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="text-red-800 font-semibold">Critical</h4>
          <p className="text-2xl font-bold text-red-600">
            {alerts.filter(a => a.severity === 'critical').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-yellow-800 font-semibold">Warning</h4>
          <p className="text-2xl font-bold text-yellow-600">
            {alerts.filter(a => a.severity === 'warning').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Info</h4>
          <p className="text-2xl font-bold text-blue-600">
            {alerts.filter(a => a.severity === 'low').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Resolved</h4>
          <p className="text-2xl font-bold text-green-600">
            {alerts.filter(a => a.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">All Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-500">{alert.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {alert.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white`}
                          style={{ backgroundColor: getSeverityColor(alert.severity) }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white`}
                          style={{ backgroundColor: getStatusColor(alert.status) }}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* Optimization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Pending</h4>
          <p className="text-2xl font-bold text-blue-600">
            {recommendations.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-green-800 font-semibold">Completed</h4>
          <p className="text-2xl font-bold text-green-600">
            {recommendations.filter(r => r.status === 'completed').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="text-purple-800 font-semibold">Total Impact</h4>
          <p className="text-2xl font-bold text-purple-600">
            {formatPercentage(recommendations.reduce((sum, r) => sum + (r.estimatedImprovement || 0), 0))}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recommendations.map((rec) => (
            <div key={rec.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{rec.description}</h4>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {rec.type}</span>
                    <span>Priority: {rec.priority}</span>
                    <span>Impact: {formatPercentage(rec.estimatedImprovement)}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white`}
                        style={{ backgroundColor: getStatusColor(rec.status) }}>
                    {rec.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBottlenecksTab = () => (
    <div className="space-y-6">
      {/* Bottleneck Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="text-red-800 font-semibold">Critical</h4>
          <p className="text-2xl font-bold text-red-600">
            {bottlenecks.filter(b => b.severity === 'critical').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-yellow-800 font-semibold">High</h4>
          <p className="text-2xl font-bold text-yellow-600">
            {bottlenecks.filter(b => b.severity === 'high').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-blue-800 font-semibold">Medium</h4>
          <p className="text-2xl font-bold text-blue-600">
            {bottlenecks.filter(b => b.severity === 'medium').length}
          </p>
        </div>
      </div>

      {/* Bottlenecks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Performance Bottlenecks</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {bottlenecks.map((bottleneck) => (
            <div key={bottleneck.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{bottleneck.description}</h4>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {bottleneck.type}</span>
                    <span>Detected: {new Date(bottleneck.detectedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white`}
                        style={{ backgroundColor: getSeverityColor(bottleneck.severity) }}>
                    {bottleneck.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white`}
                        style={{ backgroundColor: getStatusColor(bottleneck.status) }}>
                    {bottleneck.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      {/* API Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">API Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Response Time (Current)"
            value={formatTime(metrics.api?.responseTime?.current || 0)}
            status={metrics.api?.responseTime?.current || 0 > 1000 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Response Time (P95)"
            value={formatTime(metrics.api?.responseTime?.p95 || 0)}
            status={metrics.api?.responseTime?.p95 || 0 > 2000 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Throughput"
            value={formatMetricValue(metrics.api?.throughput?.current || 0, ' req/s')}
            status="good"
          />
          <MetricCard
            title="Error Rate"
            value={formatPercentage(metrics.api?.errorRate?.current || 0)}
            status={metrics.api?.errorRate?.current || 0 > 5 ? 'warning' : 'good'}
          />
        </div>
      </div>

      {/* Database Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Database Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Query Time (Current)"
            value={formatTime(metrics.database?.queryTime?.current || 0)}
            status={metrics.database?.queryTime?.current || 0 > 500 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Query Time (P95)"
            value={formatTime(metrics.database?.queryTime?.p95 || 0)}
            status={metrics.database?.queryTime?.p95 || 0 > 1000 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Connection Pool"
            value={`${metrics.database?.connectionPool?.current || 0}/${metrics.database?.connectionPool?.max || 0}`}
            status={metrics.database?.connectionPool?.current || 0 > (metrics.database?.connectionPool?.max || 0) * 0.8 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Slow Queries"
            value={String(metrics.database?.slowQueries?.current || 0)}
            status={metrics.database?.slowQueries?.current || 0 > 10 ? 'warning' : 'good'}
          />
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Resource Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="CPU Usage"
            value={formatPercentage(metrics.system?.cpuUsage?.current || 0)}
            status={metrics.system?.cpuUsage?.current || 0 > 80 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Memory Usage"
            value={formatPercentage(metrics.system?.memoryUsage?.current || 0)}
            status={metrics.system?.memoryUsage?.current || 0 > 80 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Disk Usage"
            value={formatPercentage(metrics.system?.diskUsage?.current || 0)}
            status={metrics.system?.diskUsage?.current || 0 > 85 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Network Usage"
            value={formatMetricValue(metrics.system?.networkUsage?.current || 0, ' MB/s')}
            status="good"
          />
        </div>
      </div>

      {/* Frontend Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Frontend Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Page Load Time"
            value={formatTime(metrics.frontend?.loadTime?.current || 0)}
            status={metrics.frontend?.loadTime?.current || 0 > 3000 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Render Time"
            value={formatTime(metrics.frontend?.renderTime?.current || 0)}
            status={metrics.frontend?.renderTime?.current || 0 > 1000 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Bundle Size"
            value={formatMetricValue(metrics.frontend?.bundleSize?.current || 0, ' KB')}
            status={metrics.frontend?.bundleSize?.current || 0 > 1024 ? 'warning' : 'good'}
          />
          <MetricCard
            title="Asset Count"
            value={String(metrics.frontend?.assetCount?.current || 0)}
            status={metrics.frontend?.assetCount?.current || 0 > 20 ? 'warning' : 'good'}
          />
        </div>
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className="space-y-6">
      {/* Performance Testing Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Testing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={async () => {
              try {
                await runBenchmark();
                alert('Benchmark started successfully!');
              } catch (error) {
                alert('Failed to start benchmark: ' + error);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Run Benchmark
          </button>
          <button
            onClick={async () => {
              try {
                await runStressTest();
                alert('Stress test started successfully!');
              } catch (error) {
                alert('Failed to start stress test: ' + error);
              }
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Run Stress Test
          </button>
          <button
            onClick={async () => {
              try {
                await runMemoryTest();
                alert('Memory test started successfully!');
              } catch (error) {
                alert('Failed to start memory test: ' + error);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Run Memory Test
          </button>
          <button
            onClick={async () => {
              try {
                await clearTestHistory();
                alert('Test history cleared successfully!');
              } catch (error) {
                alert('Failed to clear test history: ' + error);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Test History
          </button>
        </div>
      </div>

      {/* Optimization Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={async () => {
              try {
                await analyzeQueries();
                alert('Database analysis started successfully!');
              } catch (error) {
                alert('Failed to start database analysis: ' + error);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Analyze Database
          </button>
          <button
            onClick={async () => {
              try {
                await analyzeApiEndpoints();
                alert('API analysis started successfully!');
              } catch (error) {
                alert('Failed to start API analysis: ' + error);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Analyze API
          </button>
          <button
            onClick={async () => {
              try {
                await analyzeFrontendPerformance();
                alert('Frontend analysis started successfully!');
              } catch (error) {
                alert('Failed to start frontend analysis: ' + error);
              }
            }}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            Analyze Frontend
          </button>
          <button
            onClick={async () => {
              try {
                await detectBottlenecks();
                alert('Bottleneck detection started successfully!');
              } catch (error) {
                alert('Failed to start bottleneck detection: ' + error);
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Detect Bottlenecks
          </button>
        </div>
      </div>

      {/* Monitoring Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monitoring Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={async () => {
              try {
                await startMonitoring();
                alert('Monitoring started successfully!');
              } catch (error) {
                alert('Failed to start monitoring: ' + error);
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Start Monitoring
          </button>
          <button
            onClick={async () => {
              try {
                await stopMonitoring();
                alert('Monitoring stopped successfully!');
              } catch (error) {
                alert('Failed to stop monitoring: ' + error);
              }
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Stop Monitoring
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading performance data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring and optimization of system performance
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setRefreshInterval(30000)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                refreshInterval === 30000
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              30s
            </button>
            <button
              onClick={() => setRefreshInterval(60000)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                refreshInterval === 60000
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              1m
            </button>
            <button
              onClick={() => setRefreshInterval(300000)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                refreshInterval === 300000
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              5m
            </button>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh Now
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'alerts', label: 'Alerts' },
              { id: 'optimization', label: 'Optimization' },
              { id: 'bottlenecks', label: 'Bottlenecks' },
              { id: 'metrics', label: 'Detailed Metrics' },
              { id: 'actions', label: 'Actions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'alerts' && renderAlertsTab()}
        {activeTab === 'optimization' && renderOptimizationTab()}
        {activeTab === 'bottlenecks' && renderBottlenecksTab()}
        {activeTab === 'metrics' && renderMetricsTab()}
        {activeTab === 'actions' && renderActionsTab()}
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down';
  status: 'good' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down') => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      );
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {trend && getTrendIcon(trend)}
      </div>
    </div>
  );
};

// Helper function to generate time series data
const generateTimeSeriesData = (currentValue: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString(),
      value: currentValue + (Math.random() - 0.5) * currentValue * 0.2
    });
  }
  
  return data;
};

export default PerformanceMonitoringDashboard;
