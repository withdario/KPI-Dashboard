import DashboardLayout from '../components/DashboardLayout';
import N8nAutomationDashboard from '../components/N8nAutomationDashboard';

const AutomationPage = () => {
  return (
    <DashboardLayout
      title="Automation Dashboard"
      subtitle="n8n workflow performance, ROI, and time savings"
    >
      <N8nAutomationDashboard />
    </DashboardLayout>
  );
};

export default AutomationPage;
