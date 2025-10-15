/**
 * Group Training Service
 *
 * Manages group workout sessions stored in localStorage.
 * Supports up to 4 participants training together synchronously.
 *
 * FUTURE ENHANCEMENTS:
 * - Replace localStorage with Firebase Realtime Database for true multi-device sync
 * - Implement WebSocket for real-time updates
 * - Add push notifications when all participants complete
 * - Add session chat functionality
 */

import { GroupSession } from '../../Entities/GroupSession';

const SESSIONS_STORAGE_KEY = 'group_training_sessions';
const SYNC_INTERVAL_MS = 2000; // Poll every 2 seconds

/**
 * Get all sessions from localStorage
 */
function getAllSessions(): GroupSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!stored) return [];
    const sessions = JSON.parse(stored);
    // Filter out expired sessions
    return sessions.filter((s: GroupSession) => !GroupSession.isExpired(s));
  } catch (error) {
    console.error('Error reading sessions from storage:', error);
    return [];
  }
}

/**
 * Save all sessions to localStorage
 */
function saveSessions(sessions: GroupSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions to storage:', error);
  }
}

/**
 * Create a new group training session
 *
 * @param creatorId - ID of the user creating the session
 * @param creatorName - Display name of creator
 * @param workoutTitle - Title of the workout
 * @param workoutId - Optional workout ID
 * @returns The created session
 */
export function createSession(
  creatorId: string,
  creatorName: string,
  workoutTitle: string,
  workoutId?: string
): GroupSession {
  const newSession = GroupSession.create(creatorId, creatorName, workoutTitle, workoutId);

  const sessions = getAllSessions();
  sessions.push(newSession);
  saveSessions(sessions);

  return newSession;
}

/**
 * Find a session by its code
 *
 * @param code - The 6-character session code
 * @returns The session if found, null otherwise
 */
export function findSessionByCode(code: string): GroupSession | null {
  const sessions = getAllSessions();
  const session = sessions.find(s => s.code.toUpperCase() === code.toUpperCase());

  if (!session) return null;
  if (GroupSession.isExpired(session)) return null;

  return session;
}

/**
 * Get a session by ID
 *
 * @param sessionId - The session ID
 * @returns The session if found, null otherwise
 */
export function getSessionById(sessionId: string): GroupSession | null {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

/**
 * Join an existing session
 *
 * @param code - The session code
 * @param participantId - ID of the participant
 * @param participantName - Display name of participant
 * @returns The updated session
 * @throws Error if session not found, full, or started
 */
export function joinSession(
  code: string,
  participantId: string,
  participantName: string
): GroupSession {
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex(s => s.code.toUpperCase() === code.toUpperCase());

  if (sessionIndex === -1) {
    throw new Error('קוד לא נמצא');
  }

  let session = sessions[sessionIndex];

  if (GroupSession.isExpired(session)) {
    throw new Error('הסשן פג תוקף');
  }

  if (GroupSession.isFull(session)) {
    throw new Error('הסשן מלא (4 משתתפים)');
  }

  // Check if already in session
  const existingParticipant = session.participants.find(p => p.id === participantId);
  if (existingParticipant && !existingParticipant.leftSession) {
    throw new Error('כבר הצטרפת לסשן זה');
  }

  // Add participant
  session = GroupSession.addParticipant(session, participantId, participantName);
  sessions[sessionIndex] = session;
  saveSessions(sessions);

  return session;
}

/**
 * Leave a session
 *
 * @param sessionId - The session ID
 * @param participantId - ID of the participant leaving
 * @returns The updated session
 */
export function leaveSession(sessionId: string, participantId: string): GroupSession {
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) {
    throw new Error('Session not found');
  }

  let session = sessions[sessionIndex];
  session = GroupSession.removeParticipant(session, participantId);

  // If creator left, cancel the session
  if (participantId === session.creatorId) {
    session = GroupSession.cancelSession(session);
  }

  sessions[sessionIndex] = session;
  saveSessions(sessions);

  return session;
}

/**
 * Start the workout
 *
 * @param sessionId - The session ID
 * @returns The updated session
 */
export function startWorkout(sessionId: string): GroupSession {
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) {
    throw new Error('Session not found');
  }

  let session = sessions[sessionIndex];
  session = GroupSession.startWorkout(session);

  sessions[sessionIndex] = session;
  saveSessions(sessions);

  return session;
}

/**
 * Mark participant as having completed current exercise
 *
 * @param sessionId - The session ID
 * @param participantId - ID of the participant
 * @param completed - Completion status
 * @returns The updated session
 */
export function setParticipantCompleted(
  sessionId: string,
  participantId: string,
  completed: boolean
): GroupSession {
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) {
    throw new Error('Session not found');
  }

  let session = sessions[sessionIndex];
  session = GroupSession.setParticipantCompleted(session, participantId, completed);

  sessions[sessionIndex] = session;
  saveSessions(sessions);

  return session;
}

/**
 * Move to next exercise
 *
 * Should only be called when all participants have completed current exercise
 *
 * @param sessionId - The session ID
 * @param nextPartIndex - Next part index
 * @param nextComponentIndex - Next component index
 * @returns The updated session
 */
export function moveToNext(
  sessionId: string,
  nextPartIndex: number,
  nextComponentIndex: number
): GroupSession {
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) {
    throw new Error('Session not found');
  }

  let session = sessions[sessionIndex];

  // Verify all participants completed
  if (session.requireAllToComplete && !GroupSession.allParticipantsCompleted(session)) {
    throw new Error('Not all participants have completed');
  }

  session = GroupSession.moveToNext(session, nextPartIndex, nextComponentIndex);

  sessions[sessionIndex] = session;
  saveSessions(sessions);

  return session;
}

/**
 * Complete the workout
 *
 * @param sessionId - The session ID
 * @returns The updated session
 */
export function completeWorkout(sessionId: string): GroupSession {
  const sessions = getAllSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);

  if (sessionIndex === -1) {
    throw new Error('Session not found');
  }

  let session = sessions[sessionIndex];
  session = GroupSession.completeWorkout(session);

  sessions[sessionIndex] = session;
  saveSessions(sessions);

  return session;
}

/**
 * Delete a session
 *
 * @param sessionId - The session ID
 */
export function deleteSession(sessionId: string): void {
  const sessions = getAllSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  saveSessions(filteredSessions);
}

/**
 * Clean up old and expired sessions
 *
 * Removes sessions that are expired or completed more than 24 hours ago
 */
export function cleanupOldSessions(): void {
  const sessions = getAllSessions();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const activeSessions = sessions.filter(session => {
    // Remove expired sessions
    if (GroupSession.isExpired(session)) return false;

    // Remove old completed/cancelled sessions
    if ((session.status === 'completed' || session.status === 'cancelled') && session.endedAt) {
      const endDate = new Date(session.endedAt);
      if (endDate < oneDayAgo) return false;
    }

    return true;
  });

  saveSessions(activeSessions);
}

/**
 * Session Sync Manager
 *
 * Polls for session updates. Use this to keep session state in sync across devices.
 * In a real implementation, this would be replaced with WebSocket or Firebase listeners.
 */
export class SessionSyncManager {
  private intervalId: number | null = null;
  private sessionId: string;
  private onUpdate: (session: GroupSession) => void;

  constructor(sessionId: string, onUpdate: (session: GroupSession) => void) {
    this.sessionId = sessionId;
    this.onUpdate = onUpdate;
  }

  /**
   * Start polling for updates
   */
  start(): void {
    if (this.intervalId !== null) return;

    // Initial update
    this.checkForUpdates();

    // Poll for updates
    this.intervalId = window.setInterval(() => {
      this.checkForUpdates();
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Stop polling for updates
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check for session updates
   */
  private checkForUpdates(): void {
    try {
      const session = getSessionById(this.sessionId);
      if (session) {
        this.onUpdate(session);
      }
    } catch (error) {
      console.error('Error checking for session updates:', error);
    }
  }

  /**
   * Manually trigger an update check
   */
  refresh(): void {
    this.checkForUpdates();
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
export function getUserActiveSessions(userId: string): GroupSession[] {
  const sessions = getAllSessions();
  return sessions.filter(
    session =>
      (session.status === 'waiting' || session.status === 'ready' || session.status === 'in_progress') &&
      session.participants.some(p => p.id === userId && !p.leftSession)
  );
}

// Run cleanup on initialization
cleanupOldSessions();
