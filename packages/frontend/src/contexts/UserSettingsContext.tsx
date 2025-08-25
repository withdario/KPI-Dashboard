import React, { createContext, useContext, ReactNode } from 'react';

// Types
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface DashboardCustomization {
  layout: 'grid' | 'list' | 'compact';
  widgets: string[];
  sidebarCollapsed: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

// Mock data for development
const mockUserProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  avatar: 'https://via.placeholder.com/40'
};

const mockThemeSettings: ThemeSettings = {
  mode: 'light',
  primaryColor: '#3B82F6',
  accentColor: '#10B981',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  colorBlindness: 'none'
};

const mockDashboardCustomization: DashboardCustomization = {
  layout: 'grid',
  widgets: ['metrics', 'charts', 'alerts'],
  sidebarCollapsed: false
};

const mockNotificationPreferences: NotificationPreferences = {
  email: true,
  push: false,
  sms: false,
  frequency: 'daily'
};

// Context interface
interface UserSettingsContextType {
  useThemeSettings: () => {
    data: ThemeSettings | null;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateThemeSettings: () => {
    mutateAsync: (data: ThemeSettings) => Promise<ThemeSettings>;
    isPending: boolean;
  };
  useUserProfile: () => {
    data: UserProfile | null;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateUserProfile: () => {
    mutateAsync: (data: Partial<UserProfile>) => Promise<UserProfile>;
    isPending: boolean;
  };
  useDashboardCustomization: () => {
    data: DashboardCustomization | null;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateDashboardCustomization: () => {
    mutateAsync: (data: Partial<DashboardCustomization>) => Promise<DashboardCustomization>;
    isPending: boolean;
  };
  useNotificationPreferences: () => {
    data: NotificationPreferences | null;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateNotificationPreferences: () => {
    mutateAsync: (data: Partial<NotificationPreferences>) => Promise<NotificationPreferences>;
    isPending: boolean;
  };
}

// Create context
const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

// Provider component
export const UserSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: UserSettingsContextType = {
    useThemeSettings: () => ({
      data: mockThemeSettings,
      isLoading: false,
      error: null
    }),
    useUpdateThemeSettings: () => ({
      mutateAsync: async (data: ThemeSettings) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return data;
      },
      isPending: false
    }),
    useUserProfile: () => ({
      data: mockUserProfile,
      isLoading: false,
      error: null
    }),
    useUpdateUserProfile: () => ({
      mutateAsync: async (data: Partial<UserProfile>) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return { ...mockUserProfile, ...data };
      },
      isPending: false
    }),
    useDashboardCustomization: () => ({
      data: mockDashboardCustomization,
      isLoading: false,
      error: null
    }),
    useUpdateDashboardCustomization: () => ({
      mutateAsync: async (data: Partial<DashboardCustomization>) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return { ...mockDashboardCustomization, ...data };
      },
      isPending: false
    }),
    useNotificationPreferences: () => ({
      data: mockNotificationPreferences,
      isLoading: false,
      error: null
    }),
    useUpdateNotificationPreferences: () => ({
      mutateAsync: async (data: Partial<NotificationPreferences>) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return { ...mockNotificationPreferences, ...data };
      },
      isPending: false
    })
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};

// Hook to use the context
export const useUserSettings = (): UserSettingsContextType => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
