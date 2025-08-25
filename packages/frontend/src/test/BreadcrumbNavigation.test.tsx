import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BreadcrumbNavigation from '../components/BreadcrumbNavigation';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('BreadcrumbNavigation', () => {
  it('renders breadcrumbs for dashboard route', () => {
    renderWithRouter(<BreadcrumbNavigation />, { route: '/dashboard' });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders breadcrumbs for nested routes', () => {
    renderWithRouter(<BreadcrumbNavigation />, { route: '/dashboard/business-overview' });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Business Overview')).toBeInTheDocument();
  });
});
