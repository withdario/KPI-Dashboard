import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, useParams, useNavigate } from 'react-router-dom';
import GoogleAnalyticsPage from '../pages/GoogleAnalyticsPage';

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

const mockUseParams = vi.mocked(useParams);
const mockUseNavigate = vi.mocked(useNavigate);

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: ({ className }: { className: string }) => <div data-testid="arrow-left" className={className} />,
  AlertCircle: ({ className }: { className: string }) => <div data-testid="alert-icon" className={className} />,
}));

// Mock the GoogleAnalyticsMetrics component
vi.mock('../components/GoogleAnalyticsMetrics', () => ({
  default: ({ propertyId }: { propertyId: string }) => (
    <div data-testid="google-analytics-metrics">
      <h2>Google Analytics Metrics Component</h2>
      <p>Property ID: {propertyId}</p>
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GoogleAnalyticsPage', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  it('renders the Google Analytics dashboard with valid property ID', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    expect(screen.getByText('Google Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getAllByText('Property ID: 123456789')).toHaveLength(2); // One in header, one in mock component
    expect(screen.getByTestId('google-analytics-metrics')).toBeInTheDocument();
  });

  it('renders error state when property ID is missing', () => {
    mockUseParams.mockReturnValue({ propertyId: undefined });

    renderWithRouter(<GoogleAnalyticsPage />);

    expect(screen.getByText('Invalid Property ID')).toBeInTheDocument();
    expect(screen.getByText('The Google Analytics property ID must be a valid numeric identifier.')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });

  it('renders error state when property ID is empty string', () => {
    mockUseParams.mockReturnValue({ propertyId: '' });

    renderWithRouter(<GoogleAnalyticsPage />);

    expect(screen.getByText('Invalid Property ID')).toBeInTheDocument();
    expect(screen.getByText('The Google Analytics property ID must be a valid numeric identifier.')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });

  it('renders error state when property ID is null', () => {
    mockUseParams.mockReturnValue({ propertyId: null });

    renderWithRouter(<GoogleAnalyticsPage />);

    expect(screen.getByText('Invalid Property ID')).toBeInTheDocument();
    expect(screen.getByText('The Google Analytics property ID must be a valid numeric identifier.')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });

  it('navigates to dashboard when back button is clicked in error state', () => {
    mockUseParams.mockReturnValue({ propertyId: undefined });

    renderWithRouter(<GoogleAnalyticsPage />);

    const backButton = screen.getByText('Return to Dashboard');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to dashboard when back button is clicked in header', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    const backButton = screen.getByTitle('Back to Dashboard');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays back button with correct styling and icon', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    const backButton = screen.getByTitle('Back to Dashboard');
    expect(backButton).toHaveClass('p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500');
    
    const arrowIcon = screen.getByTestId('arrow-left');
    expect(arrowIcon).toBeInTheDocument();
  });

  it('renders header with correct layout and styling', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    const header = screen.getByText('Google Analytics Dashboard').closest('div')?.parentElement?.parentElement?.parentElement;
    expect(header).toHaveClass('bg-white shadow-sm border-b border-gray-200');
    
    const container = header?.querySelector('.max-w-7xl');
    expect(container).toHaveClass('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8');
  });

  it('renders main content with correct layout and styling', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    const mainContent = screen.getByTestId('google-analytics-metrics').closest('div')?.parentElement;
    expect(mainContent).toHaveClass('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8');
  });

  it('handles property ID with special characters', () => {
    mockUseParams.mockReturnValue({ propertyId: 'property-123_abc-456' });

    renderWithRouter(<GoogleAnalyticsPage />);

    expect(screen.getByText('Invalid Property ID')).toBeInTheDocument();
    expect(screen.getByText('The Google Analytics property ID must be a valid numeric identifier.')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });

  it('handles property ID with numbers only', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    expect(screen.getByText('Google Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getAllByText('Property ID: 123456789')).toHaveLength(2); // One in header, one in mock component
    expect(screen.getByTestId('google-analytics-metrics')).toBeInTheDocument();
  });

  it('passes property ID correctly to GoogleAnalyticsMetrics component', () => {
    mockUseParams.mockReturnValue({ propertyId: '123456789' });

    renderWithRouter(<GoogleAnalyticsPage />);

    const metricsComponent = screen.getByTestId('google-analytics-metrics');
    expect(metricsComponent).toHaveTextContent('Property ID: 123456789');
  });

  it('renders error state with correct styling', () => {
    mockUseParams.mockReturnValue({ propertyId: undefined });

    renderWithRouter(<GoogleAnalyticsPage />);

    const errorContainer = screen.getByText('Invalid Property ID').closest('div')?.parentElement?.parentElement;
    expect(errorContainer).toHaveClass('min-h-screen bg-gray-50 flex items-center justify-center');
    
    const errorCard = screen.getByText('The Google Analytics property ID must be a valid numeric identifier.').closest('div');
    expect(errorCard).toHaveClass('bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md');
  });

  it('renders error state with correct icon', () => {
    mockUseParams.mockReturnValue({ propertyId: undefined });

    renderWithRouter(<GoogleAnalyticsPage />);

    const alertIcon = screen.getByTestId('alert-icon');
    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveClass('w-6 h-6');
  });

  it('renders error state with correct button styling', () => {
    mockUseParams.mockReturnValue({ propertyId: undefined });

    renderWithRouter(<GoogleAnalyticsPage />);

    const backButton = screen.getByText('Return to Dashboard');
    expect(backButton).toHaveClass('w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500');
  });
});
