import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch globally
global.fetch = vi.fn();

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
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

  it('should provide initial state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should load token from localStorage on mount', async () => {
    const mockToken = 'test-token';
    
    // Mock localStorage.getItem to return our token
    const mockGetItem = vi.fn().mockReturnValue(mockToken);
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
        <TestComponent />
      </TestWrapper>
    );

    // Should start loading when token exists
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'USER' as const,
      isActive: true,
      createdAt: '2025-01-22T00:00:00Z',
      updatedAt: '2025-01-22T00:00:00Z',
    };
    const mockToken = 'test-token';

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    });

    // Mock localStorage methods
    const mockSetItem = vi.fn();
    const mockGetItem = vi.fn().mockReturnValue(null);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Click login button to trigger login
    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      loginBtn.click();
    });

    // Wait for the mock to resolve
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(mockSetItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Invalid credentials';
    
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Click login button to trigger login
    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      loginBtn.click();
    });

    // Wait for the mock to resolve
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('should handle logout', async () => {
    // Mock localStorage methods
    const mockRemoveItem = vi.fn();
    const mockGetItem = vi.fn().mockReturnValue('test-token');
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: vi.fn(),
        removeItem: mockRemoveItem,
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
    
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Click logout button
    const logoutBtn = screen.getByTestId('logout-btn');
    await act(async () => {
      logoutBtn.click();
    });

    // Verify token is removed on logout
    expect(mockRemoveItem).toHaveBeenCalledWith('token');
  });
});
