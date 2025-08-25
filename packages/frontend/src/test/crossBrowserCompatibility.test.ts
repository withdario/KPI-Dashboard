import {
  getBrowserInfo,
  checkFeatureSupport,
  applyCSSFallbacks,
  applyFlexboxFallbacks,
  applyGridFallbacks,
  applyTouchEventFallbacks,
  applyIntersectionObserverFallback
} from '../utils/crossBrowserCompatibility';

// Mock CSS.supports
const mockCSSSupports = jest.fn();
Object.defineProperty(window, 'CSS', {
  value: {
    supports: mockCSSSupports
  },
  writable: true
});

// Mock window properties
const mockIntersectionObserver = jest.fn();
const mockServiceWorker = {};
const mockWebGLRenderingContext = {};
const mockAudioContext = {};
const mockWebkitAudioContext = {};

Object.defineProperty(window, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  writable: true
});

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true
});

Object.defineProperty(window, 'WebGLRenderingContext', {
  value: mockWebGLRenderingContext,
  writable: true
});

Object.defineProperty(window, 'AudioContext', {
  value: mockAudioContext,
  writable: true
});

Object.defineProperty(window, 'webkitAudioContext', {
  value: mockWebkitAudioContext,
  writable: true
});

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

const mockSessionStorage = { ...mockLocalStorage };

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

// Mock touch events
Object.defineProperty(window, 'ontouchstart', {
  value: undefined,
  writable: true
});

// Mock document methods
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockQuerySelectorAll = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true
});

Object.defineProperty(document, 'appendChild', {
  value: mockAppendChild,
  writable: true
});

Object.defineProperty(document, 'querySelectorAll', {
  value: mockQuerySelectorAll,
  writable: true
});

// Mock console.log
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('Cross Browser Compatibility Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCSSSupports.mockReturnValue(true);
    mockCreateElement.mockReturnValue({
      textContent: '',
      style: {}
    });
    mockQuerySelectorAll.mockReturnValue([]);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('getBrowserInfo', () => {
    it('detects Chrome browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true
      });

      const info = getBrowserInfo();
      expect(info.name).toBe('Chrome');
      expect(info.version).toBe('91');
      expect(info.isModern).toBe(true);
    });

    it('detects Firefox browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true
      });

      const info = getBrowserInfo();
      expect(info.name).toBe('Firefox');
      expect(info.version).toBe('89');
      expect(info.isModern).toBe(true);
    });

    it('detects Safari browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true
      });

      const info = getBrowserInfo();
      expect(info.name).toBe('Safari');
      expect(info.version).toBe('14');
      expect(info.isModern).toBe(true);
    });

    it('detects Edge browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        writable: true
      });

      const info = getBrowserInfo();
      expect(info.name).toBe('Edge');
      expect(info.version).toBe('91');
      expect(info.isModern).toBe(true);
    });

    it('detects Internet Explorer', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
        writable: true
      });

      const info = getBrowserInfo();
      expect(info.name).toBe('Internet Explorer');
      expect(info.version).toBe('11');
      expect(info.isModern).toBe(false);
    });

    it('handles unknown browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Unknown Browser 1.0',
        writable: true
      });

      const info = getBrowserInfo();
      expect(info.name).toBe('Unknown');
      expect(info.version).toBe('Unknown');
      expect(info.isModern).toBe(false);
    });
  });

  describe('checkFeatureSupport', () => {
    it('checks CSS custom properties support', () => {
      mockCSSSupports.mockReturnValueOnce(true);
      const features = checkFeatureSupport();
      expect(features.cssCustomProperties).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledWith('color', 'var(--test)');
    });

    it('checks flexbox support', () => {
      mockCSSSupports.mockReturnValueOnce(true);
      const features = checkFeatureSupport();
      expect(features.flexbox).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledWith('display', 'flex');
    });

    it('checks grid support', () => {
      mockCSSSupports.mockReturnValueOnce(true);
      const features = checkFeatureSupport();
      expect(features.grid).toBe(true);
      expect(mockCSSSupports).toHaveBeenCalledWith('display', 'grid');
    });

    it('checks touch events support', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true
      });
      
      const features = checkFeatureSupport();
      expect(features.touchEvents).toBe(true);
    });

    it('checks intersection observer support', () => {
      const features = checkFeatureSupport();
      expect(features.intersectionObserver).toBe(true);
    });

    it('checks service worker support', () => {
      const features = checkFeatureSupport();
      expect(features.serviceWorker).toBe(true);
    });

    it('checks WebGL support', () => {
      const features = checkFeatureSupport();
      expect(features.webGL).toBe(true);
    });

    it('checks Web Audio support', () => {
      const features = checkFeatureSupport();
      expect(features.webAudio).toBe(true);
    });

    it('checks localStorage support', () => {
      const features = checkFeatureSupport();
      expect(features.localStorage).toBe(true);
    });

    it('checks sessionStorage support', () => {
      const features = checkFeatureSupport();
      expect(features.sessionStorage).toBe(true);
    });
  });

  describe('applyCSSFallbacks', () => {
    it('applies fallbacks when CSS custom properties not supported', () => {
      mockCSSSupports.mockReturnValueOnce(false);
      
      applyCSSFallbacks();
      
      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('does not apply fallbacks when CSS custom properties supported', () => {
      mockCSSSupports.mockReturnValueOnce(true);
      
      applyCSSFallbacks();
      
      expect(mockCreateElement).not.toHaveBeenCalled();
    });
  });

  describe('applyFlexboxFallbacks', () => {
    it('applies fallbacks when flexbox not supported', () => {
      mockCSSSupports.mockReturnValueOnce(false);
      
      applyFlexboxFallbacks();
      
      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('does not apply fallbacks when flexbox supported', () => {
      mockCSSSupports.mockReturnValueOnce(true);
      
      applyFlexboxFallbacks();
      
      expect(mockCreateElement).not.toHaveBeenCalled();
    });
  });

  describe('applyGridFallbacks', () => {
    it('applies fallbacks when grid not supported', () => {
      mockCSSSupports.mockReturnValueOnce(false);
      
      applyGridFallbacks();
      
      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('does not apply fallbacks when grid supported', () => {
      mockCSSSupports.mockReturnValueOnce(true);
      
      applyGridFallbacks();
      
      expect(mockCreateElement).not.toHaveBeenCalled();
    });
  });

  describe('applyTouchEventFallbacks', () => {
    it('applies touch event fallbacks when not supported', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: undefined,
        writable: true
      });
      
      applyTouchEventFallbacks();
      
      expect(mockQuerySelectorAll).toHaveBeenCalledWith('.touch-button, .mobile-chart, .mobile-form');
    });

    it('does not apply fallbacks when touch events supported', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true
      });
      
      applyTouchEventFallbacks();
      
      expect(mockQuerySelectorAll).not.toHaveBeenCalled();
    });
  });

  describe('applyIntersectionObserverFallback', () => {
    it('applies fallback when IntersectionObserver not supported', () => {
      Object.defineProperty(window, 'IntersectionObserver', {
        value: undefined,
        writable: true
      });
      
      applyIntersectionObserverFallback();
      
      expect(window.IntersectionObserver).toBeDefined();
    });

    it('does not apply fallback when IntersectionObserver supported', () => {
      const originalObserver = window.IntersectionObserver;
      
      applyIntersectionObserverFallback();
      
      expect(window.IntersectionObserver).toBe(originalObserver);
    });
  });
});
