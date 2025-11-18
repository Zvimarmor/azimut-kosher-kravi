import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Detect if device is mobile
 * Returns false for DevTools mobile emulation to ensure popup works correctly
 */
function isMobileDevice(): boolean {
  // Check if running in actual mobile device, not DevTools emulation
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Only return true if both touch is available AND mobile user agent
  // This prevents DevTools mobile emulation from triggering redirect
  return isTouchDevice && isMobileUA;
}

/**
 * Login with Google using popup (desktop) or redirect (mobile)
 */
export async function loginWithGoogle(): Promise<UserCredential | null> {
  try {
    if (isMobileDevice()) {
      // Use redirect for mobile devices
      await signInWithRedirect(auth, googleProvider);
      return null; // Result will be available via getRedirectResult
    } else {
      // Use popup for desktop and DevTools emulation
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    }
  } catch (error: any) {
    console.error('Google login error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Handle redirect result after Google OAuth redirect
 */
export async function handleGoogleRedirect(): Promise<UserCredential | null> {
  try {
    console.log('🔄 Calling getRedirectResult...');
    const result = await getRedirectResult(auth);

    if (result) {
      console.log('✅ Redirect result found:', {
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName
      });
    } else {
      console.log('⚠️ getRedirectResult returned null - no pending redirect');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Redirect result error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error: any) {
    console.error('Email login error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign up with email and password
 */
export async function signupWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }

    return result;
  } catch (error: any) {
    console.error('Email signup error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout. Please try again.');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Update user profile (display name, photo URL)
 */
export async function updateUserProfile(
  user: User,
  updates: { displayName?: string; photoURL?: string }
): Promise<void> {
  try {
    await updateProfile(user, updates);
  } catch (error: any) {
    console.error('Profile update error:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
