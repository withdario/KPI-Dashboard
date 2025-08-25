import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { TOUCH_BUTTON, RESPONSIVE_SPACING } from '@/utils/responsive';
import BreadcrumbNavigation from './BreadcrumbNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Business Intelligence Dashboard</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/dashboard/business-overview" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Business Overview
              </a>
              <a href="/dashboard/analytics" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Analytics
              </a>
              <a href="/dashboard/automation" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Automation
              </a>
              <a href="/dashboard/mobile" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Mobile Demo
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={TOUCH_BUTTON.icon}
                aria-label="Toggle dashboard menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="px-4 py-2 space-y-1">
              <a href="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/dashboard/business-overview" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium">
                Business Overview
              </a>
              <a href="/dashboard/analytics" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium">
                Analytics
              </a>
              <a href="/dashboard/automation" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium">
                Automation
              </a>
              <a href="/dashboard/mobile" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-sm font-medium">
                Mobile Demo
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />

      {/* Main Content */}
      <main className={`flex-1 ${RESPONSIVE_SPACING.md}`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
