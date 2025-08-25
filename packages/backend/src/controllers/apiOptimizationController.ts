import ApiOptimizationService from '../services/apiOptimizationService';

export default class ApiOptimizationController {
  private apiOptimizationService: ApiOptimizationService;

  constructor(apiOptimizationService: ApiOptimizationService) {
    this.apiOptimizationService = apiOptimizationService;
  }

  // Analyze API endpoints
  async analyzeApiEndpoints() {
    return await this.apiOptimizationService.analyzeApiEndpoints();
  }

  // Generate caching strategies
  async generateCachingStrategies() {
    return await this.apiOptimizationService.generateCachingStrategies();
  }

  // Generate code optimizations
  async generateCodeOptimizations() {
    return await this.apiOptimizationService.generateCodeOptimizations();
  }

  // Generate load balancing strategies
  async generateLoadBalancingStrategies() {
    return await this.apiOptimizationService.generateLoadBalancingStrategies();
  }

  // Execute caching strategy
  async executeCachingStrategy(strategyId: string) {
    if (!strategyId) {
      throw new Error('Strategy ID is required');
    }
    return await this.apiOptimizationService.executeCachingStrategy(strategyId);
  }

  // Execute code optimization
  async executeCodeOptimization(optimizationId: string) {
    if (!optimizationId) {
      throw new Error('Optimization ID is required');
    }
    return await this.apiOptimizationService.executeCodeOptimization(optimizationId);
  }

  // Get optimization status
  async getOptimizationStatus() {
    return await this.apiOptimizationService.getOptimizationStatus();
  }

  // Get all endpoint analyses
  getEndpointAnalyses() {
    return this.apiOptimizationService.getEndpointAnalyses();
  }

  // Get all caching strategies
  getCachingStrategies() {
    return this.apiOptimizationService.getCachingStrategies();
  }

  // Get all code optimizations
  getCodeOptimizations() {
    return this.apiOptimizationService.getCodeOptimizations();
  }

  // Get all load balancing strategies
  getLoadBalancingStrategies() {
    return this.apiOptimizationService.getLoadBalancingStrategies();
  }
}
