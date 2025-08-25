import { 
  UserSettings, 
  UserProfile, 
  DashboardCustomization, 
  NotificationPreferences,
  ThemeSettings,
  DataPreferences,
  IntegrationSettings,
  PrivacySettings,
  OnboardingProgress,
  HelpArticle,
  SettingsValidationError
} from '../types/userSettings';

// Mock data for development - in production this would come from API
const mockUserProfile: UserProfile = {
  id: 'user-123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Acme Corp',
  role: 'Business Owner',
  timezone: 'America/New_York',
  language: 'en',
  avatar: 'https://via.placeholder.com/150',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-30T00:00:00Z'
};

const mockDashboardCustomization: DashboardCustomization = {
  layout: 'grid',
  defaultView: 'overview',
  widgetOrder: ['overview', 'analytics', 'automation', 'business'],
  visibleWidgets: ['overview', 'analytics', 'automation', 'business'],
  refreshInterval: 5,
  autoRefresh: true,
  showCharts: true,
  showMetrics: true,
  showAlerts: true
};

const mockNotificationPreferences: NotificationPreferences = {
  email: {
    enabled: true,
    frequency: 'daily',
    types: {
      automationAlerts: true,
      performanceIssues: true,
      businessInsights: false,
      systemUpdates: false
    }
  },
  push: {
    enabled: true,
    types: {
      automationAlerts: true,
      performanceIssues: true,
      businessInsights: false
    }
  },
  inApp: {
    enabled: true,
    types: {
      automationAlerts: true,
      performanceIssues: true,
      businessInsights: true,
      systemUpdates: true
    }
  }
};

const mockThemeSettings: ThemeSettings = {
  mode: 'auto',
  primaryColor: '#3B82F6',
  accentColor: '#10B981',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  colorBlindness: 'none'
};

const mockDataPreferences: DataPreferences = {
  exportFormat: 'csv',
  includeMetadata: true,
  autoExport: false,
  exportSchedule: 'never',
  dataRetention: 365,
  backupEnabled: true,
  backupFrequency: 'weekly'
};

const mockIntegrationSettings: IntegrationSettings = {
  googleAnalytics: {
    enabled: true,
    refreshInterval: 5,
    dataRetention: 90
  },
  n8n: {
    enabled: true,
    webhookUrl: 'https://webhook.example.com/n8n',
    apiKey: 'n8n-api-key-123',
    refreshInterval: 1,
    dataRetention: 30
  },
  customIntegrations: []
};

const mockPrivacySettings: PrivacySettings = {
  dataSharing: {
    analytics: true,
    performance: false,
    anonymous: true
  },
  cookiePreferences: {
    necessary: true,
    analytics: true,
    marketing: false
  },
  dataExport: {
    allowDownload: true,
    allowDeletion: true,
    retentionPeriod: 30
  }
};

const mockOnboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard',
    description: 'Get started with your business insights dashboard',
    completed: true,
    required: true,
    order: 1
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Set up your business information and preferences',
    completed: true,
    required: true,
    order: 2
  },
  {
    id: 'integrations',
    title: 'Connect Your Tools',
    description: 'Connect Google Analytics and automation tools',
    completed: false,
    required: false,
    order: 3
  },
  {
    id: 'customization',
    title: 'Customize Your Dashboard',
    description: 'Arrange widgets and set your preferred view',
    completed: false,
    required: false,
    order: 4
  }
];

const mockHelpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    content: 'Learn how to navigate and use your dashboard effectively.',
    category: 'Basics',
    tags: ['beginner', 'navigation', 'overview'],
    lastUpdated: '2024-01-30T00:00:00Z'
  },
  {
    id: 'google-analytics',
    title: 'Google Analytics Integration',
    content: 'How to connect and configure Google Analytics for your dashboard.',
    category: 'Integrations',
    tags: ['google-analytics', 'setup', 'configuration'],
    lastUpdated: '2024-01-30T00:00:00Z'
  },
  {
    id: 'automation-dashboard',
    title: 'Automation Performance Dashboard',
    content: 'Understanding your automation metrics and ROI calculations.',
    category: 'Features',
    tags: ['automation', 'performance', 'roi'],
    lastUpdated: '2024-01-30T00:00:00Z'
  }
];

export class UserSettingsService {
  private static instance: UserSettingsService;
  private settings: UserSettings;
  private onboarding: OnboardingProgress;
  private helpArticles: HelpArticle[];

  private constructor() {
    this.settings = {
      profile: mockUserProfile,
      dashboard: mockDashboardCustomization,
      notifications: mockNotificationPreferences,
      theme: mockThemeSettings,
      data: mockDataPreferences,
      integrations: mockIntegrationSettings,
      privacy: mockPrivacySettings
    };

    this.onboarding = {
      userId: mockUserProfile.id,
      steps: mockOnboardingSteps,
      currentStep: 'integrations',
      completed: false,
      startedAt: '2024-01-01T00:00:00Z'
    };

    this.helpArticles = mockHelpArticles;
    this.loadFromLocalStorage();
  }

  public static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  // Profile Management
  async getUserProfile(): Promise<UserProfile> {
    return this.settings.profile;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    this.settings.profile = { ...this.settings.profile, ...profile };
    this.settings.profile.updatedAt = new Date().toISOString();
    this.saveToLocalStorage();
    return this.settings.profile;
  }

  // Dashboard Customization
  async getDashboardCustomization(): Promise<DashboardCustomization> {
    return this.settings.dashboard;
  }

  async updateDashboardCustomization(customization: Partial<DashboardCustomization>): Promise<DashboardCustomization> {
    this.settings.dashboard = { ...this.settings.dashboard, ...customization };
    this.saveToLocalStorage();
    return this.settings.dashboard;
  }

  // Notification Preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    return this.settings.notifications;
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    this.settings.notifications = { ...this.settings.notifications, ...preferences };
    this.saveToLocalStorage();
    return this.settings.notifications;
  }

  // Theme Settings
  async getThemeSettings(): Promise<ThemeSettings> {
    return this.settings.theme;
  }

  async updateThemeSettings(theme: Partial<ThemeSettings>): Promise<ThemeSettings> {
    this.settings.theme = { ...this.settings.theme, ...theme };
    this.saveToLocalStorage();
    this.applyThemeSettings();
    return this.settings.theme;
  }

  // Data Preferences
  async getDataPreferences(): Promise<DataPreferences> {
    return this.settings.data;
  }

  async updateDataPreferences(preferences: Partial<DataPreferences>): Promise<DataPreferences> {
    this.settings.data = { ...this.settings.data, ...preferences };
    this.saveToLocalStorage();
    return this.settings.data;
  }

  // Integration Settings
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    return this.settings.integrations;
  }

  async updateIntegrationSettings(integrations: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
    this.settings.integrations = { ...this.settings.integrations, ...integrations };
    this.saveToLocalStorage();
    return this.settings.integrations;
  }

  // Privacy Settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    return this.settings.privacy;
  }

  async updatePrivacySettings(privacy: Partial<PrivacySettings>): Promise<PrivacySettings> {
    this.settings.privacy = { ...this.settings.privacy, ...privacy };
    this.saveToLocalStorage();
    return this.settings.privacy;
  }

  // Onboarding
  async getOnboardingProgress(): Promise<OnboardingProgress> {
    return this.onboarding;
  }

  async completeOnboardingStep(stepId: string): Promise<OnboardingProgress> {
    const step = this.onboarding.steps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
      this.onboarding.currentStep = this.getNextIncompleteStep();
      this.onboarding.completed = this.onboarding.steps.every(s => s.completed);
      if (this.onboarding.completed) {
        this.onboarding.completedAt = new Date().toISOString();
      }
      this.saveToLocalStorage();
    }
    return this.onboarding;
  }

  // Help System
  async getHelpArticles(category?: string): Promise<HelpArticle[]> {
    if (category) {
      return this.helpArticles.filter(article => article.category === category);
    }
    return this.helpArticles;
  }

  async searchHelpArticles(query: string): Promise<HelpArticle[]> {
    const lowerQuery = query.toLowerCase();
    return this.helpArticles.filter(article => 
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Data Export
  async exportUserData(): Promise<string> {
    const exportData = {
      settings: this.settings,
      onboarding: this.onboarding,
      exportDate: new Date().toISOString()
    };
    
    if (this.settings.data.exportFormat === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (this.settings.data.exportFormat === 'csv') {
      return this.convertToCSV(exportData);
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  // Validation
  validateSettings(settings: Partial<UserSettings>): SettingsValidationError[] {
    const errors: SettingsValidationError[] = [];

    if (settings.profile?.email && !this.isValidEmail(settings.profile.email)) {
      errors.push({
        field: 'profile.email',
        message: 'Invalid email format',
        type: 'invalid'
      });
    }

    if (settings.dashboard?.refreshInterval && (settings.dashboard.refreshInterval < 1 || settings.dashboard.refreshInterval > 60)) {
      errors.push({
        field: 'dashboard.refreshInterval',
        message: 'Refresh interval must be between 1 and 60 minutes',
        type: 'invalid'
      });
    }

    if (settings.data?.dataRetention && (settings.data.dataRetention < 1 || settings.data.dataRetention > 3650)) {
      errors.push({
        field: 'data.dataRetention',
        message: 'Data retention must be between 1 and 3650 days',
        type: 'invalid'
      });
    }

    return errors;
  }

  // Private methods
  private getNextIncompleteStep(): string {
    const nextStep = this.onboarding.steps.find(step => !step.completed);
    return nextStep ? nextStep.id : this.onboarding.steps[0].id;
  }

  private applyThemeSettings(): void {
    const { theme } = this.settings;
    
    // Apply theme mode
    if (theme.mode === 'dark' || (theme.mode === 'auto' && this.isDarkModePreferred())) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply custom colors
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);

    // Apply font size
    document.documentElement.style.setProperty('--font-size', this.getFontSizeValue(theme.fontSize));

    // Apply accessibility features
    if (theme.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (theme.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  private isDarkModePreferred(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private getFontSizeValue(size: string): string {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    return sizes[size] || '16px';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for basic data structures
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
      const flattened: Record<string, string> = {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(flattened, flattenObject(obj[key], newKey));
          } else {
            flattened[newKey] = String(obj[key]);
          }
        }
      }
      
      return flattened;
    };

    const flattened = flattenObject(data);
    const headers = Object.keys(flattened);
    const csvContent = [
      headers.join(','),
      Object.values(flattened).join(',')
    ].join('\n');

    return csvContent;
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('userSettings', JSON.stringify(this.settings));
      localStorage.setItem('userOnboarding', JSON.stringify(this.onboarding));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      const savedOnboarding = localStorage.getItem('userOnboarding');
      
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
      
      if (savedOnboarding) {
        this.onboarding = { ...this.onboarding, ...JSON.parse(savedOnboarding) };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }
}

export default UserSettingsService;
