import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple mobile detection
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Google login
  const login = async (provider: 'google') => {
    const authProvider = new GoogleAuthProvider();
    authProvider.addScope('profile');
    authProvider.addScope('email');

    // Use redirect on mobile, popup on desktop
    if (isMobile()) {
      await signInWithRedirect(auth, authProvider);
    } else {
      await signInWithPopup(auth, authProvider);
    }
  };

  // Email/password login
  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Email/password registration
  const registerWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // Password reset
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  // Handle auth state changes and redirect results
  useEffect(() => {
    // Check for redirect result (for mobile OAuth)
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect result error:', error);
    });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
