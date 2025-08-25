import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserSettingsDashboard from '../components/UserSettingsDashboard';
import { UserSettingsProvider } from '../contexts/UserSettingsContext';

const renderUserSettingsDashboard = () => {
  return render(
    <UserSettingsProvider>
      <UserSettingsDashboard />
    </UserSettingsProvider>
  );
};

describe('UserSettingsDashboard', () => {
  test('renders main heading and description', () => {
    renderUserSettingsDashboard();
    expect(screen.getByText('User Settings')).toBeInTheDocument();
    expect(screen.getByText(/Customize your dashboard experience/)).toBeInTheDocument();
  });

  test('renders all navigation tabs', () => {
    renderUserSettingsDashboard();
    // Use getAllByText to get all Profile elements, then find the navigation tab
    const profileElements = screen.getAllByText('Profile');
    const profileTab = profileElements.find(element => 
      element.closest('nav') && element.closest('button')
    );
    expect(profileTab).toBeInTheDocument();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Data & Export')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });

  test('shows profile tab content by default', () => {
    renderUserSettingsDashboard();
    expect(screen.getByTestId('user-profile-form')).toBeInTheDocument();
    expect(screen.getByText(/Manage your personal information/)).toBeInTheDocument();
  });

  test('renders quick actions section', () => {
    renderUserSettingsDashboard();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Update Profile')).toBeInTheDocument();
    expect(screen.getByText('Customize Theme')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  test('switches to dashboard tab when clicked', async () => {
    renderUserSettingsDashboard();
    const dashboardTab = screen.getByText('Dashboard');
    fireEvent.click(dashboardTab);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-customization-form')).toBeInTheDocument();
    });
  });

  test('switches to notifications tab when clicked', async () => {
    renderUserSettingsDashboard();
    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);

    await waitFor(() => {
      expect(screen.getByTestId('notification-preferences-form')).toBeInTheDocument();
    });
  });

  test('switches to theme tab when clicked', async () => {
    renderUserSettingsDashboard();
    const themeTab = screen.getByText('Theme');
    fireEvent.click(themeTab);

    await waitFor(() => {
      expect(screen.getByTestId('theme-settings-form')).toBeInTheDocument();
    });
  });
});
