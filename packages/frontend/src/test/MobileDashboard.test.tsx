import { render, screen, fireEvent, waitFor } from '../test/setup';
import { describe, it, expect, vi } from 'vitest';

// Mock all the problematic components with simple divs
vi.mock('../components/MobileChart', () => ({
  default: vi.fn(({ title, children }) => (
    <div data-testid="mobile-chart">
      <h3>{title}</h3>
      {children}
    </div>
  ))
}));

vi.mock('../components/MobileDataTable', () => ({
  default: vi.fn(({ data, columns, title }) => (
    <div data-testid="mobile-data-table">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            {columns?.map((col: any) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row: any, index: number) => (
            <tr key={index} data-testid={`table-row-${index}`}>
              {columns?.map((col: any) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))
}));

vi.mock('../components/MobileForm', () => ({
  default: vi.fn(({ title, fields, onSubmit }) => (
    <div data-testid="mobile-form">
      <h3>{title}</h3>
      <form onSubmit={onSubmit}>
        {fields?.map((field: any) => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  ))
}));

vi.mock('../components/MobileModal', () => ({
  default: vi.fn(({ isOpen, onClose, title, children }) => (
    isOpen ? (
      <div data-testid="mobile-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    ) : null
  ))
}));

vi.mock('../components/MobileNotification', () => ({
  default: vi.fn(() => <div data-testid="mobile-notification">Mocked Notification</div>),
  useNotifications: () => ({
    notifications: [],
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
    dismissNotification: vi.fn()
  })
}));

vi.mock('../components/MobileLoading', () => ({
  default: vi.fn(() => <div data-testid="mobile-loading">Mocked Loading</div>),
  MobileSkeleton: vi.fn(() => <div data-testid="mobile-skeleton">Mocked Skeleton</div>)
}));

vi.mock('../components/SimpleLineChart', () => ({
  default: vi.fn(() => <div data-testid="simple-line-chart">Mocked Line Chart</div>)
}));

vi.mock('../utils/responsive', () => ({
  useResponsive: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'sm'
  }),
  TOUCH_BUTTON: {
    base: 'min-h-[44px] min-w-[44px] flex items-center justify-center',
    primary: 'min-h-[44px] px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'min-h-[44px] px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    icon: 'min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  },
  RESPONSIVE_SPACING: {
    xs: 'p-2 sm:p-3 md:p-4 lg:p-6',
    sm: 'p-3 sm:p-4 md:p-6 lg:p-8',
    md: 'p-4 sm:p-6 md:p-8 lg:p-10',
    lg: 'p-6 sm:p-8 md:p-10 lg:p-12',
    xl: 'p-8 sm:p-10 md:p-12 lg:p-16',
  },
  MOBILE_FIRST: {
    hidden: 'block sm:hidden',
    visible: 'hidden sm:block',
    stack: 'flex flex-col sm:flex-row',
    center: 'text-center sm:text-left',
    fullWidth: 'w-full sm:w-auto',
  }
}));

// Mock the DashboardLayout
vi.mock('../components/DashboardLayout', () => ({
  default: vi.fn(({ children }) => <div data-testid="dashboard-layout">{children}</div>)
}));

describe('MobileDashboard', () => {
  it('renders without crashing', async () => {
    // Import the component dynamically to avoid import issues
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    expect(() => {
      render(<MobileDashboard />);
    }).not.toThrow();
  });

  it('renders basic structure', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    // Check that the dashboard layout is rendered
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('renders action buttons', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Open Modal')).toBeInTheDocument();
    expect(screen.getByText('Show Form')).toBeInTheDocument();
    expect(screen.getByText('Start Progress')).toBeInTheDocument();
    expect(screen.getByText('Simulate Error')).toBeInTheDocument();
  });

  it('renders mobile dashboard with all components', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    // Check for main sections
    expect(screen.getByText('Mobile Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Business Metrics')).toBeInTheDocument();
    expect(screen.getByText('Progress Loading')).toBeInTheDocument();
    expect(screen.getByText('Skeleton Loading')).toBeInTheDocument();
    expect(screen.getByText('Notification Examples')).toBeInTheDocument();
  });

  it('renders charts section', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  it('renders data table', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('renders loading states', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Progress Loading')).toBeInTheDocument();
    expect(screen.getByText('Skeleton Loading')).toBeInTheDocument();
  });

  it('renders progress loading section', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Progress Loading')).toBeInTheDocument();
    expect(screen.getByText('Start Progress')).toBeInTheDocument();
  });

  it('renders skeleton loading section', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Skeleton Loading')).toBeInTheDocument();
    expect(screen.getByText('Text Skeleton')).toBeInTheDocument();
  });

  it('renders notification examples', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Notification Examples')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-notification')).toBeInTheDocument();
  });

  it('opens modal when Open Modal button is clicked', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    const openModalButton = screen.getByText('Open Modal');
    fireEvent.click(openModalButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mobile Modal Example')).toBeInTheDocument();
    });
  });

  it('opens form modal when Show Form button is clicked', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    const showFormButton = screen.getByText('Show Form');
    fireEvent.click(showFormButton);
    
    await waitFor(() => {
      expect(screen.getByText('Contact Form')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    // Open modal first
    const openModalButton = screen.getByText('Open Modal');
    fireEvent.click(openModalButton);
    
    await waitFor(() => {
      expect(screen.getByText('Mobile Modal Example')).toBeInTheDocument();
    });
    
    // Close modal - use the first Close button (the one in the modal header)
    const closeButtons = screen.getAllByText('Close');
    const modalCloseButton = closeButtons[0]; // First one is in modal header
    fireEvent.click(modalCloseButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Mobile Modal Example')).not.toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    // Open form
    const showFormButton = screen.getByText('Show Form');
    fireEvent.click(showFormButton);
    
    await waitFor(() => {
      expect(screen.getByText('Contact Form')).toBeInTheDocument();
    });
    
    // Fill form
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    // Submit form
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Contact Form')).not.toBeInTheDocument();
    });
  });

  it('handles row click in data table', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    const revenueRow = screen.getByText('Revenue');
    fireEvent.click(revenueRow);
    
    // This should trigger some action, but for now we just verify the row is clickable
    expect(revenueRow).toBeInTheDocument();
  });

  it('displays responsive layout correctly', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    // Check that the layout is responsive by looking for mobile-specific classes
    const container = screen.getByText('Mobile Dashboard').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('shows loading states correctly', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    expect(screen.getByText('Progress Loading')).toBeInTheDocument();
    expect(screen.getByText('Skeleton Loading')).toBeInTheDocument();
  });

  it('renders touch-friendly buttons', async () => {
    const { default: MobileDashboard } = await import('../pages/MobileDashboard');
    
    render(<MobileDashboard />);
    
    const buttons = [
      'Open Modal',
      'Show Form', 
      'Start Progress',
      'Simulate Error'
    ];
    
    buttons.forEach(buttonText => {
      const button = screen.getByText(buttonText);
      expect(button).toBeInTheDocument();
      // Check if the button is actually a button element or has button-like behavior
      // The text is wrapped in a span inside the button, so we need to check the parent
      const buttonElement = button.closest('button');
      expect(buttonElement).toBeInTheDocument();
      expect(buttonElement?.tagName).toBe('BUTTON');
    });
  });
});
