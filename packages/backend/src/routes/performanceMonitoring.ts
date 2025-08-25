import { Router } from 'express';
import { PerformanceMonitoringController } from '../controllers/performanceMonitoringController';

const router = Router();
let monitoringController: PerformanceMonitoringController;

export const setMonitoringController = (controller: PerformanceMonitoringController) => {
  monitoringController = controller;
};

// Create a type that includes both the router and the setter function
export interface PerformanceMonitoringRoutes extends Router {
  setMonitoringController: (controller: PerformanceMonitoringController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as PerformanceMonitoringRoutes;
routesWithSetters.setMonitoringController = setMonitoringController;

export default routesWithSetters;



// Performance monitoring endpoints
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await monitoringController.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/metrics/summary', async (req, res) => {
  try {
    const summary = await monitoringController.getMetricsSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/metrics/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const metrics = await monitoringController.getMetricsByType(type);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await monitoringController.getAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/config', async (req, res) => {
  try {
    const config = await monitoringController.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/config', async (req, res) => {
  try {
    const config = req.body;
    const result = await monitoringController.updateConfig(config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/start', async (req, res) => {
  try {
    await monitoringController.startMonitoring();
    res.json({ message: 'Monitoring started' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/stop', async (req, res) => {
  try {
    await monitoringController.stopMonitoring();
    res.json({ message: 'Monitoring stopped' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});


