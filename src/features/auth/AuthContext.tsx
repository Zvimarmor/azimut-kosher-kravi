import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';

interface AuthContextType {
  currentUser: User | null;
  login: (provider: 'google' | 'facebook') => Promise<void>;
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

  const login = async (provider: 'google' | 'facebook') => {
    try {
      console.log('AuthContext: Starting login with provider:', provider);
      let authProvider;

      if (provider === 'google') {
        authProvider = new GoogleAuthProvider();
        // Request profile and email scopes
        authProvider.addScope('profile');
        authProvider.addScope('email');
        // Ensure we get a fresh token
        authProvider.setCustomParameters({
          prompt: 'select_account'
        });
      } else {
        authProvider = new FacebookAuthProvider();
        // Request profile and email scopes
        authProvider.addScope('public_profile');
        authProvider.addScope('email');
      }

      const mobile = isMobile();
      console.log('AuthContext: Device is mobile?', mobile);
      console.log('AuthContext: User agent:', navigator.userAgent);

      // Use redirect on mobile, popup on desktop
      if (mobile) {
        console.log('AuthContext: Using signInWithRedirect');
        await signInWithRedirect(auth, authProvider);
        console.log('AuthContext: signInWithRedirect initiated (will redirect now)');
        // Note: execution stops here as page redirects
      } else {
        console.log('AuthContext: Using signInWithPopup');
        const result = await signInWithPopup(auth, authProvider);
        console.log('AuthContext: signInWithPopup successful', {
          userEmail: result.user.email,
          userDisplayName: result.user.displayName,
          userUid: result.user.uid,
          providerId: result.providerId
        });
        // User state will be updated by onAuthStateChanged listener
      }
    } catch (error: any) {
      console.error('Login error:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('AuthContext: Component mounted, setting up auth listeners');
    console.log('AuthContext: Current URL:', window.location.href);
    console.log('AuthContext: Auth instance state:', {
      currentUser: auth.currentUser?.email,
      isSignInWithEmailLink: auth.currentUser !== null
    });

    let authUnsubscribe: (() => void) | null = null;
    let redirectCheckComplete = false;

    // Set up auth state listener immediately
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthContext: onAuthStateChanged fired', {
        hasUser: !!user,
        userEmail: user?.email,
        userDisplayName: user?.displayName,
        userUid: user?.uid,
        providerData: user?.providerData,
        redirectCheckComplete
      });

      // Only update state if redirect check is complete OR if we have a user
      // This prevents clearing the user state prematurely
      if (redirectCheckComplete || user) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    // Handle redirect result in parallel
    console.log('AuthContext: Checking for redirect result...');
    getRedirectResult(auth)
      .then((result) => {
        console.log('AuthContext: getRedirectResult resolved', {
          hasResult: !!result,
          userEmail: result?.user?.email,
          userDisplayName: result?.user?.displayName,
          providerId: result?.providerId
        });

        if (result) {
          // User successfully signed in via redirect
          console.log('Redirect login successful:', result.user);
          setCurrentUser(result.user);
          setLoading(false);
        } else {
          console.log('No redirect result (user may have logged in via popup or not redirected)');
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', {
          code: error.code,
          message: error.message,
          fullError: error
        });
        // Don't treat this as a fatal error - auth state listener will handle the user state
      })
      .finally(() => {
        redirectCheckComplete = true;
        // If we still don't have a user after redirect check, allow the loading to complete
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