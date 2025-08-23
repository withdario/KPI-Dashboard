import { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

interface DashboardGridItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  rowSpan?: 1 | 2 | 3 | 4;
}

const DashboardGrid = ({ 
  children, 
  className = '', 
  cols = 12, 
  gap = 'lg', 
  padding = 'md',
  'data-testid': dataTestId
}: DashboardGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  };

  const gridGap = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridPadding = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const classes = [
    'grid',
    gridCols[cols],
    gridGap[gap],
    gridPadding[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} data-testid={dataTestId}>
      {children}
    </div>
  );
};

const DashboardGridItem = ({ 
  children, 
  className = '', 
  colSpan = 1, 
  rowSpan = 1 
}: DashboardGridItemProps) => {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
    4: 'col-span-1 sm:grid-cols-2 lg:col-span-4',
    6: 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-6',
    12: 'col-span-full'
  };

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4'
  };

  const classes = [
    colSpanClasses[colSpan],
    rowSpanClasses[rowSpan],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

DashboardGrid.Item = DashboardGridItem;

export default DashboardGrid;
