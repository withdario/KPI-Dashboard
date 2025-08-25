import React from 'react';

// Responsive design utilities and constants
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const TOUCH_TARGET_SIZE = 44; // Minimum touch target size in pixels (iOS/Android guidelines)

// Responsive spacing utilities
export const RESPONSIVE_SPACING = {
  xs: 'p-2 sm:p-3 md:p-4 lg:p-6',
  sm: 'p-3 sm:p-4 md:p-6 lg:p-8',
  md: 'p-4 sm:p-6 md:p-8 lg:p-10',
  lg: 'p-6 sm:p-8 md:p-10 lg:p-12',
  xl: 'p-8 sm:p-10 md:p-12 lg:p-16',
} as const;

// Responsive grid utilities
export const RESPONSIVE_GRID = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  '6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  '12': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
} as const;

// Touch-friendly button classes
export const TOUCH_BUTTON = {
  base: 'min-h-[44px] min-w-[44px] flex items-center justify-center',
  primary: 'min-h-[44px] px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  secondary: 'min-h-[44px] px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  icon: 'min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
} as const;

// Mobile-first responsive classes
export const MOBILE_FIRST = {
  hidden: 'block sm:hidden',
  visible: 'hidden sm:block',
  stack: 'flex flex-col sm:flex-row',
  center: 'text-center sm:text-left',
  fullWidth: 'w-full sm:w-auto',
} as const;

// Chart responsive classes
export const CHART_RESPONSIVE = {
  container: 'w-full h-64 sm:h-80 md:h-96 lg:h-[500px]',
  mobile: 'h-48 sm:h-64 md:h-80 lg:h-96',
  tablet: 'h-64 sm:h-80 md:h-96 lg:h-[500px]',
  desktop: 'h-80 sm:h-96 md:h-[500px] lg:h-[600px]',
} as const;

// Navigation responsive classes
export const NAV_RESPONSIVE = {
  mobile: 'fixed inset-0 z-50 bg-white sm:hidden',
  desktop: 'hidden sm:flex',
  overlay: 'fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden',
} as const;

// Utility function to check if device supports touch
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Utility function to get current breakpoint
export const getCurrentBreakpoint = (): keyof typeof BREAKPOINTS => {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Hook for responsive behavior
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('xs');
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const current = getCurrentBreakpoint();
      setBreakpoint(current);
      setIsMobile(current === 'xs' || current === 'sm');
      setIsTablet(current === 'md');
      setIsDesktop(current === 'lg' || current === 'xl' || current === '2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return { breakpoint, isMobile, isTablet, isDesktop };
};
