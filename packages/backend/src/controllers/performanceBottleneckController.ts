import { Request, Response } from 'express';
import PerformanceBottleneckService from '../services/performanceBottleneckService';

export class PerformanceBottleneckController {
  private bottleneckService: PerformanceBottleneckService;

  constructor(bottleneckService: PerformanceBottleneckService) {
    this.bottleneckService = bottleneckService;
  }

  async detectBottlenecks(): Promise<any> {
    try {
      const bottlenecks = await this.bottleneckService.detectBottlenecks();
      return {
        success: true,
        data: bottlenecks
      };
    } catch (error) {
      throw new Error('Failed to detect bottlenecks');
    }
  }

  async getBottlenecks(): Promise<any> {
    try {
      const bottlenecks = this.bottleneckService.getBottlenecks();
      return {
        success: true,
        data: bottlenecks
      };
    } catch (error) {
      throw new Error('Failed to get bottlenecks');
    }
  }

  async getActiveBottlenecks(): Promise<any> {
    try {
      const bottlenecks = this.bottleneckService.getActiveBottlenecks();
      return {
        success: true,
        data: bottlenecks
      };
    } catch (error) {
      throw new Error('Failed to get active bottlenecks');
    }
  }

  async getBottleneck(id: string): Promise<any> {
    try {
      const bottleneck = this.bottleneckService.getBottleneck(id);
      if (!bottleneck) {
        throw new Error('Bottleneck not found');
      }
      return {
        success: true,
        data: bottleneck
      };
    } catch (error) {
      throw new Error('Failed to get bottleneck');
    }
  }

  async updateBottleneckStatus(id: string, status: 'active' | 'resolved' | 'investigating', notes?: string): Promise<any> {
    try {
      const bottleneck = this.bottleneckService.updateBottleneckStatus(id, status, notes);
      return {
        success: true,
        data: bottleneck
      };
    } catch (error) {
      throw new Error('Failed to update bottleneck status');
    }
  }

  async getThresholds(): Promise<any> {
    try {
      const thresholds = this.bottleneckService.getThresholds();
      return {
        success: true,
        data: thresholds
      };
    } catch (error) {
      throw new Error('Failed to get thresholds');
    }
  }

  async updateThresholds(thresholds: any): Promise<any> {
    try {
      const updatedThresholds = this.bottleneckService.updateThresholds(thresholds);
      return {
        success: true,
        data: updatedThresholds
      };
    } catch (error) {
      throw new Error('Failed to update thresholds');
    }
  }

  // Legacy methods for backward compatibility
  async detectBottlenecksLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const bottlenecks = await this.bottleneckService.detectBottlenecks();
      
      res.json({
        success: true,
        data: bottlenecks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to detect bottlenecks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBottlenecksLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const bottlenecks = this.bottleneckService.getBottlenecks();
      
      res.json({
        success: true,
        data: bottlenecks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get bottlenecks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getActiveBottlenecksLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const bottlenecks = this.bottleneckService.getActiveBottlenecks();
      
      res.json({
        success: true,
        data: bottlenecks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get active bottlenecks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBottleneckLegacy(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const bottleneck = this.bottleneckService.getBottleneck(id);
      
      if (!bottleneck) {
        return res.status(404).json({
          success: false,
          error: 'Bottleneck not found'
        });
      }
      
      return res.json({
        success: true,
        data: bottleneck
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get bottleneck',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateBottleneckStatusLegacy(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({
          success: false,
          error: 'Bottleneck ID and status are required'
        });
      }
      
      const bottleneck = this.bottleneckService.updateBottleneckStatus(id, status, notes);
      
      return res.json({
        success: true,
        data: bottleneck
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update bottleneck status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getThresholdsLegacy(_req: Request, res: Response): Promise<void> {
    try {
      const thresholds = this.bottleneckService.getThresholds();
      
      res.json({
        success: true,
        data: thresholds
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get thresholds',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateThresholdsLegacy(req: Request, res: Response): Promise<Response> {
    try {
      const thresholds = req.body;
      
      if (!thresholds || typeof thresholds !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Valid thresholds object is required'
        });
      }
      
      const updatedThresholds = this.bottleneckService.updateThresholds(thresholds);
      
      return res.json({
        success: true,
        data: updatedThresholds
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update thresholds',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default PerformanceBottleneckController;
