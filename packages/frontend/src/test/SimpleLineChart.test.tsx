import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SimpleLineChart from '../components/SimpleLineChart';
import { ChartDataPoint } from '../types/googleAnalytics';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  TrendingUp: ({ className }: { className: string }) => <div data-testid="trending-up" className={className} />,
  TrendingDown: ({ className }: { className: string }) => <div data-testid="trending-down" className={className} />,
  Minus: ({ className }: { className: string }) => <div data-testid="minus" className={className} />,
}));

const mockData: ChartDataPoint[] = [
  { date: '2024-01-01', value: 100 },
  { date: '2024-01-02', value: 150 },
  { date: '2024-01-03', value: 120 },
  { date: '2024-01-04', value: 200 },
  { date: '2024-01-05', value: 180 },
];

describe('SimpleLineChart', () => {
  it('renders with title and data', () => {
    render(
      <SimpleLineChart
        data={mockData}
        title="Test Chart"
        height={300}
        color="#FF0000"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('Jan 1')).toBeInTheDocument(); // SVG chart labels
  });

  it('renders empty state when no data', () => {
    render(
      <SimpleLineChart
        data={[]}
        title="Empty Chart"
      />
    );

    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    expect(screen.getByText('Insufficient data to display chart')).toBeInTheDocument();
  });

  it('renders single data point correctly', () => {
    const singleData = [{ date: '2024-01-01', value: 100 }];
    
    render(
      <SimpleLineChart
        data={singleData}
        title="Single Point"
      />
    );

    expect(screen.getByText('Single Point')).toBeInTheDocument();
    expect(screen.getByText('Insufficient data to display chart')).toBeInTheDocument();
  });

  it('applies custom height and color', () => {
    render(
      <SimpleLineChart
        data={mockData}
        title="Custom Chart"
        height={400}
        color="#00FF00"
      />
    );

    expect(screen.getByText('Custom Chart')).toBeInTheDocument();
    expect(screen.getByText('Jan 1')).toBeInTheDocument(); // SVG chart labels
  });

  it('handles different data ranges', () => {
    const wideRangeData: ChartDataPoint[] = [
      { date: '2024-01-01', value: 1 },
      { date: '2024-01-02', value: 1000 },
      { date: '2024-01-03', value: 500 },
    ];

    render(
      <SimpleLineChart
        data={wideRangeData}
        title="Wide Range Chart"
      />
    );

    expect(screen.getByText('Wide Range Chart')).toBeInTheDocument();
    expect(screen.getByText('Jan 1')).toBeInTheDocument(); // SVG chart labels
  });

  it('applies custom className', () => {
    render(
      <SimpleLineChart
        data={mockData}
        title="Styled Chart"
        className="custom-class"
      />
    );

    const container = screen.getByText('Styled Chart').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('renders with default props', () => {
    render(
      <SimpleLineChart
        data={mockData}
        title="Default Chart"
      />
    );

    expect(screen.getByText('Default Chart')).toBeInTheDocument();
    expect(screen.getByText('Jan 1')).toBeInTheDocument(); // SVG chart labels
  });
});
