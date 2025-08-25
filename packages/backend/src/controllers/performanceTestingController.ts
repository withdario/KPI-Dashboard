import { Request, Response } from 'express';
import PerformanceTestingService, { PerformanceTestConfig } from '../services/performanceTestingService';

export class PerformanceTestingController {
  private testingService: PerformanceTestingService;

  constructor(testingService: PerformanceTestingService) {
    this.testingService = testingService;
  }

  async runBenchmark(): Promise<any> {
    try {
      // Provide default parameters for the benchmark
      const defaultConfig: PerformanceTestConfig = {
        targetUrl: 'http://localhost:3000',
        concurrentUsers: 10,
        duration: 60,
        rampUpTime: 10,
        thinkTime: 1,
        timeout: 30,
        headers: {},
        payload: {}
      };
      const result = await this.testingService.runBenchmark('Default Benchmark', defaultConfig);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error('Failed to run benchmark');
    }
  }

  async runLoadTest(scenarioId: string): Promise<any> {
    try {
      const result = await this.testingService.runLoadTest(scenarioId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error('Failed to run load test');
    }
  }

  async runStressTest(): Promise<any> {
    try {
      // Provide default parameters for the stress test
      const defaultConfig: PerformanceTestConfig = {
        targetUrl: 'http://localhost:3000',
        concurrentUsers: 50,
        duration: 120,
        rampUpTime: 20,
        thinkTime: 0.5,
        timeout: 60,
        headers: {},
        payload: {}
      };
      const result = await this.testingService.runStressTest(defaultConfig);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error('Failed to run stress test');
    }
  }

  async runMemoryTest(): Promise<any> {
    try {
      // Provide default parameters for the memory test
      const defaultConfig: PerformanceTestConfig = {
        targetUrl: 'http://localhost:3000',
        concurrentUsers: 20,
        duration: 90,
        rampUpTime: 15,
        thinkTime: 1,
        timeout: 45,
        headers: {},
        payload: {}
      };
      const result = await this.testingService.runMemoryTest(defaultConfig);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error('Failed to run memory test');
    }
  }

  async getTests(): Promise<any> {
    try {
      const tests = this.testingService.getTests();
      return {
        success: true,
        data: tests
      };
    } catch (error) {
      throw new Error('Failed to get tests');
    }
  }

  async getTest(testId: string): Promise<any> {
    try {
      const test = this.testingService.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }
      return {
        success: true,
        data: test
      };
    } catch (error) {
      throw new Error('Failed to get test');
    }
  }

  async getTestStatus(): Promise<any> {
    try {
      const status = this.testingService.getTestStatus();
      return {
        success: true,
        data: status
      };
    } catch (error) {
      throw new Error('Failed to get test status');
    }
  }

  async getBenchmarks(): Promise<any> {
    try {
      const benchmarks = this.testingService.getBenchmarks();
      return {
        success: true,
        data: benchmarks
      };
    } catch (error) {
      throw new Error('Failed to get benchmarks');
    }
  }

  async getScenarios(): Promise<any> {
    try {
      const scenarios = this.testingService.getScenarios();
      return {
        success: true,
        data: scenarios
      };
    } catch (error) {
      throw new Error('Failed to get scenarios');
    }
  }

  async clearTestHistory(): Promise<void> {
    try {
      this.testingService.clearTestHistory();
    } catch (error) {
      throw new Error('Failed to clear test history');
    }
  }

  // Legacy methods for backward compatibility
  async runBenchmarkLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { name, config } = req.body;
      const result = await this.testingService.runBenchmark(name, config);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to run benchmark',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async runLoadTestLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { scenarioId } = req.params;
      const result = await this.testingService.runLoadTest(scenarioId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to run load test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async runStressTestLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { config } = req.body;
      const result = await this.testingService.runStressTest(config);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to run stress test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async runMemoryTestLegacy(req: Request, res: Response): Promise<void> {
    try {
      const { config } = req.body;
      const result = await this.testingService.runMemoryTest(config);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to run memory test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTestsLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const tests = this.testingService.getTests();
      
      res.json({
        success: true,
        data: tests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTestLegacy(req: Request, res: Response): Promise<Response> {
    try {
      const { testId } = req.params;
      const test = this.testingService.getTest(testId);
      
      if (!test) {
        return res.status(404).json({
          success: false,
          error: 'Test not found'
        });
      }
      
      return res.json({
        success: true,
        data: test
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTestStatusLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const status = this.testingService.getTestStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get test status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBenchmarksLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const benchmarks = this.testingService.getBenchmarks();
      
      res.json({
        success: true,
        data: benchmarks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get benchmarks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getScenariosLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const scenarios = this.testingService.getScenarios();
      
      res.json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async clearTestHistoryLegacy(_req: Request, res: Response): Promise<void> {
    try {
      this.testingService.clearTestHistory();
      
      res.json({
        success: true,
        message: 'Test history cleared successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear test history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
