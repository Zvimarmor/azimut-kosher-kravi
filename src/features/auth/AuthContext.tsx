import { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, UserCredential, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';
import * as authService from '../../lib/firebase/auth';
import * as firestoreService from '../../lib/firebase/firestore';
import { UserProfile } from '../../lib/firebase/firestore';

interface AuthContextType {
  // Auth state
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Auth methods
  loginWithGoogle: () => Promise<UserCredential | null>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // User profile methods
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Feature checks
  isPremium: boolean;
  chatQuotaRemaining: number;
  hasFeatureAccess: (feature: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    // Check for redirect result FIRST, before setting up listeners
    // This must happen synchronously before React Router processes URL params
    console.log('🔍 Checking for Google redirect result...');
    authService.handleGoogleRedirect()
      .then((result) => {
        if (result) {
          console.log('✅ Google redirect successful:', result.user.email);
          // The onAuthStateChanged listener will handle profile loading
        } else {
          console.log('ℹ️ No pending Google redirect');
        }
      })
      .catch((err) => {
        console.error('❌ Redirect error:', err);
        setError('Failed to complete Google sign-in. Please try again.');
        setLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);

      if (user) {
        // User is signed in, fetch their profile
        console.log('📝 Loading user profile for:', user.uid);
        await loadUserProfile(user);
      } else {
        // User is signed out
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = async (user: FirebaseUser) => {
    try {
      let profile = await firestoreService.getUserProfile(user.uid);

      // Create profile if it doesn't exist
      if (!profile) {
        profile = await firestoreService.createUserProfile(
          user.uid,
          user.email || '',
          user.displayName || 'User',
          user.photoURL || undefined
        );
      }

      if (profile) {
        // Check and reset chat quota if needed
        const updatedQuota = await firestoreService.checkAndResetChatQuota(user.uid);
        profile.features.militaryChatQuota = updatedQuota;

        setUserProfile(profile);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to load user profile');
    }
  };

  // Refresh user profile from Firestore
  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  // Update user profile in Firestore
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await firestoreService.updateUserProfile(currentUser.uid, updates);
      await refreshProfile();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await authService.loginWithGoogle();
      // User state will be updated by onAuthStateChanged
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
      throw err;
    }
  };

  // Login with email/password
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.loginWithEmail(email, password);
      // User state will be updated by onAuthStateChanged
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    }
  };

  // Sign up with email/password
  const signupWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      setError(null);
      await authService.signupWithEmail(email, password, displayName);
      // User state will be updated by onAuthStateChanged
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    }
  };

  // Check if user has premium subscription
  const isPremium =
    userProfile?.subscription.status === 'active' &&
    userProfile?.subscription.tier !== 'free';

  // Get remaining chat quota
  const chatQuotaRemaining = userProfile?.features.militaryChatQuota || 0;

  // Check feature access
  const hasFeatureAccess = (feature: string): boolean => {
    if (!userProfile) return false;

    switch (feature) {
      case 'unlimited_chat':
        return userProfile.features.hasUnlimitedChat;
      case 'premium_workouts':
        return userProfile.features.canAccessPremiumWorkouts;
      case 'group_training':
        return userProfile.features.canAccessGroupTraining;
      default:
        return false;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    resetPassword,
    refreshProfile,
    updateProfile,
    isPremium,
    chatQuotaRemaining,
    hasFeatureAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
