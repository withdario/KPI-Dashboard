import React from 'react';
import UserSettingsDashboard from '../components/UserSettingsDashboard';

const UserSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <UserSettingsDashboard />
    </div>
  );
};

export default UserSettingsPage;
