import { Router } from 'express';
import PerformanceAlertController from '../controllers/performanceAlertController';

const router = Router();
let alertController: PerformanceAlertController;

export const setAlertController = (controller: PerformanceAlertController) => {
  alertController = controller;
};

// Create a type that includes both the router and the setter function
export interface PerformanceAlertRoutes extends Router {
  setAlertController: (controller: PerformanceAlertController) => void;
}

// Cast the router to include the setter function
const routesWithSetters = router as PerformanceAlertRoutes;
routesWithSetters.setAlertController = setAlertController;

// Performance alert endpoints
router.get('/summary', async (req, res) => {
  try {
    const summary = await alertController.getAlertSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const alerts = await alertController.getAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await alertController.getAlert(alertId);
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;
    const result = await alertController.acknowledgeAlert(alertId, acknowledgedBy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolvedBy, resolutionNotes } = req.body;
    const result = await alertController.resolveAlert(alertId, resolvedBy, resolutionNotes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:alertId/dismiss', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { dismissedBy, dismissalReason } = req.body;
    const result = await alertController.dismissAlert(alertId, dismissedBy, dismissalReason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/custom', async (req, res) => {
  try {
    const { type, category, title, description, metric, currentValue, threshold, severity } = req.body;
    const alert = await alertController.createCustomAlert(type, category, title, description, metric, currentValue, threshold, severity);
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/rules/all', async (req, res) => {
  try {
    const rules = await alertController.getRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const rule = await alertController.getRule(ruleId);
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const ruleData = req.body;
    const rule = await alertController.createRule(ruleData);
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const ruleData = req.body;
    const rule = await alertController.updateRule(ruleId, ruleData);
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    await alertController.deleteRule(ruleId);
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/notifications/all', async (req, res) => {
  try {
    const notifications = await alertController.getNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/monitoring/status', async (req, res) => {
  try {
    const status = await alertController.getMonitoringStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/monitoring/start', async (req, res) => {
  try {
    await alertController.startMonitoring();
    res.json({ message: 'Monitoring started' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default routesWithSetters;
