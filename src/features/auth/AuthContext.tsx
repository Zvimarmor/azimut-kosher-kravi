import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { auth } from '../../lib/firebase/config';

interface AuthContextType {
  currentUser: User | null;
  login: (provider: 'google') => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Storage keys for tracking auth state
const AUTH_REDIRECT_KEY = 'auth_redirect_pending';
const AUTH_ERROR_KEY = 'auth_error';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null);
    sessionStorage.removeItem(AUTH_ERROR_KEY);
  };

  // Google login - using redirect for better mobile support
  const login = async (provider: 'google') => {
    try {
      const authProvider = new GoogleAuthProvider();
      authProvider.addScope('profile');
      authProvider.addScope('email');

      // Set custom parameters for better UX
      authProvider.setCustomParameters({
        prompt: 'select_account'
      });

      // Mark that we're starting an auth redirect
      sessionStorage.setItem(AUTH_REDIRECT_KEY, 'true');
      setIsAuthenticating(true);

      // Use redirect flow for all devices (more reliable on mobile)
      await signInWithRedirect(auth, authProvider);

      // Note: This function won't return as the page will redirect
      // The result will be handled in the useEffect below
    } catch (error) {
      sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      setIsAuthenticating(false);
      throw error;
    }
  };

  // Email/password login
  const loginWithEmail = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearAuthError();
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getErrorMessage(authError);
      setAuthError(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Email/password registration
  const registerWithEmail = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      clearAuthError();
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getErrorMessage(authError);
      setAuthError(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Password reset
  const resetPassword = async (email: string) => {
    setIsAuthenticating(true);
    try {
      await sendPasswordResetEmail(auth, email);
      clearAuthError();
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getErrorMessage(authError);
      setAuthError(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsAuthenticating(true);
    try {
      await signOut(auth);
      clearAuthError();
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getErrorMessage(authError);
      setAuthError(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle auth state changes and redirect results
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Check if we're returning from an OAuth redirect
      const wasRedirecting = sessionStorage.getItem(AUTH_REDIRECT_KEY) === 'true';

      if (wasRedirecting) {
        setIsAuthenticating(true);
      }

      try {
        // Get the redirect result (if any)
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          console.log('OAuth login successful:', result.user.email);
          clearAuthError();
        }

        // Clear the redirect flag
        sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      } catch (error) {
        console.error('OAuth redirect error:', error);
        const authError = error as AuthError;
        const errorMessage = getErrorMessage(authError);
        setAuthError(errorMessage);
        sessionStorage.setItem(AUTH_ERROR_KEY, errorMessage);
        sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      } finally {
        if (mounted) {
          setIsAuthenticating(false);
        }
      }
    };

    // Initialize auth and check for redirect results
    initAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    loading,
    isAuthenticating,
    authError,
    clearAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to convert Firebase auth errors to user-friendly messages
function getErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups for this site.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in method.';
    default:
      console.error('Auth error:', error);
      return 'Authentication failed. Please try again.';
  }
}
