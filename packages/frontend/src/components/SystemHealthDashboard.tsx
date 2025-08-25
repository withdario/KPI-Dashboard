import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  Server, 
  Shield, 
  TrendingUp, 
  XCircle,
  Play,
  Square,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SystemHealthMetrics {
  systemStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: {
    current: number;
    average: number;
    percentage: number;
  };
  databaseStatus: 'connected' | 'disconnected' | 'slow' | 'error';
  apiStatus: 'operational' | 'degraded' | 'down' | 'error';
  lastHealthCheck: Date;
  activeAlerts: number;
  performanceScore: number;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'error';
  category: 'system' | 'performance' | 'database' | 'api' | 'security';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  businessEntityId?: string;
}

interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: Date;
  responseTime: number;
  details?: Record<string, any>;
}

interface SystemMetrics {
  timestamp: Date;
  metrics: SystemHealthMetrics;
  alerts: SystemAlert[];
}

const SystemHealthDashboard: React.FC = () => {
  const [currentHealth, setCurrentHealth] = useState<SystemHealthMetrics | null>(null);
  const [healthHistory, setHealthHistory] = useState<SystemMetrics[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SystemAlert[]>([]);
  const [healthCheckResults, setHealthCheckResults] = useState<HealthCheckResult[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const [showAlertDialog, setShowAlertDialog] = useState<boolean>(false);
  const [newAlert, setNewAlert] = useState<Partial<SystemAlert>>({});

  // API base URL
  const API_BASE = '/api/system-health';

  // Fetch current health status
  const fetchCurrentHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/current`);
      if (!response.ok) throw new Error('Failed to fetch health data');
      const data = await response.json();
      setCurrentHealth(data.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch health data');
    }
  }, []);

  // Fetch health history
  const fetchHealthHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/history?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch health history');
      const data = await response.json();
      setHealthHistory(data.data.history);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch health history');
    }
  }, []);

  // Fetch active alerts
  const fetchActiveAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setActiveAlerts(data.data.alerts);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch alerts');
    }
  }, []);

  // Fetch health check results
  const fetchHealthCheckResults = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/health-checks`);
      if (!response.ok) throw new Error('Failed to fetch health check results');
      const data = await response.json();
      setHealthCheckResults(data.data.results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch health check results');
    }
  }, []);

  // Get monitoring status
  const fetchMonitoringStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring/status`);
      if (!response.ok) throw new Error('Failed to fetch monitoring status');
      const data = await response.json();
      setIsMonitoring(data.data.isActive);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch monitoring status');
    }
  }, []);

  // Start monitoring
  const startMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMs: refreshInterval })
      });
      if (!response.ok) throw new Error('Failed to start monitoring');
      setIsMonitoring(true);
      await fetchMonitoringStatus();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start monitoring');
    }
  };

  // Stop monitoring
  const stopMonitoring = async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring/stop`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to stop monitoring');
      setIsMonitoring(false);
      await fetchMonitoringStatus();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to stop monitoring');
    }
  };

  // Perform manual health check
  const performHealthCheck = async () => {
    try {
      const response = await fetch(`${API_BASE}/health-check`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to perform health check');
      await fetchCurrentHealth();
      await fetchHealthHistory();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to perform health check');
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'admin' })
      });
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      await fetchActiveAlerts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to acknowledge alert');
    }
  };

  // Create new alert
  const createAlert = async () => {
    try {
      const response = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      if (!response.ok) throw new Error('Failed to create alert');
      setShowAlertDialog(false);
      setNewAlert({});
      await fetchActiveAlerts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create alert');
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCurrentHealth(),
          fetchHealthHistory(),
          fetchActiveAlerts(),
          fetchHealthCheckResults(),
          fetchMonitoringStatus()
        ]);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchCurrentHealth, fetchHealthHistory, fetchActiveAlerts, fetchHealthCheckResults, fetchMonitoringStatus]);

  // Set up auto-refresh
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      fetchCurrentHealth();
      fetchHealthHistory();
      fetchActiveAlerts();
      fetchHealthCheckResults();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, fetchCurrentHealth, fetchHealthHistory, fetchActiveAlerts, fetchHealthCheckResults]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'connected':
      case 'operational':
        return 'bg-green-500';
      case 'warning':
      case 'warn':
      case 'slow':
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
      case 'fail':
      case 'error':
      case 'disconnected':
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
      case 'connected':
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
      case 'warn':
      case 'slow':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
      case 'fail':
      case 'error':
      case 'disconnected':
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Prepare chart data
  const chartData = healthHistory.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    performanceScore: item.metrics.performanceScore,
    memoryUsage: item.metrics.memoryUsage.percentage,
    uptime: item.metrics.uptime / 3600 // Convert to hours
  }));

  // Prepare alert data for pie chart
  const alertData = [
    { name: 'Critical', value: activeAlerts.filter(a => a.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: activeAlerts.filter(a => a.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: activeAlerts.filter(a => a.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: activeAlerts.filter(a => a.severity === 'low').length, color: '#22c55e' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system health data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <XCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-gray-600">Monitor system status, performance, and alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className="flex items-center space-x-2"
          >
            {isMonitoring ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
          </Button>
          <Button onClick={performHealthCheck} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Health Check
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {currentHealth && getStatusIcon(currentHealth.systemStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentHealth?.systemStatus?.toUpperCase() || 'UNKNOWN'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {currentHealth?.lastHealthCheck ? new Date(currentHealth.lastHealthCheck).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentHealth?.performanceScore || 0}/100</div>
            <Progress value={currentHealth?.performanceScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeAlerts.filter(a => a.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentHealth?.uptime ? formatUptime(currentHealth.uptime) : '0m'}
            </div>
            <p className="text-xs text-muted-foreground">System running time</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="performanceScore" stroke="#8884d8" name="Performance Score" />
                <Line type="monotone" dataKey="memoryUsage" stroke="#82ca9d" name="Memory Usage %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Memory Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: {currentHealth?.memoryUsage ? formatBytes(currentHealth.memoryUsage.used) : '0 B'}</span>
                  <span>{currentHealth?.memoryUsage?.percentage.toFixed(1) || 0}%</span>
                </div>
                <Progress value={currentHealth?.memoryUsage?.percentage || 0} />
                <div className="text-xs text-muted-foreground">
                  Total: {currentHealth?.memoryUsage ? formatBytes(currentHealth.memoryUsage.total) : '0 B'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="font-medium">CPU Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {currentHealth?.cpuUsage?.current || 0}%</span>
                  <span>Average: {currentHealth?.cpuUsage?.average || 0}%</span>
                </div>
                <Progress value={currentHealth?.cpuUsage?.current || 0} />
                <div className="text-xs text-muted-foreground">
                  Performance monitoring
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Database Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(currentHealth?.databaseStatus || 'unknown')}
                  <span className="capitalize">{currentHealth?.databaseStatus || 'unknown'}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Connection health
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Check Results */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthCheckResults.map((check, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="font-medium capitalize">{check.status}</div>
                  <div className="text-sm text-muted-foreground">{check.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {check.responseTime > 0 ? `${check.responseTime}ms` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Alerts</CardTitle>
          <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={(value) => setNewAlert({...newAlert, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setNewAlert({...newAlert, category: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select onValueChange={(value) => setNewAlert({...newAlert, severity: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    placeholder="Enter alert message"
                    value={newAlert.message || ''}
                    onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    placeholder="Enter alert source"
                    value={newAlert.source || ''}
                    onChange={(e) => setNewAlert({...newAlert, source: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createAlert} className="flex-1">Create Alert</Button>
                  <Button variant="outline" onClick={() => setShowAlertDialog(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No active alerts</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{alert.category}</TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{alert.source}</TableCell>
                    <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="refreshInterval">Refresh Interval (ms)</Label>
              <Input
                id="refreshInterval"
                type="number"
                min="5000"
                max="300000"
                step="1000"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum: 5 seconds, Maximum: 5 minutes
              </p>
            </div>
            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
