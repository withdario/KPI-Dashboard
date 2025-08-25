import { Router } from 'express';
import { PerformanceBottleneckController } from '../controllers/performanceBottleneckController';

const router = Router();
let bottleneckController: PerformanceBottleneckController;

export const setBottleneckController = (controller: PerformanceBottleneckController) => {
  bottleneckController = controller;
};

// Create a type that includes both the router and the setter function
export interface PerformanceBottleneckRoutes extends Router {
  setBottleneckController: (controller: PerformanceBottleneckController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as PerformanceBottleneckRoutes;
routesWithSetters.setBottleneckController = setBottleneckController;

export default routesWithSetters;



// Performance bottleneck endpoints
router.get('/detect', async (req, res) => {
  try {
    const bottlenecks = await bottleneckController.detectBottlenecks();
    res.json(bottlenecks);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const bottlenecks = await bottleneckController.getBottlenecks();
    res.json(bottlenecks);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const bottlenecks = await bottleneckController.getActiveBottlenecks();
    res.json(bottlenecks);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bottleneck = await bottleneckController.getBottleneck(id);
    res.json(bottleneck);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await bottleneckController.updateBottleneckStatus(id, status, notes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/thresholds', async (req, res) => {
  try {
    const thresholds = await bottleneckController.getThresholds();
    res.json(thresholds);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/thresholds', async (req, res) => {
  try {
    const thresholds = req.body;
    const result = await bottleneckController.updateThresholds(thresholds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});


