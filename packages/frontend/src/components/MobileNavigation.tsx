import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, BarChart3, TrendingUp, Settings, LogOut, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TOUCH_BUTTON, NAV_RESPONSIVE } from '../utils/responsive';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Close navigation when route changes
  useEffect(() => {
    onClose();
    setActiveSubmenu(null);
  }, [location.pathname, onClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const toggleSubmenu = (menuId: string) => {
    setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
  };

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      current: location.pathname === '/dashboard'
    },
    { 
      id: 'business-overview', 
      name: 'Business Overview', 
      href: '/dashboard/business-overview', 
      icon: BarChart3,
      current: location.pathname === '/dashboard/business-overview'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: TrendingUp,
      current: location.pathname === '/dashboard/analytics'
    },
    { 
      id: 'automation', 
      name: 'Automation', 
      href: '/dashboard/automation', 
      icon: TrendingUp,
      current: location.pathname === '/dashboard/automation'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={NAV_RESPONSIVE.overlay}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Mobile Navigation */}
      <div className={NAV_RESPONSIVE.mobile}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              BI Platform
            </Link>
          </div>
          <button
            onClick={onClose}
            className={TOUCH_BUTTON.icon}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-6">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center justify-between w-full p-4 rounded-lg text-left transition-colors ${
                  item.current
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={onClose}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.current && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        {isAuthenticated && user && (
          <div className="px-4 py-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/dashboard/settings"
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onClose}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Auth Section for non-authenticated users */}
        {!isAuthenticated && (
          <div className="px-4 py-6 border-t border-gray-200">
            <div className="space-y-3">
              <Link
                to="/login"
                className={`${TOUCH_BUTTON.secondary} w-full justify-center`}
                onClick={onClose}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`${TOUCH_BUTTON.primary} w-full justify-center`}
                onClick={onClose}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileNavigation;
