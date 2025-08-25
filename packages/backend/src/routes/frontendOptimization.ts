import { Router } from 'express';
import FrontendOptimizationController from '../controllers/frontendOptimizationController';

const router = Router();
let frontendOptimizationController: FrontendOptimizationController;

export const setFrontendOptimizationController = (controller: FrontendOptimizationController) => {
  frontendOptimizationController = controller;
};

// Create a type that includes both the router and the setter function
export interface FrontendOptimizationRoutes extends Router {
  setFrontendOptimizationController: (controller: FrontendOptimizationController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as FrontendOptimizationRoutes;
routesWithSetters.setFrontendOptimizationController = setFrontendOptimizationController;

// Frontend optimization endpoints
router.post('/analyze', async (req, res) => {
  try {
    const analyses = await frontendOptimizationController.analyzeFrontendPerformance();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/bundle-optimizations', async (req, res) => {
  try {
    const optimizations = await frontendOptimizationController.generateBundleOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/asset-optimizations', async (req, res) => {
  try {
    const optimizations = await frontendOptimizationController.generateAssetOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/rendering-optimizations', async (req, res) => {
  try {
    const optimizations = await frontendOptimizationController.generateRenderingOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute-bundle/:optimizationId', async (req, res) => {
  try {
    const { optimizationId } = req.params;
    const result = await frontendOptimizationController.executeBundleOptimization(optimizationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute-asset/:optimizationId', async (req, res) => {
  try {
    const { optimizationId } = req.params;
    const result = await frontendOptimizationController.executeAssetOptimization(optimizationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute-rendering/:optimizationId', async (req, res) => {
  try {
    const { optimizationId } = req.params;
    const result = await frontendOptimizationController.executeRenderingOptimization(optimizationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await frontendOptimizationController.getOptimizationStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/performance/analyses', async (req, res) => {
  try {
    const analyses = frontendOptimizationController.getPerformanceAnalyses();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/bundle/optimizations', async (req, res) => {
  try {
    const optimizations = frontendOptimizationController.getBundleOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/asset/optimizations', async (req, res) => {
  try {
    const optimizations = frontendOptimizationController.getAssetOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/rendering/optimizations', async (req, res) => {
  try {
    const optimizations = frontendOptimizationController.getRenderingOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default routesWithSetters;
