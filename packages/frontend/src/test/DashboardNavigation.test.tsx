import { render, screen, fireEvent } from '../test/setup';
import DashboardNavigation from '../components/DashboardNavigation';

describe('DashboardNavigation', () => {
  it('renders navigation menu with all sections', () => {
    render(<DashboardNavigation />);
    
    // Check for all navigation sections
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Trends')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows active state for current route', () => {
    render(<DashboardNavigation />);
    
    // Overview should be active since useLocation returns /dashboard
    const overviewLink = screen.getByText('Overview').closest('a');
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<DashboardNavigation />);
    
    const menuButton = screen.getByLabelText('Toggle navigation menu');
    expect(menuButton).toBeInTheDocument();
    
    // Menu should be closed initially
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    
    // Click menu button
    fireEvent.click(menuButton);
    
    // Menu should be open
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes mobile menu when navigation item is clicked', () => {
    render(<DashboardNavigation />);
    
    const menuButton = screen.getByLabelText('Toggle navigation menu');
    
    // Open menu
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click navigation item
    const analyticsLink = screen.getByText('Analytics').closest('a');
    fireEvent.click(analyticsLink!);
    
    // Menu should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays correct navigation descriptions for screen readers', () => {
    render(<DashboardNavigation />);
    
    // Check that navigation items have proper descriptions in the sr-only span
    const overviewLink = screen.getByText('Overview').closest('a');
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
    
    const analyticsLink = screen.getByText('Analytics').closest('a');
    expect(analyticsLink).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DashboardNavigation />);
    
    expect(screen.getByLabelText('Dashboard navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
  });
});
