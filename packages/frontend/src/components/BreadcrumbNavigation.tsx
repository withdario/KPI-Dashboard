import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const BreadcrumbNavigation: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show on home page
  if (pathSegments.length === 0) return null;
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
        {pathSegments.map((segment, index) => (
          <React.Fragment key={segment}>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {segment === 'dashboard' ? 'Dashboard' : 
               segment === 'business-overview' ? 'Business Overview' :
               segment === 'user-settings' ? 'User Settings' :
               segment === 'google-analytics' ? 'Google Analytics' :
               segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default BreadcrumbNavigation;
