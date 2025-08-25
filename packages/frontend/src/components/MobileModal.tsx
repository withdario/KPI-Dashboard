import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TOUCH_BUTTON, RESPONSIVE_SPACING } from '@/utils/responsive';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  showNavigation?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  showNavigation = false,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // If horizontal swipe is greater than vertical swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && hasPrevious && onPrevious) {
          onPrevious();
        } else if (deltaX < 0 && hasNext && onNext) {
          onNext();
        }
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-out ${className}`}
          onTouchStart={handleTouchStart}
        >
          {/* Header */}
          {(title || showCloseButton || showNavigation) && (
            <div className={`${RESPONSIVE_SPACING.md} border-b border-gray-200`}>
              <div className="flex items-center justify-between">
                {/* Navigation */}
                {showNavigation && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onPrevious}
                      disabled={!hasPrevious}
                      className={`${TOUCH_BUTTON.icon} ${!hasPrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onNext}
                      disabled={!hasNext}
                      className={`${TOUCH_BUTTON.icon} ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {/* Title */}
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">
                    {title}
                  </h2>
                )}
                
                {/* Close Button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={TOUCH_BUTTON.icon}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className={`${RESPONSIVE_SPACING.md}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileModal;
