import FrontendOptimizationService from '../services/frontendOptimizationService';

export default class FrontendOptimizationController {
  private frontendOptimizationService: FrontendOptimizationService;

  constructor(frontendOptimizationService: FrontendOptimizationService) {
    this.frontendOptimizationService = frontendOptimizationService;
  }

  // Analyze frontend performance
  async analyzeFrontendPerformance() {
    return await this.frontendOptimizationService.analyzeFrontendPerformance();
  }

  // Generate bundle optimizations
  async generateBundleOptimizations() {
    return await this.frontendOptimizationService.generateBundleOptimizations();
  }

  // Generate asset optimizations
  async generateAssetOptimizations() {
    return await this.frontendOptimizationService.generateAssetOptimizations();
  }

  // Generate rendering optimizations
  async generateRenderingOptimizations() {
    return await this.frontendOptimizationService.generateRenderingOptimizations();
  }

  // Execute bundle optimization
  async executeBundleOptimization(optimizationId: string) {
    if (!optimizationId) {
      throw new Error('Optimization ID is required');
    }
    return await this.frontendOptimizationService.executeBundleOptimization(optimizationId);
  }

  // Execute asset optimization
  async executeAssetOptimization(optimizationId: string) {
    if (!optimizationId) {
      throw new Error('Optimization ID is required');
    }
    return await this.frontendOptimizationService.executeAssetOptimization(optimizationId);
  }

  // Execute rendering optimization
  async executeRenderingOptimization(optimizationId: string) {
    if (!optimizationId) {
      throw new Error('Optimization ID is required');
    }
    return await this.frontendOptimizationService.executeRenderingOptimization(optimizationId);
  }

  // Get optimization status
  async getOptimizationStatus() {
    return await this.frontendOptimizationService.getOptimizationStatus();
  }

  // Get all performance analyses
  getPerformanceAnalyses() {
    return this.frontendOptimizationService.getPerformanceAnalyses();
  }

  // Get all bundle optimizations
  getBundleOptimizations() {
    return this.frontendOptimizationService.getBundleOptimizations();
  }

  // Get all asset optimizations
  getAssetOptimizations() {
    return this.frontendOptimizationService.getAssetOptimizations();
  }

  // Get all rendering optimizations
  getRenderingOptimizations() {
    return this.frontendOptimizationService.getRenderingOptimizations();
  }
}
