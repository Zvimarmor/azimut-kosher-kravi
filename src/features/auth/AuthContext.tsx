import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
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

      // Use redirect on mobile, popup on desktop
      if (mobile) {
        logger.log('AuthContext: Using signInWithRedirect');
        await signInWithRedirect(auth, authProvider);
        logger.log('AuthContext: signInWithRedirect initiated (will redirect now)');
        // Note: execution stops here as page redirects
      } else {
        logger.log('AuthContext: Using signInWithPopup');
        const result = await signInWithPopup(auth, authProvider);
        logger.log('AuthContext: signInWithPopup successful', {
          userEmail: result.user.email,
          userDisplayName: result.user.displayName,
          userUid: result.user.uid,
          providerId: result.providerId
        });
        // User state will be updated by onAuthStateChanged listener
      }
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
    logger.log('AuthContext: Component mounted, setting up auth listeners');
    logger.log('AuthContext: Current URL:', window.location.href);
    logger.log('AuthContext: User agent:', navigator.userAgent);
    logger.log('AuthContext: Auth instance state:', {
      currentUser: auth.currentUser?.email,
      isSignInWithEmailLink: auth.currentUser !== null
    });

    let authUnsubscribe: (() => void) | null = null;

    // Handle redirect result FIRST before setting up listener
    // This is critical for mobile devices
    logger.log('AuthContext: Checking for redirect result...');
    getRedirectResult(auth)
      .then((result) => {
        logger.log('AuthContext: getRedirectResult resolved', {
          hasResult: !!result,
          userEmail: result?.user?.email,
          userDisplayName: result?.user?.displayName,
          providerId: result?.providerId,
          credential: result?.providerId
        });

        if (result && result.user) {
          // User successfully signed in via redirect
          logger.log('AuthContext: Redirect login successful', {
            userEmail: result.user.email,
            userUid: result.user.uid,
            displayName: result.user.displayName
          });
          setCurrentUser(result.user);
        } else {
          logger.log('AuthContext: No redirect result (normal page load or popup login)');
        }
      })
      .catch((error) => {
        logger.error('AuthContext: Redirect result error', {
          code: error.code,
          message: error.message,
          fullError: error
        });
        // Common errors on mobile:
        // - auth/popup-closed-by-user
        // - auth/cancelled-popup-request
        // - auth/network-request-failed
      })
      .finally(() => {
        logger.log('AuthContext: Redirect check complete, setting up auth listener');

        // NOW set up auth state listener after redirect is processed
        authUnsubscribe = onAuthStateChanged(auth, (user) => {
          logger.log('AuthContext: onAuthStateChanged fired', {
            hasUser: !!user,
            userEmail: user?.email,
            userDisplayName: user?.displayName,
            userUid: user?.uid,
            providerData: user?.providerData
          });

          setCurrentUser(user);
          setLoading(false);
        });

        // If auth state hasn't changed by now, stop loading
        if (!auth.currentUser) {
          setLoading(false);
        }
      });

    return () => {
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