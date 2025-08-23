import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Users, 
  Settings, 
  Menu, 
  X,
  Home,
  ChevronRight,
  Share2,
  Building
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const DashboardNavigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation: NavigationItem[] = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: Home,
      description: 'Business overview and summary metrics'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Google Analytics metrics and insights'
    },
    {
      name: 'Automation',
      href: '/dashboard/automation',
      icon: Zap,
      description: 'n8n workflow performance and ROI'
    },
    {
      name: 'Trends',
      href: '/dashboard/trends',
      icon: TrendingUp,
      description: 'Business trends and performance analysis'
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      description: 'User management and analytics'
    },
    {
      name: 'Social Media',
      href: '/dashboard/social',
      icon: Share2,
      description: 'Social media metrics and ad performance'
    },
    {
      name: 'CRM',
      href: '/dashboard/crm',
      icon: Building,
      description: 'Customer relationship management metrics'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      description: 'Platform configuration and preferences'
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
          aria-expanded={isSidebarOpen}
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3" aria-label="Dashboard navigation">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-500' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon 
                    className={`
                      mr-3 h-5 w-5 transition-colors duration-200
                      ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}
                    `}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  <span className="sr-only">{item.description}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default DashboardNavigation;
