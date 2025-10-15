/**
 * Group Training Session Entity
 *
 * Enables multi-device workout sessions where up to 4 users can train together
 * and progress through exercises synchronously.
 */

export interface Participant {
  id: string; // User ID or device ID
  name: string; // Display name
  joinedAt: string; // ISO timestamp
  isReady: boolean; // Ready to start workout
  currentExerciseCompleted: boolean; // Completed current exercise
  leftSession: boolean; // Has left the session
}

export interface GroupSession {
  // Session identification
  id: string; // Unique session ID
  code: string; // 8-character alphanumeric code for joining

  // Session metadata
  createdAt: string; // ISO timestamp
  startedAt?: string; // When workout actually started
  endedAt?: string; // When workout finished
  expiresAt: string; // When session code expires

  // Creator information
  creatorId: string;
  creatorName: string;

  // Participants (max 4)
  participants: Participant[];
  maxParticipants: number; // Default: 4

  // Workout information
  workoutId?: string; // ID of the workout being done
  workoutTitle: string;

  // Current progress
  currentPartIndex: number; // Current workout part
  currentComponentIndex: number; // Current exercise/component

  // Session status
  status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'cancelled';

  // Settings
  requireAllToComplete: boolean; // If true, all must complete before moving on (default: true)
  allowLateJoin: boolean; // Can people join after workout starts? (default: false)
}

export class GroupSession {
  /**
   * Validate a session code format
   *
   * @param code - The code to validate
   * @returns true if code is valid format, false otherwise
   */
  static isValidCodeFormat(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }

    // Must be exactly 8 characters
    if (code.length !== 8) {
      return false;
    }

    // Must contain only allowed characters
    const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
    return validChars.test(code.toUpperCase());
  }

  /**
   * Sanitize a session code input
   *
   * @param code - Raw input code
   * @returns Sanitized code or empty string if invalid
   */
  static sanitizeCode(code: string): string {
    if (!code || typeof code !== 'string') {
      return '';
    }

    // Convert to uppercase and remove any invalid characters
    const sanitized = code.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '');

    // Limit to 8 characters
    return sanitized.slice(0, 8);
  }

  /**
   * Generate a cryptographically secure 8-character session code
   * Uses Web Crypto API for secure random generation
   *
   * @returns 8-character alphanumeric code (uppercase)
   */
  static generateSessionCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0, O, I, 1
    const array = new Uint8Array(8); // Increased from 6 to 8 for better security
    crypto.getRandomValues(array);

    return Array.from(array, byte =>
      characters[byte % characters.length]
    ).join('');
  }

  /**
   * Create a new group training session
   *
   * @param creatorId - ID of the user creating the session
   * @param creatorName - Display name of creator
   * @param workoutTitle - Title of the workout
   * @param workoutId - Optional workout ID
   * @returns New group session
   */
  static create(
    creatorId: string,
    creatorName: string,
    workoutTitle: string,
    workoutId?: string
  ): GroupSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    return {
      id: crypto.randomUUID(),
      code: GroupSession.generateSessionCode(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      creatorId,
      creatorName,
      participants: [
        {
          id: creatorId,
          name: creatorName,
          joinedAt: now.toISOString(),
          isReady: true,
          currentExerciseCompleted: false,
          leftSession: false,
        },
      ],
      maxParticipants: 4,
      workoutId,
      workoutTitle,
      currentPartIndex: 0,
      currentComponentIndex: 0,
      status: 'waiting',
      requireAllToComplete: true,
      allowLateJoin: false,
    };
  }

  /**
   * Check if a session is full
   *
   * @param session - The session to check
   * @returns True if session has max participants
   */
  static isFull(session: GroupSession): boolean {
    const activeParticipants = session.participants.filter(p => !p.leftSession);
    return activeParticipants.length >= session.maxParticipants;
  }

  /**
   * Check if a session is expired
   *
   * @param session - The session to check
   * @returns True if session has expired
   */
  static isExpired(session: GroupSession): boolean {
    return new Date() > new Date(session.expiresAt);
  }

  /**
   * Check if all participants have completed the current exercise
   *
   * @param session - The session to check
   * @returns True if all active participants completed current exercise
   */
  static allParticipantsCompleted(session: GroupSession): boolean {
    const activeParticipants = session.participants.filter(p => !p.leftSession);
    return activeParticipants.every(p => p.currentExerciseCompleted);
  }

  /**
   * Add a participant to the session
   *
   * @param session - The session
   * @param participantId - ID of participant
   * @param participantName - Name of participant
   * @returns Updated session
   */
  static addParticipant(
    session: GroupSession,
    participantId: string,
    participantName: string
  ): GroupSession {
    if (GroupSession.isFull(session)) {
      throw new Error('Session is full');
    }

    if (session.status === 'in_progress' && !session.allowLateJoin) {
      throw new Error('Session has already started');
    }

    const newParticipant: Participant = {
      id: participantId,
      name: participantName,
      joinedAt: new Date().toISOString(),
      isReady: false,
      currentExerciseCompleted: false,
      leftSession: false,
    };

    return {
      ...session,
      participants: [...session.participants, newParticipant],
    };
  }

  /**
   * Remove a participant from the session
   *
   * @param session - The session
   * @param participantId - ID of participant to remove
   * @returns Updated session
   */
  static removeParticipant(
    session: GroupSession,
    participantId: string
  ): GroupSession {
    return {
      ...session,
      participants: session.participants.map(p =>
        p.id === participantId ? { ...p, leftSession: true } : p
      ),
    };
  }

  /**
   * Mark participant as ready
   *
   * @param session - The session
   * @param participantId - ID of participant
   * @returns Updated session
   */
  static setParticipantReady(
    session: GroupSession,
    participantId: string,
    ready: boolean
  ): GroupSession {
    return {
      ...session,
      participants: session.participants.map(p =>
        p.id === participantId ? { ...p, isReady: ready } : p
      ),
    };
  }

  /**
   * Mark participant as having completed current exercise
   *
   * @param session - The session
   * @param participantId - ID of participant
   * @returns Updated session
   */
  static setParticipantCompleted(
    session: GroupSession,
    participantId: string,
    completed: boolean
  ): GroupSession {
    return {
      ...session,
      participants: session.participants.map(p =>
        p.id === participantId ? { ...p, currentExerciseCompleted: completed } : p
      ),
    };
  }

  /**
   * Start the workout session
   *
   * @param session - The session
   * @returns Updated session
   */
  static startWorkout(session: GroupSession): GroupSession {
    return {
      ...session,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
  }

  /**
   * Move to next exercise/component
   *
   * Resets all participants' completion status
   *
   * @param session - The session
   * @param nextPartIndex - Next part index
   * @param nextComponentIndex - Next component index
   * @returns Updated session
   */
  static moveToNext(
    session: GroupSession,
    nextPartIndex: number,
    nextComponentIndex: number
  ): GroupSession {
    return {
      ...session,
      currentPartIndex: nextPartIndex,
      currentComponentIndex: nextComponentIndex,
      participants: session.participants.map(p => ({
        ...p,
        currentExerciseCompleted: false,
      })),
    };
  }

  /**
   * Complete the workout session
   *
   * @param session - The session
   * @returns Updated session
   */
  static completeWorkout(session: GroupSession): GroupSession {
    return {
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString(),
    };
  }

  /**
   * Cancel the session
   *
   * @param session - The session
   * @returns Updated session
   */
  static cancelSession(session: GroupSession): GroupSession {
    return {
      ...session,
      status: 'cancelled',
      endedAt: new Date().toISOString(),
    };
  }

  /**
   * Get active participants count
   *
   * @param session - The session
   * @returns Number of active participants
   */
  static getActiveParticipantsCount(session: GroupSession): number {
    return session.participants.filter(p => !p.leftSession).length;
  }

  /**
   * Get completion status summary
   *
   * @param session - The session
   * @returns Object with completed and total counts
   */
  static getCompletionStatus(session: GroupSession): {
    completed: number;
    total: number;
  } {
    const activeParticipants = session.participants.filter(p => !p.leftSession);
    const completed = activeParticipants.filter(p => p.currentExerciseCompleted).length;

    return {
      completed,
      total: activeParticipants.length,
    };
  }
}
