import React from 'react';
import BusinessOverviewDashboard from '../components/BusinessOverviewDashboard';
import DashboardLayout from '../components/DashboardLayout';

const BusinessOverviewPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BusinessOverviewDashboard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessOverviewPage;
