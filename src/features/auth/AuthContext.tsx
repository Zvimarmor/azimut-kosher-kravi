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
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../lib/firebase/config';
import { logger } from '../../lib/utils/logger';

interface AuthContextType {
  currentUser: User | null;
  login: (provider: 'google') => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Detect if we're on mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (provider: 'google') => {
    try {
      logger.log('AuthContext: Starting login with provider:', provider);

      const authProvider = new GoogleAuthProvider();
      // Request profile and email scopes
      authProvider.addScope('profile');
      authProvider.addScope('email');
      // Ensure we get a fresh token
      authProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const mobile = isMobile();
      logger.log('AuthContext: Device is mobile?', mobile);
      logger.log('AuthContext: User agent:', navigator.userAgent);

      // ALWAYS use redirect flow - it's more reliable on mobile
      // Popup has issues with modern browser security policies
      logger.log('AuthContext: Using signInWithRedirect (mobile-first approach)');
      await signInWithRedirect(auth, authProvider);
      logger.log('AuthContext: signInWithRedirect initiated (will redirect now)');
      // Note: execution stops here as page redirects
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      logger.error('Login error:', {
        code: err.code,
        message: err.message,
        fullError: error
      });
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      logger.log('AuthContext: Starting email/password login');
      const result = await signInWithEmailAndPassword(auth, email, password);
      logger.log('AuthContext: Email login successful', {
        userEmail: result.user.email,
        userUid: result.user.uid
      });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      logger.error('Email login error:', {
        code: err.code,
        message: err.message
      });
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      logger.log('AuthContext: Starting email/password registration');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      logger.log('AuthContext: Registration successful', {
        userEmail: result.user.email,
        userUid: result.user.uid
      });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      logger.error('Registration error:', {
        code: err.code,
        message: err.message
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      logger.log('AuthContext: Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      logger.log('AuthContext: Password reset email sent');
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      logger.error('Password reset error:', {
        code: err.code,
        message: err.message
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    logger.log('==========================================');
    logger.log('AuthContext: Component mounted - STARTING AUTH SETUP');
    logger.log('AuthContext: Current URL:', window.location.href);
    logger.log('AuthContext: Current timestamp:', new Date().toISOString());
    logger.log('AuthContext: Auth instance state:', {
      currentUser: auth.currentUser?.email || 'NO USER',
      hasCurrentUser: !!auth.currentUser
    });

    // Check localStorage for any auth data
    logger.log('AuthContext: Checking localStorage for Firebase auth...');
    const keys = Object.keys(localStorage);
    const firebaseKeys = keys.filter(k => k.includes('firebase'));
    logger.log('AuthContext: Firebase-related localStorage keys:', firebaseKeys);

    let authUnsubscribe: (() => void) | null = null;
    let redirectCheckComplete = false;

    // Set up auth state listener immediately
    logger.log('AuthContext: Setting up onAuthStateChanged listener...');
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      logger.log('==========================================');
      logger.log('AuthContext: ⚡ onAuthStateChanged FIRED');
      logger.log('AuthContext: Timestamp:', new Date().toISOString());
      logger.log('AuthContext: Has user?', !!user);

      if (user) {
        logger.log('AuthContext: ✅ USER FOUND:', {
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          providerData: user.providerData.map(p => ({
            providerId: p.providerId,
            uid: p.uid,
            email: p.email
          }))
        });
      } else {
        logger.log('AuthContext: ❌ NO USER (null)');
      }

      logger.log('AuthContext: redirectCheckComplete?', redirectCheckComplete);

      // Only update state if redirect check is complete OR if we have a user
      // This prevents clearing the user state prematurely
      if (redirectCheckComplete || user) {
        logger.log('AuthContext: 📝 UPDATING STATE - Setting currentUser and loading=false');
        setCurrentUser(user);
        setLoading(false);
      } else {
        logger.log('AuthContext: ⏸️ WAITING - Not updating state yet (waiting for redirect check)');
      }
      logger.log('==========================================');
    });

    // Handle redirect result in parallel
    logger.log('AuthContext: Calling getRedirectResult...');
    logger.log('AuthContext: Current full URL:', window.location.href);
    logger.log('AuthContext: URL search params:', window.location.search);
    logger.log('AuthContext: URL hash:', window.location.hash);
    logger.log('AuthContext: URL pathname:', window.location.pathname);
    logger.log('AuthContext: URL origin:', window.location.origin);

    // Log ALL URL parameters for debugging
    const searchParams = new URLSearchParams(window.location.search);
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    logger.log('AuthContext: Parsed URL parameters:', allParams);
    logger.log('AuthContext: Number of URL parameters:', searchParams.size);

    getRedirectResult(auth)
      .then((result) => {
        logger.log('==========================================');
        logger.log('AuthContext: ✅ getRedirectResult RESOLVED');
        logger.log('AuthContext: Has result?', !!result);
        logger.log('AuthContext: Result value:', result);

        if (result) {
          logger.log('AuthContext: 🎉 REDIRECT LOGIN SUCCESS!');
          logger.log('AuthContext: User info:', {
            email: result.user.email,
            displayName: result.user.displayName,
            uid: result.user.uid,
            providerId: result.providerId,
            providerData: result.user.providerData
          });

          if (result.user) {
            logger.log('AuthContext: 📝 Setting currentUser from redirect result');
            setCurrentUser(result.user);
            setLoading(false);
          }
        } else {
          logger.log('AuthContext: ℹ️ No redirect result (normal page load or already processed)');
        }
        logger.log('==========================================');
      })
      .catch((error) => {
        logger.log('==========================================');
        logger.error('AuthContext: ❌ getRedirectResult ERROR');
        logger.error('AuthContext: Error code:', error.code);
        logger.error('AuthContext: Error message:', error.message);
        logger.error('AuthContext: Full error:', error);
        logger.log('==========================================');
      })
      .finally(() => {
        logger.log('AuthContext: ✓ Redirect check complete - setting flag to true');
        redirectCheckComplete = true;

        // If we still don't have a user after redirect check, allow the loading to complete
        if (!auth.currentUser) {
          logger.log('AuthContext: No user after redirect check - stopping loading');
          setLoading(false);
        } else {
          logger.log('AuthContext: User exists after redirect check:', auth.currentUser.email);
        }
      });

    return () => {
      logger.log('AuthContext: Cleanup - unsubscribing from auth listener');
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);

  const value = {
    currentUser,
    login,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    loading
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-idf-olive border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};