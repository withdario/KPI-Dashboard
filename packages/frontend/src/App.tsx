import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AutomationPage from '@/pages/AutomationPage';
import TrendsPage from '@/pages/TrendsPage';
import UsersPage from '@/pages/UsersPage';
import SocialMediaPage from '@/pages/SocialMediaPage';
import CRMPage from '@/pages/CRMPage';
import SettingsPage from '@/pages/SettingsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="trends" element={<TrendsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="social" element={<SocialMediaPage />} />
          <Route path="crm" element={<CRMPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
