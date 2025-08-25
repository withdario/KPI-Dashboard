import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
  Routes: ({ children }: any) => React.createElement('div', {}, children),
  Route: ({ children }: any) => React.createElement('div', {}, children),
  BrowserRouter: ({ children }: any) => React.createElement('div', {}, children),
  useParams: () => ({}),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: vi.fn(),
  Toaster: ({ children }: any) => React.createElement('div', {}, children),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  BarChart3: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  TrendingUp: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  TrendingDown: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Zap: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Users: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Settings: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Menu: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  X: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Home: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  ChevronRight: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Share2: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Building: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Sun: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Moon: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Heart: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  MessageCircle: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Eye: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  DollarSign: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Target: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Facebook: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Instagram: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Twitter: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Linkedin: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Calendar: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  CheckCircle: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  XCircle: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Clock: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  UserPlus: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Phone: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Mail: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  MapPin: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  AlertTriangle: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  AlertCircle: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Info: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Search: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Filter: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  RefreshCw: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Tag: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
  Download: ({ className, ...props }: any) => React.createElement('svg', { className, ...props }),
}));

// Create a custom render function that includes ThemeProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(ThemeProvider, { children }, children);
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo
global.scrollTo = vi.fn() as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};
