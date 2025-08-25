import { Router } from 'express';
import { PerformanceTestingController } from '../controllers/performanceTestingController';

const router = Router();
let testingController: PerformanceTestingController;

export const setTestingController = (controller: PerformanceTestingController) => {
  testingController = controller;
};

// Create a type that includes both the router and the setter function
export interface PerformanceTestingRoutes extends Router {
  setTestingController: (controller: PerformanceTestingController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as PerformanceTestingRoutes;
routesWithSetters.setTestingController = setTestingController;





// Performance testing endpoints
router.post('/benchmark', async (req, res) => {
  try {
    const result = await testingController.runBenchmark();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/load-test/:scenarioId', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const result = await testingController.runLoadTest(scenarioId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/stress-test', async (req, res) => {
  try {
    const result = await testingController.runStressTest();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/memory-test', async (req, res) => {
  try {
    const result = await testingController.runMemoryTest();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tests = await testingController.getTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await testingController.getTest(testId);
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/status/summary', async (req, res) => {
  try {
    const status = await testingController.getTestStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/benchmarks/all', async (req, res) => {
  try {
    const benchmarks = await testingController.getBenchmarks();
    res.json(benchmarks);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/scenarios/all', async (req, res) => {
  try {
    const scenarios = await testingController.getScenarios();
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/history', async (req, res) => {
  try {
    await testingController.clearTestHistory();
    res.json({ message: 'Test history cleared' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default routesWithSetters;
