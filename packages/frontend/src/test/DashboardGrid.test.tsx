import { render, screen } from '@testing-library/react';
import DashboardGrid from '@/components/DashboardGrid';

describe('DashboardGrid', () => {
  it('renders with default props', () => {
    render(
      <DashboardGrid data-testid="grid-container">
        <div>Test content</div>
      </DashboardGrid>
    );
    
    const grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-6');
    expect(grid).toHaveClass('p-4');
  });

  it('renders with custom columns', () => {
    render(
      <DashboardGrid cols={4} data-testid="grid-container">
        <div>Test content</div>
      </DashboardGrid>
    );
    
    const grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('renders with custom gap', () => {
    render(
      <DashboardGrid gap="xl" data-testid="grid-container">
        <div>Test content</div>
      </DashboardGrid>
    );
    
    const grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('gap-8');
  });

  it('renders with custom padding', () => {
    render(
      <DashboardGrid padding="lg" data-testid="grid-container">
        <div>Test content</div>
      </DashboardGrid>
    );
    
    const grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('p-6');
  });

  it('renders with custom className', () => {
    render(
      <DashboardGrid className="custom-class" data-testid="grid-container">
        <div>Test content</div>
      </DashboardGrid>
    );
    
    const grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('custom-class');
  });

  it('renders grid items correctly', () => {
    render(
      <DashboardGrid>
        <DashboardGrid.Item>Item 1</DashboardGrid.Item>
        <DashboardGrid.Item>Item 2</DashboardGrid.Item>
      </DashboardGrid>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders grid items with custom colSpan', () => {
    render(
      <DashboardGrid>
        <DashboardGrid.Item colSpan={2}>Wide Item</DashboardGrid.Item>
      </DashboardGrid>
    );
    
    const item = screen.getByText('Wide Item').closest('div');
    expect(item).toHaveClass('col-span-1');
    expect(item).toHaveClass('sm:col-span-2');
  });

  it('renders grid items with custom rowSpan', () => {
    render(
      <DashboardGrid>
        <DashboardGrid.Item rowSpan={2}>Tall Item</DashboardGrid.Item>
      </DashboardGrid>
    );
    
    const item = screen.getByText('Tall Item').closest('div');
    expect(item).toHaveClass('row-span-2');
  });

  it('renders grid items with custom className', () => {
    render(
      <DashboardGrid>
        <DashboardGrid.Item className="custom-item-class">Custom Item</DashboardGrid.Item>
      </DashboardGrid>
    );
    
    const item = screen.getByText('Custom Item').closest('div');
    expect(item).toHaveClass('custom-item-class');
  });

  it('applies correct responsive classes for different column counts', () => {
    const { rerender } = render(
      <DashboardGrid cols={1} data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    let grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('grid-cols-1');
    
    rerender(
      <DashboardGrid cols={2} data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    
    rerender(
      <DashboardGrid cols={6} data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('xl:grid-cols-6');
  });

  it('applies correct gap classes', () => {
    const { rerender } = render(
      <DashboardGrid gap="sm" data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    let grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('gap-3');
    
    rerender(
      <DashboardGrid gap="md" data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('gap-4');
    
    rerender(
      <DashboardGrid gap="lg" data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('gap-6');
    
    rerender(
      <DashboardGrid gap="xl" data-testid="grid-container">
        <div>Test</div>
      </DashboardGrid>
    );
    
    grid = screen.getByTestId('grid-container');
    expect(grid).toHaveClass('gap-8');
  });
});
