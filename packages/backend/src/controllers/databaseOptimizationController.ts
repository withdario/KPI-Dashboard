import DatabaseOptimizationService from '../services/databaseOptimizationService';

export default class DatabaseOptimizationController {
  private databaseOptimizationService: DatabaseOptimizationService;

  constructor(databaseOptimizationService: DatabaseOptimizationService) {
    this.databaseOptimizationService = databaseOptimizationService;
  }

  // Analyze database queries
  async analyzeQueries() {
    return await this.databaseOptimizationService.analyzeQueries();
  }

  // Generate index recommendations
  async generateIndexRecommendations() {
    return await this.databaseOptimizationService.generateIndexRecommendations();
  }

  // Generate query optimizations
  async generateQueryOptimizations() {
    return await this.databaseOptimizationService.generateQueryOptimizations();
  }

  // Generate cache strategies
  async generateCacheStrategies() {
    return await this.databaseOptimizationService.generateCacheStrategies();
  }

  // Execute index creation
  async executeIndexCreation(recommendationId: string) {
    if (!recommendationId) {
      throw new Error('Recommendation ID is required');
    }
    return await this.databaseOptimizationService.executeIndexCreation(recommendationId);
  }

  // Get optimization status
  async getOptimizationStatus() {
    return await this.databaseOptimizationService.getOptimizationStatus();
  }

  // Get all query analyses
  getQueryAnalyses() {
    return this.databaseOptimizationService.getQueryAnalyses();
  }

  // Get all index recommendations
  getIndexRecommendations() {
    return this.databaseOptimizationService.getIndexRecommendations();
  }

  // Get all query optimizations
  getQueryOptimizations() {
    return this.databaseOptimizationService.getQueryOptimizations();
  }

  // Get all cache strategies
  getCacheStrategies() {
    return this.databaseOptimizationService.getCacheStrategies();
  }
}
