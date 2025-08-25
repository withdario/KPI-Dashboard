import { Request, Response } from 'express';
import PerformanceOptimizationService from '../services/performanceOptimizationService';

export class PerformanceOptimizationController {
  private optimizationService: PerformanceOptimizationService;

  constructor(optimizationService: PerformanceOptimizationService) {
    this.optimizationService = optimizationService;
  }

  async getOptimizationRecommendations(): Promise<any> {
    try {
      const recommendations = await this.optimizationService.generateOptimizationRecommendations();
      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      throw new Error('Failed to get optimization recommendations');
    }
  }

  async executeOptimization(actionId: string): Promise<any> {
    try {
      const result = await this.optimizationService.executeOptimization(actionId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new Error('Failed to execute optimization');
    }
  }

  async getOptimizationStatus(): Promise<any> {
    try {
      const status = await this.optimizationService.getOptimizationStatus();
      return {
        success: true,
        data: status
      };
    } catch (error) {
      throw new Error('Failed to get optimization status');
    }
  }

  async getOptimizationActions(): Promise<any> {
    try {
      const actions = await this.optimizationService.getOptimizationActions();
      return {
        success: true,
        data: actions
      };
    } catch (error) {
      throw new Error('Failed to get optimization actions');
    }
  }

  async getOptimizationAction(id: string): Promise<any> {
    try {
      const action = await this.optimizationService.getOptimizationAction(id);
      if (!action) {
        throw new Error('Optimization action not found');
      }
      return {
        success: true,
        data: action
      };
    } catch (error) {
      throw new Error('Failed to get optimization action');
    }
  }

  async getOptimizationResults(): Promise<any> {
    try {
      const results = await this.optimizationService.getOptimizationResults();
      return {
        success: true,
        data: results
      };
    } catch (error) {
      throw new Error('Failed to get optimization results');
    }
  }

  // Legacy methods for backward compatibility
  async getOptimizationRecommendationsLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const recommendations = await this.optimizationService.generateOptimizationRecommendations();
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get optimization recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async executeOptimizationLegacy(req: Request, res: Response): Promise<Response> {
    try {
      const { optimizationId } = req.params;
      
      if (!optimizationId) {
        return res.status(400).json({
          success: false,
          error: 'Optimization ID is required'
        });
      }
      
      const result = await this.optimizationService.executeOptimization(optimizationId);
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to execute optimization',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOptimizationStatusLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const status = await this.optimizationService.getOptimizationStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get optimization status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOptimizationActionsLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const actions = await this.optimizationService.getOptimizationActions();
      
      res.json({
        success: true,
        data: actions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get optimization actions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOptimizationActionLegacy(req: Request, res: Response): Promise<Response> {
    try {
      const { actionId } = req.params;
      const action = this.optimizationService.getOptimizationAction(actionId);
      
      if (!action) {
        return res.status(404).json({
          success: false,
          error: 'Optimization action not found'
        });
      }
      
      return res.json({
        success: true,
        data: action
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get optimization action',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOptimizationResultsLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const results = await this.optimizationService.getOptimizationResults();
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get optimization results',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
