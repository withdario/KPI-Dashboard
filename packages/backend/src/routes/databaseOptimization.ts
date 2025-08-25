import { Router } from 'express';
import DatabaseOptimizationController from '../controllers/databaseOptimizationController';

const router = Router();
let databaseOptimizationController: DatabaseOptimizationController;

export const setDatabaseOptimizationController = (controller: DatabaseOptimizationController) => {
  databaseOptimizationController = controller;
};

// Create a type that includes both the router and the setter function
export interface DatabaseOptimizationRoutes extends Router {
  setDatabaseOptimizationController: (controller: DatabaseOptimizationController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as DatabaseOptimizationRoutes;
routesWithSetters.setDatabaseOptimizationController = setDatabaseOptimizationController;

// Database optimization endpoints
router.post('/analyze', async (req, res) => {
  try {
    const analyses = await databaseOptimizationController.analyzeQueries();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/index-recommendations', async (req, res) => {
  try {
    const recommendations = await databaseOptimizationController.generateIndexRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/query-optimizations', async (req, res) => {
  try {
    const optimizations = await databaseOptimizationController.generateQueryOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/cache-strategies', async (req, res) => {
  try {
    const strategies = await databaseOptimizationController.generateCacheStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute-index/:recommendationId', async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const result = await databaseOptimizationController.executeIndexCreation(recommendationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await databaseOptimizationController.getOptimizationStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/queries/analyses', async (req, res) => {
  try {
    const analyses = await databaseOptimizationController.getQueryAnalyses();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/indexes/recommendations', async (req, res) => {
  try {
    const recommendations = await databaseOptimizationController.getIndexRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/queries/optimizations', async (req, res) => {
  try {
    const optimizations = await databaseOptimizationController.getQueryOptimizations();
    res.json(optimizations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/cache/strategies', async (req, res) => {
  try {
    const strategies = await databaseOptimizationController.getCacheStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default routesWithSetters;
