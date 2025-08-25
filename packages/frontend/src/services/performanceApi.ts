import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const performanceApi = axios.create({
  baseURL: `${API_BASE_URL}/api/performance`,
  timeout: 10000,
});

// Performance Monitoring
export const getMetrics = async () => {
  const response = await performanceApi.get('/metrics');
  return response.data;
};

export const getMetricsSummary = async () => {
  const response = await performanceApi.get('/metrics/summary');
  return response.data;
};

export const getMetricsByType = async (type: string) => {
  const response = await performanceApi.get(`/metrics/${type}`);
  return response.data;
};

export const getConfig = async () => {
  const response = await performanceApi.get('/config');
  return response.data;
};

export const updateConfig = async (config: any) => {
  const response = await performanceApi.put('/config', config);
  return response.data;
};

export const startMonitoring = async () => {
  const response = await performanceApi.post('/start');
  return response.data;
};

export const stopMonitoring = async () => {
  const response = await performanceApi.post('/stop');
  return response.data;
};

// Performance Alerts
export const getAlerts = async () => {
  const response = await performanceApi.get('/alerts');
  return response.data;
};

export const getAlertSummary = async () => {
  const response = await performanceApi.get('/alerts/summary');
  return response.data;
};

export const acknowledgeAlert = async (alertId: string, acknowledgedBy: string) => {
  const response = await performanceApi.put(`/alerts/${alertId}/acknowledge`, { acknowledgedBy });
  return response.data;
};

export const resolveAlert = async (alertId: string, resolvedBy: string, resolutionNotes?: string) => {
  const response = await performanceApi.put(`/alerts/${alertId}/resolve`, { resolvedBy, resolutionNotes });
  return response.data;
};

export const dismissAlert = async (alertId: string, dismissedBy: string, dismissalReason?: string) => {
  const response = await performanceApi.put(`/alerts/${alertId}/dismiss`, { dismissedBy, dismissalReason });
  return response.data;
};

// Performance Bottlenecks
export const detectBottlenecks = async () => {
  const response = await performanceApi.get('/bottlenecks/detect');
  return response.data;
};

export const getBottlenecks = async () => {
  const response = await performanceApi.get('/bottlenecks');
  return response.data;
};

export const getActiveBottlenecks = async () => {
  const response = await performanceApi.get('/bottlenecks/active');
  return response.data;
};

export const updateBottleneckStatus = async (id: string, status: string, notes?: string) => {
  const response = await performanceApi.put(`/bottlenecks/${id}/status`, { status, notes });
  return response.data;
};

// Performance Optimization
export const getOptimizationRecommendations = async () => {
  const response = await performanceApi.get('/optimization/recommendations');
  return response.data;
};

export const executeOptimization = async (optimizationId: string) => {
  const response = await performanceApi.post(`/optimization/execute/${optimizationId}`);
  return response.data;
};

export const getOptimizationStatus = async () => {
  const response = await performanceApi.get('/optimization/status');
  return response.data;
};

export const getOptimizationActions = async () => {
  const response = await performanceApi.get('/optimization/actions');
  return response.data;
};

export const getOptimizationResults = async () => {
  const response = await performanceApi.get('/optimization/results');
  return response.data;
};

// Performance Testing
export const runBenchmark = async () => {
  const response = await performanceApi.post('/testing/benchmark');
  return response.data;
};

export const runLoadTest = async (scenarioId: string) => {
  const response = await performanceApi.post(`/testing/load-test/${scenarioId}`);
  return response.data;
};

export const runStressTest = async () => {
  const response = await performanceApi.post('/testing/stress-test');
  return response.data;
};

export const runMemoryTest = async () => {
  const response = await performanceApi.post('/testing/memory-test');
  return response.data;
};

export const getTests = async () => {
  const response = await performanceApi.get('/testing');
  return response.data;
};

export const getTestStatus = async () => {
  const response = await performanceApi.get('/testing/status/summary');
  return response.data;
};

export const getBenchmarks = async () => {
  const response = await performanceApi.get('/testing/benchmarks/all');
  return response.data;
};

export const getScenarios = async () => {
  const response = await performanceApi.get('/testing/scenarios/all');
  return response.data;
};

export const clearTestHistory = async () => {
  const response = await performanceApi.delete('/testing/history');
  return response.data;
};

// Database Optimization
export const analyzeQueries = async () => {
  const response = await performanceApi.post('/database/analyze');
  return response.data;
};

export const generateIndexRecommendations = async () => {
  const response = await performanceApi.post('/database/index-recommendations');
  return response.data;
};

export const generateQueryOptimizations = async () => {
  const response = await performanceApi.post('/database/query-optimizations');
  return response.data;
};

export const generateCacheStrategies = async () => {
  const response = await performanceApi.post('/database/cache-strategies');
  return response.data;
};

export const executeIndexCreation = async (recommendationId: string) => {
  const response = await performanceApi.post(`/database/execute-index/${recommendationId}`);
  return response.data;
};

export const getDatabaseOptimizationStatus = async () => {
  const response = await performanceApi.get('/database/status');
  return response.data;
};

// API Optimization
export const analyzeApiEndpoints = async () => {
  const response = await performanceApi.post('/api/analyze');
  return response.data;
};

export const generateCachingStrategies = async () => {
  const response = await performanceApi.post('/api/caching-strategies');
  return response.data;
};

export const generateCodeOptimizations = async () => {
  const response = await performanceApi.post('/api/code-optimizations');
  return response.data;
};

export const generateLoadBalancingStrategies = async () => {
  const response = await performanceApi.post('/api/load-balancing-strategies');
  return response.data;
};

export const executeCachingStrategy = async (strategyId: string) => {
  const response = await performanceApi.post(`/api/execute-caching/${strategyId}`);
  return response.data;
};

export const executeCodeOptimization = async (optimizationId: string) => {
  const response = await performanceApi.post(`/api/execute-code/${optimizationId}`);
  return response.data;
};

export const getApiOptimizationStatus = async () => {
  const response = await performanceApi.get('/api/status');
  return response.data;
};

// Frontend Optimization
export const analyzeFrontendPerformance = async () => {
  const response = await performanceApi.post('/frontend/analyze');
  return response.data;
};

export const generateBundleOptimizations = async () => {
  const response = await performanceApi.post('/frontend/bundle-optimizations');
  return response.data;
};

export const generateAssetOptimizations = async () => {
  const response = await performanceApi.post('/frontend/asset-optimizations');
  return response.data;
};

export const generateRenderingOptimizations = async () => {
  const response = await performanceApi.post('/frontend/rendering-optimizations');
  return response.data;
};

export const executeBundleOptimization = async (optimizationId: string) => {
  const response = await performanceApi.post(`/frontend/execute-bundle/${optimizationId}`);
  return response.data;
};

export const executeAssetOptimization = async (optimizationId: string) => {
  const response = await performanceApi.post(`/frontend/execute-asset/${optimizationId}`);
  return response.data;
};

export const executeRenderingOptimization = async (optimizationId: string) => {
  const response = await performanceApi.post(`/frontend/execute-rendering/${optimizationId}`);
  return response.data;
};

export const getFrontendOptimizationStatus = async () => {
  const response = await performanceApi.get('/frontend/status');
  return response.data;
};

export default performanceApi;
