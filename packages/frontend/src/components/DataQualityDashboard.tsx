import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  Clock,
  Database
} from 'lucide-react';

interface DataQualityMetrics {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  qualityScore: number;
  errorRate: number;
  warningRate: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  timelinessScore: number;
}

interface Anomaly {
  type: 'outlier' | 'trend_change' | 'seasonal_break' | 'data_drift';
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
}

interface AnomalyDetectionResult {
  hasAnomalies: boolean;
  anomalies: Anomaly[];
  confidence: number;
  recommendations: string[];
}

interface DataQualityAlert {
  id: string;
  businessEntityId: string;
  alertType: 'quality_threshold' | 'anomaly_detected' | 'validation_failure' | 'data_drift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface DataQualityDashboardProps {
  businessEntityId: string;
}

const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({ businessEntityId }) => {
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetrics | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyDetectionResult | null>(null);
  const [alerts, setAlerts] = useState<DataQualityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('sessions');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDataQualityData();
  }, [businessEntityId, dateRange]);

  const fetchDataQualityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch quality metrics
      const metricsResponse = await fetch(
        `/api/data-quality/metrics/${businessEntityId}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch quality metrics');
      }

      const metricsData = await metricsResponse.json();
      setQualityMetrics(metricsData.metrics);

      // Fetch anomalies
      const anomaliesResponse = await fetch(
        `/api/data-quality/anomalies/${businessEntityId}?metricType=${selectedMetricType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (anomaliesResponse.ok) {
        const anomaliesData = await anomaliesResponse.json();
        setAnomalies(anomaliesData.anomalies);
      }

      // Fetch alerts
      const alertsResponse = await fetch(
        `/api/data-quality/alerts/${businessEntityId}?limit=10&resolved=false`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 75) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!qualityMetrics) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No quality metrics available for the selected period.</AlertDescription>
      </Alert>
    );
  }

  const qualityScoreBadge = getQualityScoreBadge(qualityMetrics.qualityScore);

  // Chart data for quality scores
  const qualityScoresData = [
    { name: 'Completeness', score: qualityMetrics.completenessScore, color: '#10B981' },
    { name: 'Accuracy', score: qualityMetrics.accuracyScore, color: '#3B82F6' },
    { name: 'Consistency', score: qualityMetrics.consistencyScore, color: '#8B5CF6' },
    { name: 'Timeliness', score: qualityMetrics.timelinessScore, color: '#F59E0B' }
  ];

  // Chart data for records breakdown
  const recordsData = [
    { name: 'Valid', value: qualityMetrics.validRecords, color: '#10B981' },
    { name: 'Invalid', value: qualityMetrics.invalidRecords, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Quality Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and analyze data quality metrics for {businessEntityId}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <Button onClick={fetchDataQualityData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Quality Score */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">
            Overall Data Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`text-6xl font-bold ${getQualityScoreColor(qualityMetrics.qualityScore)}`}>
              {qualityMetrics.qualityScore}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${qualityScoreBadge.color}`}>
              {qualityScoreBadge.text}
            </Badge>
          </div>
          <Progress value={qualityMetrics.qualityScore} className="h-3" />
          <p className="text-gray-600 mt-2">
            Based on {qualityMetrics.totalRecords} total records
          </p>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityMetrics.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Records in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Records</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qualityMetrics.validRecords.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((qualityMetrics.validRecords / qualityMetrics.totalRecords) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {qualityMetrics.errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Records with validation errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {qualityMetrics.warningRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Records with warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Quality Metrics */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">Quality Scores</TabsTrigger>
          <TabsTrigger value="records">Records Breakdown</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Dimension Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityScoresData.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm font-bold">{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Records Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={recordsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {recordsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Anomaly Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedMetricType}
                      onChange={(e) => setSelectedMetricType(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="sessions">Sessions</option>
                      <option value="users">Users</option>
                      <option value="pageviews">Pageviews</option>
                      <option value="conversions">Conversions</option>
                      <option value="revenue">Revenue</option>
                    </select>
                    <Button onClick={fetchDataQualityData} variant="outline" size="sm">
                      Detect Anomalies
                    </Button>
                  </div>

                  {anomalies.hasAnomalies ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">
                          {anomalies.anomalies.length} Anomalies Detected
                        </span>
                        <Badge variant="outline">
                          Confidence: {(anomalies.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {anomalies.anomalies.map((anomaly, index) => (
                          <Alert key={index} className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertTitle className="flex items-center space-x-2">
                              <span>{anomaly.type.replace('_', ' ').toUpperCase()}</span>
                              <Badge className={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity}
                              </Badge>
                            </AlertTitle>
                            <AlertDescription>
                              <div className="space-y-2">
                                <p><strong>Metric:</strong> {anomaly.metric}</p>
                                <p><strong>Value:</strong> {anomaly.value}</p>
                                <p><strong>Expected Range:</strong> {anomaly.expectedRange[0]} - {anomaly.expectedRange[1]}</p>
                                <p><strong>Description:</strong> {anomaly.description}</p>
                                <p><strong>Timestamp:</strong> {new Date(anomaly.timestamp).toLocaleString()}</p>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          {anomalies.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-gray-600">No anomalies detected in the selected data</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Confidence: {(anomalies.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Select a metric type to detect anomalies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Active Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="flex items-center space-x-2">
                    <span>{alert.alertType.replace('_', ' ').toUpperCase()}</span>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>ID: {alert.id}</span>
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataQualityDashboard;
