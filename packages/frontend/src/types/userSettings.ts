export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role?: string;
  timezone: string;
  language: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCustomization {
  layout: 'grid' | 'list' | 'compact';
  defaultView: 'overview' | 'analytics' | 'automation' | 'business';
  widgetOrder: string[];
  visibleWidgets: string[];
  refreshInterval: number; // in minutes
  autoRefresh: boolean;
  showCharts: boolean;
  showMetrics: boolean;
  showAlerts: boolean;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: {
      automationAlerts: boolean;
      performanceIssues: boolean;
      businessInsights: boolean;
      systemUpdates: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      automationAlerts: boolean;
      performanceIssues: boolean;
      businessInsights: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    types: {
      automationAlerts: boolean;
      performanceIssues: boolean;
      businessInsights: boolean;
      systemUpdates: boolean;
    };
  };
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

export interface DataPreferences {
  exportFormat: 'csv' | 'json' | 'excel';
  includeMetadata: boolean;
  autoExport: boolean;
  exportSchedule: 'daily' | 'weekly' | 'monthly' | 'never';
  dataRetention: number; // in days
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface IntegrationSettings {
  googleAnalytics: {
    enabled: boolean;
    refreshInterval: number;
    dataRetention: number;
  };
  n8n: {
    enabled: boolean;
    webhookUrl?: string;
    apiKey?: string;
    refreshInterval: number;
    dataRetention: number;
  };
  customIntegrations: Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    config: Record<string, any>;
  }>;
}

export interface PrivacySettings {
  dataSharing: {
    analytics: boolean;
    performance: boolean;
    anonymous: boolean;
  };
  cookiePreferences: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  dataExport: {
    allowDownload: boolean;
    allowDeletion: boolean;
    retentionPeriod: number;
  };
}

export interface UserSettings {
  profile: UserProfile;
  dashboard: DashboardCustomization;
  notifications: NotificationPreferences;
  theme: ThemeSettings;
  data: DataPreferences;
  integrations: IntegrationSettings;
  privacy: PrivacySettings;
}

export interface SettingsValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'conflict';
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
}

export interface OnboardingProgress {
  userId: string;
  steps: OnboardingStep[];
  currentStep: string;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
}

export interface UserPreferences {
  settings: UserSettings;
  onboarding: OnboardingProgress;
  helpArticles: HelpArticle[];
  lastSync: string;
}
