/**
 * Group Training Service
 *
 * Manages group workout sessions using Firebase Firestore for real-time multi-device sync.
 * Supports up to 4 participants training together synchronously across different devices.
 */

import { GroupSession } from '../../Entities/GroupSession';
import * as firebaseGroupTraining from '../firebase/groupTraining';

/**
 * Create a new group training session
 *
 * @param creatorId - ID of the user creating the session
 * @param creatorName - Display name of creator
 * @param workoutTitle - Title of the workout
 * @param workoutId - Optional workout ID
 * @returns The created session
 */
export async function createSession(
  creatorId: string,
  creatorName: string,
  workoutTitle: string,
  workoutId?: string
): Promise<GroupSession> {
  return firebaseGroupTraining.createSession(creatorId, creatorName, workoutTitle, workoutId);
}

/**
 * Find a session by its code
 *
 * @param code - The 8-character session code
 * @param language - User's language preference
 * @returns The session if found, null otherwise
 */
export async function findSessionByCode(
  code: string,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession | null> {
  return firebaseGroupTraining.findSessionByCode(code, language);
}

/**
 * Get a session by ID
 *
 * @param sessionId - The session ID
 * @returns The session if found, null otherwise
 */
export async function getSessionById(sessionId: string): Promise<GroupSession | null> {
  return firebaseGroupTraining.getSessionById(sessionId);
}

/**
 * Join an existing session
 *
 * @param code - The session code
 * @param participantId - ID of the participant
 * @param participantName - Display name of participant
 * @param language - User's language preference
 * @returns The updated session
 * @throws Error if session not found, full, or started
 */
export async function joinSession(
  code: string,
  participantId: string,
  participantName: string,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  return firebaseGroupTraining.joinSession(code, participantId, participantName, language);
}

/**
 * Leave a session
 *
 * @param sessionId - The session ID
 * @param participantId - ID of the participant leaving
 * @param language - User's language preference
 * @returns The updated session
 */
export async function leaveSession(
  sessionId: string,
  participantId: string,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  return firebaseGroupTraining.leaveSession(sessionId, participantId, language);
}

/**
 * Start the workout
 *
 * @param sessionId - The session ID
 * @param language - User's language preference
 * @returns The updated session
 */
export async function startWorkout(
  sessionId: string,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  return firebaseGroupTraining.startWorkout(sessionId, language);
}

/**
 * Mark participant as having completed current exercise
 *
 * @param sessionId - The session ID
 * @param participantId - ID of the participant
 * @param completed - Completion status
 * @param language - User's language preference
 * @returns The updated session
 */
export async function setParticipantCompleted(
  sessionId: string,
  participantId: string,
  completed: boolean,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  return firebaseGroupTraining.setParticipantCompleted(sessionId, participantId, completed, language);
}

/**
 * Move to next exercise
 *
 * Should only be called when all participants have completed current exercise
 *
 * @param sessionId - The session ID
 * @param nextPartIndex - Next part index
 * @param nextComponentIndex - Next component index
 * @param language - User's language preference
 * @returns The updated session
 */
export async function moveToNext(
  sessionId: string,
  nextPartIndex: number,
  nextComponentIndex: number,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  return firebaseGroupTraining.moveToNext(sessionId, nextPartIndex, nextComponentIndex, language);
}

/**
 * Complete the workout
 *
 * @param sessionId - The session ID
 * @param language - User's language preference
 * @returns The updated session
 */
export async function completeWorkout(
  sessionId: string,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  return firebaseGroupTraining.completeWorkout(sessionId, language);
}

/**
 * Delete a session
 *
 * @param sessionId - The session ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
  return firebaseGroupTraining.deleteSession(sessionId);
}

/**
 * Clean up old and expired sessions
 *
 * Removes sessions that are expired or completed more than 24 hours ago
 */
export async function cleanupOldSessions(): Promise<void> {
  return firebaseGroupTraining.cleanupOldSessions();
}

/**
 * Session Sync Manager
 *
 * Uses Firebase real-time listeners for instant updates across devices.
 * No polling needed - updates happen automatically when session data changes.
 */
export class SessionSyncManager {
  private unsubscribe: (() => void) | null = null;
  private sessionId: string;
  private onUpdate: (session: GroupSession | null) => void;
  private onError?: (error: Error) => void;

  constructor(
    sessionId: string,
    onUpdate: (session: GroupSession | null) => void,
    onError?: (error: Error) => void
  ) {
    this.sessionId = sessionId;
    this.onUpdate = onUpdate;
    this.onError = onError;
  }

  /**
   * Start listening for real-time updates
   */
  start(): void {
    if (this.unsubscribe !== null) return;

    this.unsubscribe = firebaseGroupTraining.subscribeToSession(
      this.sessionId,
      this.onUpdate,
      this.onError
    );
  }

  /**
   * Stop listening for updates
   */
  stop(): void {
    if (this.unsubscribe !== null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Manually trigger an update check (kept for backward compatibility)
   */
  async refresh(): Promise<void> {
    try {
      const session = await getSessionById(this.sessionId);
      this.onUpdate(session);
    } catch (error) {
      console.error('Error refreshing session:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }
}

/**
 * Get user's active sessions
 *
 * Returns sessions where the user is a participant and session is active
 *
 * @param userId - The user's ID
 * @returns Array of active sessions
 */
export async function getUserActiveSessions(userId: string): Promise<GroupSession[]> {
  return firebaseGroupTraining.getUserActiveSessions(userId);
}

// Run cleanup on initialization
cleanupOldSessions().catch(err => {
  console.error('Failed to cleanup old sessions:', err);
});
