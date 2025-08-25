import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
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
import GoogleAnalyticsPage from '@/pages/GoogleAnalyticsPage';
import BusinessOverviewPage from '@/pages/BusinessOverviewPage';
import UserSettingsPage from '@/pages/UserSettingsPage';
import MobileDashboard from '@/pages/MobileDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import OfflineIndicator from '@/components/OfflineIndicator';
import { initializeCrossBrowserCompatibility } from '@/utils/crossBrowserCompatibility';

function App() {
  useEffect(() => {
    // Initialize cross-browser compatibility features
    initializeCrossBrowserCompatibility();
  }, []);

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
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/automation" element={<ProtectedRoute><AutomationPage /></ProtectedRoute>} />
        <Route path="/dashboard/trends" element={<ProtectedRoute><TrendsPage /></ProtectedRoute>} />
        <Route path="/dashboard/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/dashboard/social" element={<ProtectedRoute><SocialMediaPage /></ProtectedRoute>} />
        <Route path="/dashboard/crm" element={<ProtectedRoute><CRMPage /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Google Analytics Routes */}
        <Route path="/google-analytics/:propertyId" element={<ProtectedRoute><GoogleAnalyticsPage /></ProtectedRoute>} />

        {/* Business Overview Routes */}
        <Route path="/dashboard/business-overview" element={<ProtectedRoute><BusinessOverviewPage /></ProtectedRoute>} />

        {/* User Settings Route */}
        <Route path="/dashboard/user-settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />

        {/* Mobile Dashboard Route */}
        <Route path="/dashboard/mobile" element={<ProtectedRoute><MobileDashboard /></ProtectedRoute>} />
      </Routes>
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </>
  );
}

export default App;
