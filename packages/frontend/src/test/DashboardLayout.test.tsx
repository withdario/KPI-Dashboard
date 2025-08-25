import { render, screen } from '../test/setup';
import { vi } from 'vitest';
import DashboardLayout from '../components/DashboardLayout';

describe('DashboardLayout', () => {
  it('renders with children content', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders dashboard title', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Check that the dashboard title is present
    expect(screen.getByText('Business Intelligence Dashboard')).toBeInTheDocument();
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

  it('renders navigation links', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Should have navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Business Overview')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Mobile menu button should be visible
    expect(screen.getByLabelText('Toggle dashboard menu')).toBeInTheDocument();
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

  it('renders responsive layout', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Check that the main content has responsive spacing
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-1');
  });
});
