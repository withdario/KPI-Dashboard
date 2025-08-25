import { Router } from 'express';
import { PerformanceOptimizationController } from '../controllers/performanceOptimizationController';

const router = Router();
let optimizationController: PerformanceOptimizationController;

export const setOptimizationController = (controller: PerformanceOptimizationController) => {
  optimizationController = controller;
};

// Create a type that includes both the router and the setter function
export interface PerformanceOptimizationRoutes extends Router {
  setOptimizationController: (controller: PerformanceOptimizationController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as PerformanceOptimizationRoutes;
routesWithSetters.setOptimizationController = setOptimizationController;

export default routesWithSetters;



// Performance optimization endpoints
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await optimizationController.getOptimizationRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/execute/:actionId', async (req, res) => {
  try {
    const { actionId } = req.params;
    const result = await optimizationController.executeOptimization(actionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await optimizationController.getOptimizationStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/actions', async (req, res) => {
  try {
    const actions = await optimizationController.getOptimizationActions();
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/actions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const action = await optimizationController.getOptimizationAction(id);
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/results', async (req, res) => {
  try {
    const results = await optimizationController.getOptimizationResults();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});


