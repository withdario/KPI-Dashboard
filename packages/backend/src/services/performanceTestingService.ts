import PerformanceMonitoringService from './performanceMonitoringService';
import DatabaseMonitoringService from './databaseMonitoringService';

export interface PerformanceTest {
  id: string;
  name: string;
  type: 'benchmark' | 'load_test' | 'stress_test' | 'memory_test' | 'cpu_test';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  duration: number; // seconds
  results: PerformanceTestResult;
  configuration: PerformanceTestConfig;
}

export interface PerformanceTestResult {
  throughput: number; // requests per second
  responseTime: {
    min: number;
    max: number;
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  resourceUsage: {
    cpu: number; // percentage
    memory: number; // MB
    disk: number; // MB
    network: number; // MB
  };
  successRate: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

export interface PerformanceTestConfig {
  targetUrl: string;
  concurrentUsers: number;
  duration: number; // seconds
  rampUpTime: number; // seconds
  thinkTime: number; // seconds between requests
  timeout: number; // seconds
  headers?: Record<string, string>;
  payload?: any;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  timestamp: Date;
  baseline: PerformanceTestResult;
  current: PerformanceTestResult;
  improvement: number; // percentage
  regression: number; // percentage
  status: 'improved' | 'regressed' | 'stable';
}

export interface LoadTestScenario {
  id: string;
  name: string;
  description: string;
  config: PerformanceTestConfig;
  expectedResults: Partial<PerformanceTestResult>;
  thresholds: {
    maxResponseTime: number;
    maxErrorRate: number;
    minThroughput: number;
    maxCpuUsage: number;
    maxMemoryUsage: number;
  };
}

export class PerformanceTestingService {
  private performanceService: PerformanceMonitoringService;
  private databaseService: DatabaseMonitoringService;
  private tests: PerformanceTest[] = [];
  private benchmarks: BenchmarkResult[] = [];
  private scenarios: LoadTestScenario[] = [];
  private isRunning = false;

  constructor(
    performanceService: PerformanceMonitoringService,
    databaseService: DatabaseMonitoringService
  ) {
    this.performanceService = performanceService;
    this.databaseService = databaseService;
    this.initializeDefaultScenarios();
  }

  private initializeDefaultScenarios(): void {
    this.scenarios = [
      {
        id: 'scenario_1',
        name: 'Light Load Test',
        description: 'Test system performance under light load conditions',
        config: {
          targetUrl: '/api/health',
          concurrentUsers: 10,
          duration: 60,
          rampUpTime: 10,
          thinkTime: 1,
          timeout: 30
        },
        expectedResults: {
          responseTime: { average: 100 },
          errorRate: 0,
          throughput: 5
        },
        thresholds: {
          maxResponseTime: 200,
          maxErrorRate: 1,
          minThroughput: 3,
          maxCpuUsage: 30,
          maxMemoryUsage: 512
        }
      },
      {
        id: 'scenario_2',
        name: 'Medium Load Test',
        description: 'Test system performance under medium load conditions',
        config: {
          targetUrl: '/api/users',
          concurrentUsers: 50,
          duration: 120,
          rampUpTime: 20,
          thinkTime: 0.5,
          timeout: 30
        },
        expectedResults: {
          responseTime: { average: 300 },
          errorRate: 0,
          throughput: 20
        },
        thresholds: {
          maxResponseTime: 500,
          maxErrorRate: 2,
          minThroughput: 15,
          maxCpuUsage: 60,
          maxMemoryUsage: 1024
        }
      },
      {
        id: 'scenario_3',
        name: 'Heavy Load Test',
        description: 'Test system performance under heavy load conditions',
        config: {
          targetUrl: '/api/reports',
          concurrentUsers: 100,
          duration: 180,
          rampUpTime: 30,
          thinkTime: 0.2,
          timeout: 60
        },
        expectedResults: {
          responseTime: { average: 800 },
          errorRate: 1,
          throughput: 40
        },
        thresholds: {
          maxResponseTime: 1500,
          maxErrorRate: 5,
          minThroughput: 30,
          maxCpuUsage: 80,
          maxMemoryUsage: 2048
        }
      }
    ];
  }

  // Run a performance benchmark
  async runBenchmark(name: string, config: PerformanceTestConfig): Promise<BenchmarkResult> {
    if (this.isRunning) {
      throw new Error('Another performance test is currently running');
    }

    this.isRunning = true;
    const testId = this.generateId();
    
    try {
      // Create and start the test
      const test: PerformanceTest = {
        id: testId,
        name: `Benchmark: ${name}`,
        type: 'benchmark',
        status: 'running',
        startedAt: new Date(),
        duration: config.duration,
        results: this.createEmptyTestResult(),
        configuration: config
      };

      this.tests.push(test);

      // Run the benchmark
      const results = await this.executePerformanceTest(config);
      test.results = results;
      test.status = 'completed';
      test.completedAt = new Date();

      // Compare with baseline (if exists)
      const baseline = this.findBaseline(name);
      const benchmark = this.createBenchmarkResult(name, baseline, results);
      this.benchmarks.push(benchmark);

      this.isRunning = false;
      return benchmark;

    } catch (error) {
      const test = this.tests.find(t => t.id === testId);
      if (test) {
        test.status = 'failed';
        test.completedAt = new Date();
      }
      this.isRunning = false;
      throw error;
    }
  }

  // Run a load test
  async runLoadTest(scenarioId: string): Promise<PerformanceTest> {
    if (this.isRunning) {
      throw new Error('Another performance test is currently running');
    }

    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error('Load test scenario not found');
    }

    this.isRunning = true;
    const testId = this.generateId();

    try {
      // Create and start the test
      const test: PerformanceTest = {
        id: testId,
        name: `Load Test: ${scenario.name}`,
        type: 'load_test',
        status: 'running',
        startedAt: new Date(),
        duration: scenario.config.duration,
        results: this.createEmptyTestResult(),
        configuration: scenario.config
      };

      this.tests.push(test);

      // Run the load test
      const results = await this.executePerformanceTest(scenario.config);
      test.results = results;
      test.status = 'completed';
      test.completedAt = new Date();

      // Validate against thresholds
      this.validateTestResults(results, scenario.thresholds);

      this.isRunning = false;
      return test;

    } catch (error) {
      const test = this.tests.find(t => t.id === testId);
      if (test) {
        test.status = 'failed';
        test.completedAt = new Date();
      }
      this.isRunning = false;
      throw error;
    }
  }

  // Run a stress test
  async runStressTest(config: PerformanceTestConfig): Promise<PerformanceTest> {
    if (this.isRunning) {
      throw new Error('Another performance test is currently running');
    }

    this.isRunning = true;
    const testId = this.generateId();

    try {
      // Create and start the test
      const test: PerformanceTest = {
        id: testId,
        name: 'Stress Test',
        type: 'stress_test',
        status: 'running',
        startedAt: new Date(),
        duration: config.duration,
        results: this.createEmptyTestResult(),
        configuration: config
      };

      this.tests.push(test);

      // Run the stress test with gradually increasing load
      const results = await this.executeStressTest(config);
      test.results = results;
      test.status = 'completed';
      test.completedAt = new Date();

      this.isRunning = false;
      return test;

    } catch (error) {
      const test = this.tests.find(t => t.id === testId);
      if (test) {
        test.status = 'failed';
        test.completedAt = new Date();
      }
      this.isRunning = false;
      throw error;
    }
  }

  // Run a memory test
  async runMemoryTest(config: PerformanceTestConfig): Promise<PerformanceTest> {
    if (this.isRunning) {
      throw new Error('Another performance test is currently running');
    }

    this.isRunning = true;
    const testId = this.generateId();

    try {
      // Create and start the test
      const test: PerformanceTest = {
        id: testId,
        name: 'Memory Test',
        type: 'memory_test',
        status: 'running',
        startedAt: new Date(),
        duration: config.duration,
        results: this.createEmptyTestResult(),
        configuration: config
      };

      this.tests.push(test);

      // Run the memory test
      const results = await this.executeMemoryTest(config);
      test.results = results;
      test.status = 'completed';
      test.completedAt = new Date();

      this.isRunning = false;
      return test;

    } catch (error) {
      const test = this.tests.find(t => t.id === testId);
      if (test) {
        test.status = 'failed';
        test.completedAt = new Date();
      }
      this.isRunning = false;
      throw error;
    }
  }

  // Execute a performance test
  private async executePerformanceTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    const results: PerformanceTestResult = {
      throughput: 0,
      responseTime: { min: 0, max: 0, average: 0, p50: 0, p95: 0, p99: 0 },
      errorRate: 0,
      resourceUsage: { cpu: 0, memory: 0, disk: 0, network: 0 },
      successRate: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };

    const responseTimes: number[] = [];
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;

    // Simulate concurrent users making requests
    const userPromises: Promise<void>[] = [];
    
    for (let i = 0; i < config.concurrentUsers; i++) {
      const userPromise = this.simulateUserRequests(config, responseTimes, results);
      userPromises.push(userPromise);
      
      // Ramp up users gradually
      if (i < config.concurrentUsers - 1) {
        await this.delay(config.rampUpTime * 1000 / config.concurrentUsers);
      }
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    // Calculate final results
    results.totalRequests = totalRequests;
    results.successfulRequests = successfulRequests;
    results.failedRequests = failedRequests;
    results.successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    results.errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    results.throughput = totalRequests / (config.duration / 1000);

    // Calculate response time statistics
    if (responseTimes.length > 0) {
      responseTimes.sort((a, b) => a - b);
      results.responseTime.min = responseTimes[0];
      results.responseTime.max = responseTimes[responseTimes.length - 1];
      results.responseTime.average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      results.responseTime.p50 = this.calculatePercentile(responseTimes, 50);
      results.responseTime.p95 = this.calculatePercentile(responseTimes, 95);
      results.responseTime.p99 = this.calculatePercentile(responseTimes, 99);
    }

    // Simulate resource usage
    results.resourceUsage = this.simulateResourceUsage(config.concurrentUsers, config.duration);

    return results;
  }

  // Simulate user requests
  private async simulateUserRequests(
    config: PerformanceTestConfig,
    responseTimes: number[],
    results: PerformanceTestResult
  ): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + (config.duration * 1000);

    while (Date.now() < endTime) {
      const requestStart = Date.now();
      
      try {
        // Simulate making a request
        await this.simulateRequest(config);
        
        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        results.successfulRequests++;
        
        // Add think time between requests
        if (config.thinkTime > 0) {
          await this.delay(config.thinkTime * 1000);
        }
        
      } catch (error) {
        results.failedRequests++;
      }
      
      results.totalRequests++;
    }
  }

  // Simulate a single request
  private async simulateRequest(config: PerformanceTestConfig): Promise<void> {
    // Simulate network latency and processing time
    const latency = Math.random() * 100 + 50; // 50-150ms base latency
    const processingTime = Math.random() * 200 + 100; // 100-300ms processing time
    
    await this.delay(latency + processingTime);
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Simulated request failure');
    }
  }

  // Execute stress test with increasing load
  private async executeStressTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    // Start with low load and gradually increase
    const phases = [
      { concurrentUsers: Math.floor(config.concurrentUsers * 0.25), duration: config.duration * 0.3 },
      { concurrentUsers: Math.floor(config.concurrentUsers * 0.5), duration: config.duration * 0.3 },
      { concurrentUsers: Math.floor(config.concurrentUsers * 0.75), duration: config.duration * 0.2 },
      { concurrentUsers: config.concurrentUsers, duration: config.duration * 0.2 }
    ];

    const allResults: PerformanceTestResult[] = [];
    
    for (const phase of phases) {
      const phaseConfig = { ...config, concurrentUsers: phase.concurrentUsers, duration: phase.duration };
      const phaseResult = await this.executePerformanceTest(phaseConfig);
      allResults.push(phaseResult);
    }

    // Aggregate results
    return this.aggregateTestResults(allResults);
  }

  // Execute memory test
  private async executeMemoryTest(config: PerformanceTestConfig): Promise<PerformanceTestResult> {
    // Simulate memory-intensive operations
    const memoryUsage: number[] = [];
    const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    for (let i = 0; i < config.concurrentUsers; i++) {
      // Simulate memory allocation
      const allocatedMemory = Math.random() * 100 + 50; // 50-150MB per user
      memoryUsage.push(allocatedMemory);
      
      await this.delay(100);
    }
    
    const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalMemoryUsed = endMemory - startMemory;
    
    const results = await this.executePerformanceTest(config);
    results.resourceUsage.memory = totalMemoryUsed;
    
    return results;
  }

  // Validate test results against thresholds
  private validateTestResults(results: PerformanceTestResult, thresholds: any): void {
    const violations: string[] = [];
    
    if (results.responseTime.average > thresholds.maxResponseTime) {
      violations.push(`Response time ${results.responseTime.average}ms exceeds threshold ${thresholds.maxResponseTime}ms`);
    }
    
    if (results.errorRate > thresholds.maxErrorRate) {
      violations.push(`Error rate ${results.errorRate}% exceeds threshold ${thresholds.maxErrorRate}%`);
    }
    
    if (results.throughput < thresholds.minThroughput) {
      violations.push(`Throughput ${results.throughput} req/s below threshold ${thresholds.minThroughput} req/s`);
    }
    
    if (results.resourceUsage.cpu > thresholds.maxCpuUsage) {
      violations.push(`CPU usage ${results.resourceUsage.cpu}% exceeds threshold ${thresholds.maxCpuUsage}%`);
    }
    
    if (results.resourceUsage.memory > thresholds.maxMemoryUsage) {
      violations.push(`Memory usage ${results.resourceUsage.memory}MB exceeds threshold ${thresholds.maxMemoryUsage}MB`);
    }
    
    if (violations.length > 0) {
      throw new Error(`Performance test failed thresholds:\n${violations.join('\n')}`);
    }
  }

  // Create benchmark result
  private createBenchmarkResult(
    name: string,
    baseline: PerformanceTestResult | null,
    current: PerformanceTestResult
  ): BenchmarkResult {
    let improvement = 0;
    let regression = 0;
    let status: 'improved' | 'regressed' | 'stable' = 'stable';
    
    if (baseline) {
      const responseTimeDiff = ((baseline.responseTime.average - current.responseTime.average) / baseline.responseTime.average) * 100;
      const throughputDiff = ((current.throughput - baseline.throughput) / baseline.throughput) * 100;
      
      if (responseTimeDiff > 10 || throughputDiff > 10) {
        improvement = Math.max(responseTimeDiff, throughputDiff);
        status = 'improved';
      } else if (responseTimeDiff < -10 || throughputDiff < -10) {
        regression = Math.abs(Math.min(responseTimeDiff, throughputDiff));
        status = 'regressed';
      }
    }
    
    return {
      id: this.generateId(),
      name,
      timestamp: new Date(),
      baseline: baseline || this.createEmptyTestResult(),
      current,
      improvement,
      regression,
      status
    };
  }

  // Find baseline for comparison
  private findBaseline(name: string): PerformanceTestResult | null {
    const baseline = this.benchmarks
      .filter(b => b.name === name)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    return baseline ? baseline.current : null;
  }

  // Aggregate multiple test results
  private aggregateTestResults(results: PerformanceTestResult[]): PerformanceTestResult {
    const aggregated: PerformanceTestResult = this.createEmptyTestResult();
    
    if (results.length === 0) return aggregated;
    
    // Aggregate response times
    const allResponseTimes: number[] = [];
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    
    for (const result of results) {
      allResponseTimes.push(...this.extractResponseTimes(result));
      totalRequests += result.totalRequests;
      totalSuccessful += result.successfulRequests;
      totalFailed += result.failedRequests;
    }
    
    if (allResponseTimes.length > 0) {
      allResponseTimes.sort((a, b) => a - b);
      aggregated.responseTime.min = allResponseTimes[0];
      aggregated.responseTime.max = allResponseTimes[allResponseTimes.length - 1];
      aggregated.responseTime.average = allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length;
      aggregated.responseTime.p50 = this.calculatePercentile(allResponseTimes, 50);
      aggregated.responseTime.p95 = this.calculatePercentile(allResponseTimes, 95);
      aggregated.responseTime.p99 = this.calculatePercentile(allResponseTimes, 99);
    }
    
    aggregated.totalRequests = totalRequests;
    aggregated.successfulRequests = totalSuccessful;
    aggregated.failedRequests = totalFailed;
    aggregated.successRate = totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0;
    aggregated.errorRate = totalRequests > 0 ? (totalFailed / totalRequests) * 100 : 0;
    
    // Calculate average resource usage
    const avgCpu = results.reduce((sum, r) => sum + r.resourceUsage.cpu, 0) / results.length;
    const avgMemory = results.reduce((sum, r) => sum + r.resourceUsage.memory, 0) / results.length;
    const avgDisk = results.reduce((sum, r) => sum + r.resourceUsage.disk, 0) / results.length;
    const avgNetwork = results.reduce((sum, r) => sum + r.resourceUsage.network, 0) / results.length;
    
    aggregated.resourceUsage = { cpu: avgCpu, memory: avgMemory, disk: avgDisk, network: avgNetwork };
    
    return aggregated;
  }

  // Extract response times from test result
  private extractResponseTimes(result: PerformanceTestResult): number[] {
    // This is a simplified version - in a real implementation, you'd store individual response times
    const times: number[] = [];
    const { average, min, max } = result.responseTime;
    
    // Simulate distribution around the average
    for (let i = 0; i < Math.min(result.totalRequests, 100); i++) {
      const time = min + Math.random() * (max - min);
      times.push(time);
    }
    
    return times;
  }

  // Calculate percentile
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, Math.min(index, values.length - 1))];
  }

  // Simulate resource usage
  private simulateResourceUsage(concurrentUsers: number, duration: number): { cpu: number; memory: number; disk: number; network: number } {
    const baseCpu = 20; // Base CPU usage
    const baseMemory = 256; // Base memory usage in MB
    const baseDisk = 100; // Base disk usage in MB
    const baseNetwork = 50; // Base network usage in MB
    
    // Scale with concurrent users and duration
    const cpuUsage = Math.min(100, baseCpu + (concurrentUsers * 2) + (duration / 60) * 5);
    const memoryUsage = baseMemory + (concurrentUsers * 10) + (duration / 60) * 20;
    const diskUsage = baseDisk + (concurrentUsers * 2) + (duration / 60) * 5;
    const networkUsage = baseNetwork + (concurrentUsers * 5) + (duration / 60) * 10;
    
    return {
      cpu: Math.round(cpuUsage),
      memory: Math.round(memoryUsage),
      disk: Math.round(diskUsage),
      network: Math.round(networkUsage)
    };
  }

  // Create empty test result
  private createEmptyTestResult(): PerformanceTestResult {
    return {
      throughput: 0,
      responseTime: { min: 0, max: 0, average: 0, p50: 0, p95: 0, p99: 0 },
      errorRate: 0,
      resourceUsage: { cpu: 0, memory: 0, disk: 0, network: 0 },
      successRate: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return `perf_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all tests
  getTests(): PerformanceTest[] {
    return this.tests;
  }

  // Get test by ID
  getTest(testId: string): PerformanceTest | undefined {
    return this.tests.find(t => t.id === testId);
  }

  // Get all benchmarks
  getBenchmarks(): BenchmarkResult[] {
    return this.benchmarks;
  }

  // Get all scenarios
  getScenarios(): LoadTestScenario[] {
    return this.scenarios;
  }

  // Get test status
  getTestStatus(): { isRunning: boolean; totalTests: number; completedTests: number; failedTests: number } {
    const completedTests = this.tests.filter(t => t.status === 'completed').length;
    const failedTests = this.tests.filter(t => t.status === 'failed').length;
    
    return {
      isRunning: this.isRunning,
      totalTests: this.tests.length,
      completedTests,
      failedTests
    };
  }

  // Clear test history
  clearTestHistory(): void {
    this.tests = [];
    this.benchmarks = [];
  }
}

export default PerformanceTestingService;
