import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MetricsCard from '../components/MetricsCard';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  TrendingUp: ({ className }: { className: string }) => <div data-testid="trending-up" className={className} />,
  TrendingDown: ({ className }: { className: string }) => <div data-testid="trending-down" className={className} />,
  Minus: ({ className }: { className: string }) => <div data-testid="minus" className={className} />,
  ArrowUpRight: ({ className }: { className: string }) => <div data-testid="arrow-up-right" className={className} />,
  ArrowDownRight: ({ className }: { className: string }) => <div data-testid="arrow-down-right" className={className} />,
}));

describe('MetricsCard', () => {
  it('renders with basic props', () => {
    render(<MetricsCard title="Test Metric" value={1000} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('1.0K')).toBeInTheDocument();
  });

  it('renders with change data', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={1000}
        change={100}
        changePercent={10}
        trend="up"
      />
    );
    
    expect(screen.getByText('+100')).toBeInTheDocument();
    expect(screen.getByText('+10.0%')).toBeInTheDocument();
  });

  it('renders with custom value formatter', () => {
    const formatValue = (value: number) => `$${value}`;
    
    render(
      <MetricsCard
        title="Revenue"
        value={1000}
        formatValue={formatValue}
      />
    );
    
    expect(screen.getByText('$1000')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={0}
        isLoading={true}
      />
    );
    
    // Should show skeleton loading elements instead of text
    expect(screen.queryByText('Test Metric')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    
    // Should have loading animation class
    const loadingElement = screen.getByTestId('loading-skeleton');
    expect(loadingElement).toHaveClass('animate-pulse');
  });

  it('renders with down trend', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={1000}
        change={-100}
        changePercent={-10}
        trend="down"
      />
    );
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('-10.0%')).toBeInTheDocument();
  });

  it('renders with stable trend', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={1000}
        change={0}
        changePercent={0}
        trend="stable"
      />
    );
    
    expect(screen.getByText('1.0K')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(<MetricsCard title="Large Number" value={1500000} />);
    
    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });

  it('formats small numbers correctly', () => {
    render(<MetricsCard title="Small Number" value={500} />);
    
    expect(screen.getByText('500')).toBeInTheDocument();
  });
});
