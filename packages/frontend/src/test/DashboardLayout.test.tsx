import { render, screen } from '../test/setup';
import { vi } from 'vitest';
import DashboardLayout from '../components/DashboardLayout';

// Mock DashboardNavigation component
vi.mock('../components/DashboardNavigation', () => ({
  default: ({ children }: any) => <div data-testid="dashboard-navigation">{children}</div>
}));

describe('DashboardLayout', () => {
  it('renders with title and subtitle', () => {
    render(
      <DashboardLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test content</div>
      </DashboardLayout>
    );

    // Check that both desktop and mobile titles are present
    const titles = screen.getAllByText('Test Title');
    expect(titles).toHaveLength(2); // Desktop and mobile headers
    const subtitles = screen.getAllByText('Test Subtitle');
    expect(subtitles).toHaveLength(2); // Desktop and mobile headers
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders without title and subtitle', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Should still show the "BI Platform" heading in mobile header
    expect(screen.getByText('BI Platform')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders navigation component', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Should have navigation components (desktop and mobile)
    const navigationElements = screen.getAllByTestId('dashboard-navigation');
    expect(navigationElements.length).toBeGreaterThan(0);
  });

  it('renders mobile header for small screens', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Mobile header should always be visible
    expect(screen.getByText('BI Platform')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Check for proper HTML structure
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main content
  });

  it('renders page header with proper styling', () => {
    render(
      <DashboardLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test content</div>
      </DashboardLayout>
    );

    // Check that the page header section exists (both desktop and mobile)
    const titles = screen.getAllByText('Test Title');
    expect(titles).toHaveLength(2);
    const subtitles = screen.getAllByText('Test Subtitle');
    expect(subtitles).toHaveLength(2);
  });
});
