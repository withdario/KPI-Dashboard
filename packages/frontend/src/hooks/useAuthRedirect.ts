import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  redirectIfAuthenticated?: boolean;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { redirectTo = '/', requireAuth = false, redirectIfAuthenticated = false } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (redirectIfAuthenticated && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectIfAuthenticated, redirectTo, navigate]);

  return { isAuthenticated, isLoading };
};
