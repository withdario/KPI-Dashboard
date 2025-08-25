import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateRangePicker from '../components/DateRangePicker';

describe('DateRangePicker', () => {
  const mockOnChange = vi.fn();
  const defaultDateRange = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default date range', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Date Range:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument();
  });

  it('renders quick selection buttons', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
    expect(screen.getByText('90D')).toBeInTheDocument();
  });

  it('applies predefined date range when quick buttons clicked', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    const sevenDayButton = screen.getByText('7D');
    fireEvent.click(sevenDayButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });

  it('allows custom date range selection', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    const startDateInput = screen.getByDisplayValue('2024-01-01');
    const endDateInput = screen.getByDisplayValue('2024-01-31');
    
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });
    
    // The component calls onDateRangeChange for each individual change
    // First call: start date changed to 2024-02-01, end date still 2024-01-31
    expect(mockOnChange).toHaveBeenCalledWith('2024-02-01', '2024-01-31');
    // Second call: start date is still the original prop value 2024-01-01, end date changed to 2024-02-28
    expect(mockOnChange).toHaveBeenCalledWith('2024-01-01', '2024-02-28');
  });

  it('handles start date change', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    const startDateInput = screen.getByDisplayValue('2024-01-01');
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('2024-02-01', '2024-01-31');
  });

  it('handles end date change', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    const endDateInput = screen.getByDisplayValue('2024-01-31');
    fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('2024-01-01', '2024-02-28');
  });

  it('applies 30-day quick range', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    const thirtyDayButton = screen.getByText('30D');
    fireEvent.click(thirtyDayButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });

  it('applies 90-day quick range', () => {
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
      />
    );
    
    const ninetyDayButton = screen.getByText('90D');
    fireEvent.click(ninetyDayButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });

  it('renders with custom className', () => {
    const customClass = 'custom-class';
    render(
      <DateRangePicker
        startDate={defaultDateRange.startDate}
        endDate={defaultDateRange.endDate}
        onDateRangeChange={mockOnChange}
        className={customClass}
      />
    );
    
    // Find the outermost container div that has the className
    const container = screen.getByText('Date Range:').closest('div')?.parentElement;
    expect(container).toHaveClass(customClass);
  });
});
