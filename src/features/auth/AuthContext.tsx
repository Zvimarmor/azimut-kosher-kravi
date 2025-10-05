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
      } else {
        authProvider = new FacebookAuthProvider();
      }

      const mobile = isMobile();
      console.log('AuthContext: Device is mobile?', mobile);
      console.log('AuthContext: User agent:', navigator.userAgent);

      // Use redirect on mobile, popup on desktop
      if (mobile) {
        console.log('AuthContext: Using signInWithRedirect');
        await signInWithRedirect(auth, authProvider);
        console.log('AuthContext: signInWithRedirect initiated (will redirect now)');
      } else {
        console.log('AuthContext: Using signInWithPopup');
        const result = await signInWithPopup(auth, authProvider);
        console.log('AuthContext: signInWithPopup successful', {
          userEmail: result.user.email,
          providerId: result.providerId
        });
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

    // Handle redirect result when returning from OAuth provider
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
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthContext: onAuthStateChanged fired', {
        hasUser: !!user,
        userEmail: user?.email,
        userDisplayName: user?.displayName,
        userUid: user?.uid,
        providerData: user?.providerData
      });
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};