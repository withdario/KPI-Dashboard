import { Router } from 'express';
import ApiOptimizationController from '../controllers/apiOptimizationController';

const router = Router();
let apiOptimizationController: ApiOptimizationController;

export const setApiOptimizationController = (controller: ApiOptimizationController) => {
  apiOptimizationController = controller;
};

// Create a type that includes both the router and the setter function
export interface ApiOptimizationRoutes extends Router {
  setApiOptimizationController: (controller: ApiOptimizationController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as ApiOptimizationRoutes;
routesWithSetters.setApiOptimizationController = setApiOptimizationController;

// API optimization endpoints
router.post('/analyze', async (req, res) => {
  try {
    const analyses = await apiOptimizationController.analyzeApiEndpoints();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/caching-strategies', async (req, res) => {
  try {
    const strategies = await apiOptimizationController.generateCachingStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/code-optimizations', async (req, res) => {
  try {
    const optimizations = await apiOptimizationController.generateCodeOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/load-balancing-strategies', async (req, res) => {
  try {
    const strategies = await apiOptimizationController.generateLoadBalancingStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute-caching/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    const result = await apiOptimizationController.executeCachingStrategy(strategyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute-code/:optimizationId', async (req, res) => {
  try {
    const { optimizationId } = req.params;
    const result = await apiOptimizationController.executeCodeOptimization(optimizationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await apiOptimizationController.getOptimizationStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/endpoints/analyses', async (req, res) => {
  try {
    const analyses = await apiOptimizationController.getEndpointAnalyses();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/caching/strategies', async (req, res) => {
  try {
    const strategies = await apiOptimizationController.getCachingStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/code/optimizations', async (req, res) => {
  try {
    const optimizations = await apiOptimizationController.getCodeOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/load-balancing/strategies', async (req, res) => {
  try {
    const strategies = await apiOptimizationController.getLoadBalancingStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default routesWithSetters;
