import { render, screen } from '../test/setup';
import DashboardWidget from '../components/DashboardWidget';

describe('DashboardWidget', () => {
  it('renders with title and subtitle', () => {
    render(
      <DashboardWidget
        title="Test Widget"
        subtitle="Test subtitle"
        data-testid="widget-container"
      >
        <div>Test content</div>
      </DashboardWidget>
    );

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders without title and subtitle', () => {
    render(
      <DashboardWidget data-testid="widget-container">
        <div>Test content</div>
      </DashboardWidget>
    );

    expect(screen.queryByText('Test Widget')).not.toBeInTheDocument();
    expect(screen.queryByText('Test subtitle')).not.toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardWidget data-testid="widget-container">
        <div>Test content</div>
      </DashboardWidget>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(
      <DashboardWidget
        loading={true}
        title="Test Widget"
        subtitle="Test subtitle"
        data-testid="widget-container"
      >
        <div>Test content</div>
      </DashboardWidget>
    );

    // Check for skeleton loading elements
    const widget = screen.getByTestId('widget-container');
    const skeletonElement = widget.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
  });

  it('shows error state when error is provided', () => {
    render(
      <DashboardWidget
        error="Test error message"
        data-testid="widget-container"
      >
        <div>Test content</div>
      </DashboardWidget>
    );

    expect(screen.getByText('Error Loading Widget')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(
      <DashboardWidget data-testid="widget-container">
        <div>Test content</div>
      </DashboardWidget>
    );

    const widget = screen.getByTestId('widget-container');
    expect(widget).toHaveClass('bg-white');
    expect(widget).toHaveClass('shadow-sm');
    expect(widget).toHaveClass('border');
    expect(widget).toHaveClass('border-gray-200');
  });

  it('applies custom className', () => {
    render(
      <DashboardWidget
        className="custom-class"
        data-testid="widget-container"
      >
        <div>Test content</div>
      </DashboardWidget>
    );

    const widget = screen.getByTestId('widget-container');
    expect(widget).toHaveClass('custom-class');
  });

  it('renders header section only when title, subtitle, or actions are present', () => {
    const { rerender } = render(
      <DashboardWidget data-testid="widget-container">
        <div>Test content</div>
      </DashboardWidget>
    );

    // No header when no title/subtitle
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();

    // Header when title is present
    rerender(
      <DashboardWidget
        title="Test Widget"
        data-testid="widget-container"
      >
        <div>Test content</div>
      </DashboardWidget>
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('renders error icon when error is present', () => {
    render(
      <DashboardWidget
        error="Test error message"
        data-testid="widget-container"
      >
        <div>Test content</div>
      </DashboardWidget>
    );

    // Check for error icon (SVG with warning icon)
    const errorIcon = screen.getByTestId('widget-container').querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
  });
});
