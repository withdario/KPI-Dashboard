import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test component to render inside ProtectedRoute
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
  });

  it('should redirect to login when not authenticated', async () => {
    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Wait for the redirect to happen
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render protected content when token exists', async () => {
    // Mock localStorage to simulate authenticated user BEFORE rendering
    const mockGetItem = vi.fn().mockReturnValue('test-token');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
    
    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Wait for the token validation to complete (the useEffect runs asynchronously)
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
