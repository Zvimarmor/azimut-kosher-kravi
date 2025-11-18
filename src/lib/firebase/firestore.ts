import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { User as UserEntity } from '../../Entities/User';

/**
 * User Profile stored in Firestore
 * Extends the basic User entity with subscription and feature flags
 */
export interface UserProfile extends Omit<UserEntity, 'id' | 'created_date' | 'last_active'> {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastActive: Timestamp;

  // Subscription management (for future Stripe integration)
  subscription: {
    status: 'free' | 'active' | 'canceled' | 'past_due';
    tier: 'free' | 'premium' | 'pro';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Timestamp;
    cancelAtPeriodEnd: boolean;
  };

  // Feature access flags
  features: {
    militaryChatQuota: number;
    militaryChatQuotaResetDate: string;
    hasUnlimitedChat: boolean;
    canAccessPremiumWorkouts: boolean;
    canAccessGroupTraining: boolean;
  };

  // Usage tracking
  usage: {
    totalWorkouts: number;
    totalChatMessages: number;
    lastWorkoutDate?: Timestamp;
  };
}

/**
 * Create a new user profile in Firestore
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid);

  const newProfile: UserProfile = {
    uid,
    email,
    displayName,
    photoURL,
    name: displayName,
    fitness_level: 'beginner',
    preferred_language: 'hebrew',
    measurement_system: 'metric',
    attributes: {
      push_strength: 5,
      pull_strength: 5,
      cardio_endurance: 5,
      running_volume: 5,
      rucking_volume: 5,
      weight_work: 5
    },
    createdAt: serverTimestamp() as Timestamp,
    lastActive: serverTimestamp() as Timestamp,
    subscription: {
      status: 'free',
      tier: 'free',
      cancelAtPeriodEnd: false
    },
    features: {
      militaryChatQuota: 10,
      militaryChatQuotaResetDate: new Date().toDateString(),
      hasUnlimitedChat: false,
      canAccessPremiumWorkouts: false,
      canAccessGroupTraining: false
    },
    usage: {
      totalWorkouts: 0,
      totalChatMessages: 0
    },
    goals: [],
    medical_restrictions: []
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
}

/**
 * Update user's last active timestamp
 */
export async function updateLastActive(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last active:', error);
  }
}

/**
 * Check and reset daily chat quota if needed
 */
export async function checkAndResetChatQuota(uid: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return 0;
    }

    const userData = userDoc.data() as UserProfile;
    const today = new Date().toDateString();
    const lastResetDate = userData.features.militaryChatQuotaResetDate;

    // Reset quota if it's a new day
    if (lastResetDate !== today) {
      const newQuota = userData.features.hasUnlimitedChat ? 999 : 10;
      await updateDoc(userRef, {
        'features.militaryChatQuota': newQuota,
        'features.militaryChatQuotaResetDate': today
      });
      return newQuota;
    }

    return userData.features.militaryChatQuota;
  } catch (error) {
    console.error('Error checking chat quota:', error);
    return 0;
  }
}

/**
 * Decrement chat quota after sending a message
 */
export async function decrementChatQuota(uid: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as UserProfile;
    const currentQuota = userData.features.militaryChatQuota;

    if (currentQuota <= 0 && !userData.features.hasUnlimitedChat) {
      throw new Error('Chat quota exceeded');
    }

    const newQuota = Math.max(0, currentQuota - 1);

    await updateDoc(userRef, {
      'features.militaryChatQuota': newQuota,
      'usage.totalChatMessages': (userData.usage.totalChatMessages || 0) + 1,
      lastActive: serverTimestamp()
    });

    return newQuota;
  } catch (error) {
    console.error('Error decrementing chat quota:', error);
    throw error;
  }
}

/**
 * Increment workout count
 */
export async function incrementWorkoutCount(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return;
    }

    const userData = userDoc.data() as UserProfile;

    await updateDoc(userRef, {
      'usage.totalWorkouts': (userData.usage.totalWorkouts || 0) + 1,
      'usage.lastWorkoutDate': serverTimestamp(),
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing workout count:', error);
  }
}
