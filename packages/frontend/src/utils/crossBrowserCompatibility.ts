/**
 * Cross-Browser Compatibility Utilities
 * Ensures consistent behavior across different browsers
 */

// CSS Custom Properties fallback for older browsers
export const applyCSSFallbacks = (): void => {
  // Check if CSS custom properties are supported
  if (!CSS.supports('color', 'var(--test)')) {
    // Fallback for browsers that don't support CSS custom properties
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --primary-color: #3B82F6;
        --accent-color: #10B981;
        --font-size: 16px;
      }
      
      .bg-primary { background-color: #3B82F6 !important; }
      .text-primary { color: #3B82F6 !important; }
      .border-primary { border-color: #3B82F6 !important; }
      
      .bg-accent { background-color: #10B981 !important; }
      .text-accent { color: #10B981 !important; }
      .border-accent { border-color: #10B981 !important; }
    `;
    document.head.appendChild(style);
  }
};

// Flexbox fallback for older browsers
export const applyFlexboxFallbacks = (): void => {
  // Check if flexbox is supported
  if (!CSS.supports('display', 'flex')) {
    const style = document.createElement('style');
    style.textContent = `
      .flex { display: block !important; }
      .flex-col { display: block !important; }
      .flex-row { display: block !important; }
      .items-center { text-align: center !important; }
      .justify-center { text-align: center !important; }
      .justify-between { text-align: justify !important; }
      .space-x-2 > * + * { margin-left: 0.5rem !important; }
      .space-x-4 > * + * { margin-left: 1rem !important; }
      .space-x-8 > * + * { margin-left: 2rem !important; }
    `;
    document.head.appendChild(style);
  }
};

// Grid fallback for older browsers
export const applyGridFallbacks = (): void => {
  // Check if CSS Grid is supported
  if (!CSS.supports('display', 'grid')) {
    const style = document.createElement('style');
    style.textContent = `
      .grid { display: block !important; }
      .grid-cols-1 { display: block !important; }
      .grid-cols-2 { display: block !important; }
      .grid-cols-3 { display: block !important; }
      .grid-cols-4 { display: block !important; }
      .gap-2 > * + * { margin-top: 0.5rem !important; }
      .gap-4 > * + * { margin-top: 1rem !important; }
      .gap-6 > * + * { margin-top: 1.5rem !important; }
      .gap-8 > * + * { margin-top: 2rem !important; }
    `;
    document.head.appendChild(style);
  }
};

// Touch event fallback for older browsers
export const applyTouchEventFallbacks = (): void => {
  // Check if touch events are supported
  if (!('ontouchstart' in window)) {
    // Add touch event polyfills for non-touch devices
    const addTouchSupport = (element: HTMLElement) => {
      let startY = 0;
      let startX = 0;
      
      element.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
      });
      
      element.addEventListener('mouseup', (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Simulate swipe gestures
        if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
          const swipeEvent = new CustomEvent('swipe', {
            detail: { deltaX, deltaY, direction: Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical' }
          });
          element.dispatchEvent(swipeEvent);
        }
      });
    };
    
    // Apply to all elements with touch classes
    document.querySelectorAll('.touch-button, .mobile-chart, .mobile-form').forEach(addTouchSupport);
  }
};

// Intersection Observer fallback for older browsers
export const applyIntersectionObserverFallback = (): void => {
  if (!('IntersectionObserver' in window)) {
    // Simple fallback that triggers immediately
    window.IntersectionObserver = class IntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        // Trigger callback immediately for all elements
        setTimeout(() => {
          callback([], this);
        }, 0);
      }
      
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
};

// Initialize all cross-browser compatibility features
export const initializeCrossBrowserCompatibility = (): void => {
  applyCSSFallbacks();
  applyFlexboxFallbacks();
  applyGridFallbacks();
  applyTouchEventFallbacks();
  applyIntersectionObserverFallback();
  
  console.log('Cross-browser compatibility features initialized');
};

// Browser detection utilities
export const getBrowserInfo = (): { name: string; version: string; isModern: boolean } => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  
  if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Safari')) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Edge')) {
    name = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    name = 'Internet Explorer';
    version = userAgent.match(/(?:MSIE|rv:)(\d+)/)?.[1] || 'Unknown';
  }
  
  const versionNum = parseInt(version);
  const isModern = name !== 'Internet Explorer' && (versionNum >= 12 || versionNum >= 60);
  
  return { name, version, isModern };
};

// Feature detection utilities
export const checkFeatureSupport = (): Record<string, boolean> => {
  return {
    cssCustomProperties: CSS.supports('color', 'var(--test)'),
    flexbox: CSS.supports('display', 'flex'),
    grid: CSS.supports('display', 'grid'),
    touchEvents: 'ontouchstart' in window,
    intersectionObserver: 'IntersectionObserver' in window,
    serviceWorker: 'serviceWorker' in navigator,
    webGL: !!window.WebGLRenderingContext,
    webAudio: !!window.AudioContext || !!window.webkitAudioContext,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage
  };
};

export default {
  initializeCrossBrowserCompatibility,
  getBrowserInfo,
  checkFeatureSupport,
  applyCSSFallbacks,
  applyFlexboxFallbacks,
  applyGridFallbacks,
  applyTouchEventFallbacks,
  applyIntersectionObserverFallback
};
