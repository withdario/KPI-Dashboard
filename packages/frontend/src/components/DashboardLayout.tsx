import DashboardNavigation from './DashboardNavigation';
import ThemeToggle from './ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              BI Platform
            </h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                U
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <DashboardNavigation />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <DashboardNavigation />
          </div>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Page Header for Mobile */}
            {title && (
              <div className="lg:hidden mb-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
