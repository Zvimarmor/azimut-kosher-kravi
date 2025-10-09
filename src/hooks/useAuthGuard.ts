import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { auth } from '../lib/firebase/config';
import type { User } from 'firebase/auth';
import { useAuth } from '../features/auth/AuthContext';

interface AuthGuardState {
  isLoading: boolean;
  isAuthorized: boolean;
  user: User | null;
}

const REDIRECT_DELAY = 500; // Give auth state some time to settle

/**
 * A hook to handle auth state synchronization and protected routes
 * @param requireAuth - Whether the current route requires authentication
 * @param redirectTo - Where to redirect if auth check fails
 */
export function useAuthGuard(requireAuth: boolean = true, redirectTo: string = 'Home') {
  const { currentUser, loading: authLoading } = useAuth();
  const [state, setState] = useState<AuthGuardState>({
    isLoading: true,
    isAuthorized: false,
    user: null
  });
  const navigate = useNavigate();
  const location = useLocation();
  const navigationTimeoutRef = useRef<number>();

  useEffect(() => {
    // Clear any existing navigation timeout
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current);
    }

    // Skip auth check if auth state is still loading
    if (authLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Check authorization
    const isAuthorized = !requireAuth || !!currentUser;

    // Update state first
    setState({
      isLoading: false,
      isAuthorized,
      user: currentUser
    });

    // If unauthorized, schedule redirect with a small delay
    if (!isAuthorized) {
      navigationTimeoutRef.current = window.setTimeout(() => {
        navigate(createPageUrl(redirectTo), {
          state: { from: location.pathname }
        });
      }, REDIRECT_DELAY);
    }

    return () => {
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [requireAuth, redirectTo, navigate, location, currentUser, authLoading]);

  return state;
}
