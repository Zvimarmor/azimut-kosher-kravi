/**
 * Firebase Group Training Service
 *
 * Manages group workout sessions in Firestore with real-time synchronization.
 * Supports up to 4 participants training together across multiple devices.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { GroupSession } from '../../Entities/GroupSession';

const SESSIONS_COLLECTION = 'group_training_sessions';

/**
 * Firestore representation of a GroupSession
 */
interface FirestoreGroupSession extends Omit<GroupSession, 'createdAt' | 'startedAt' | 'endedAt'> {
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
}

/**
 * Error messages in Hebrew and English
 */
const ErrorMessages = {
  invalidCode: {
    hebrew: 'קוד לא תקין - חייב להיות 8 תווים',
    english: 'Invalid code - must be 8 characters'
  },
  codeNotFound: {
    hebrew: 'קוד לא נמצא',
    english: 'Code not found'
  },
  sessionExpired: {
    hebrew: 'הסשן פג תוקף',
    english: 'Session has expired'
  },
  sessionFull: {
    hebrew: 'הסשן מלא (4 משתתפים)',
    english: 'Session is full (4 participants)'
  },
  alreadyJoined: {
    hebrew: 'כבר הצטרפת לסשן זה',
    english: 'You have already joined this session'
  },
  sessionNotFound: {
    hebrew: 'סשן לא נמצא',
    english: 'Session not found'
  },
  notAllCompleted: {
    hebrew: 'לא כל המשתתפים סיימו',
    english: 'Not all participants have completed'
  }
};

/**
 * Get error message based on language
 */
function getErrorMessage(key: keyof typeof ErrorMessages, language: 'hebrew' | 'english' = 'hebrew'): string {
  return ErrorMessages[key][language];
}

/**
 * Convert GroupSession to Firestore format
 */
function toFirestore(session: GroupSession): FirestoreGroupSession {
  return {
    ...session,
    createdAt: Timestamp.fromDate(new Date(session.createdAt)),
    startedAt: session.startedAt ? Timestamp.fromDate(new Date(session.startedAt)) : undefined,
    endedAt: session.endedAt ? Timestamp.fromDate(new Date(session.endedAt)) : undefined
  };
}

/**
 * Convert Firestore format to GroupSession
 */
function fromFirestore(data: FirestoreGroupSession): GroupSession {
  return {
    ...data,
    createdAt: data.createdAt.toDate().toISOString(),
    startedAt: data.startedAt ? data.startedAt.toDate().toISOString() : undefined,
    endedAt: data.endedAt ? data.endedAt.toDate().toISOString() : undefined
  };
}

/**
 * Create a new group training session
 */
export async function createSession(
  creatorId: string,
  creatorName: string,
  workoutTitle: string,
  workoutId?: string
): Promise<GroupSession> {
  const newSession = GroupSession.create(creatorId, creatorName, workoutTitle, workoutId);
  const sessionRef = doc(db, SESSIONS_COLLECTION, newSession.id);

  await setDoc(sessionRef, toFirestore(newSession));

  return newSession;
}

/**
 * Find a session by its code
 */
export async function findSessionByCode(code: string, language: 'hebrew' | 'english' = 'hebrew'): Promise<GroupSession | null> {
  const sanitizedCode = GroupSession.sanitizeCode(code);
  if (!GroupSession.isValidCodeFormat(sanitizedCode)) {
    return null;
  }

  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('code', '==', sanitizedCode.toUpperCase())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data() as FirestoreGroupSession;
  const session = fromFirestore(data);

  if (GroupSession.isExpired(session)) {
    // Clean up expired session
    await deleteDoc(snapshot.docs[0].ref);
    return null;
  }

  return session;
}

/**
 * Get a session by ID
 */
export async function getSessionById(sessionId: string): Promise<GroupSession | null> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as FirestoreGroupSession;
  return fromFirestore(data);
}

/**
 * Join an existing session
 */
export async function joinSession(
  code: string,
  participantId: string,
  participantName: string,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  const sanitizedCode = GroupSession.sanitizeCode(code);
  if (!GroupSession.isValidCodeFormat(sanitizedCode)) {
    throw new Error(getErrorMessage('invalidCode', language));
  }

  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('code', '==', sanitizedCode.toUpperCase())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(getErrorMessage('codeNotFound', language));
  }

  const sessionDoc = snapshot.docs[0];
  const data = sessionDoc.data() as FirestoreGroupSession;
  let session = fromFirestore(data);

  if (GroupSession.isExpired(session)) {
    await deleteDoc(sessionDoc.ref);
    throw new Error(getErrorMessage('sessionExpired', language));
  }

  if (GroupSession.isFull(session)) {
    throw new Error(getErrorMessage('sessionFull', language));
  }

  // Check if already in session
  const existingParticipant = session.participants.find(p => p.id === participantId);
  if (existingParticipant && !existingParticipant.leftSession) {
    throw new Error(getErrorMessage('alreadyJoined', language));
  }

  // Add participant
  session = GroupSession.addParticipant(session, participantId, participantName);

  await updateDoc(sessionDoc.ref, {
    participants: session.participants,
    status: session.status
  });

  return session;
}

/**
 * Leave a session
 */
export async function leaveSession(sessionId: string, participantId: string, language: 'hebrew' | 'english' = 'hebrew'): Promise<GroupSession> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) {
    throw new Error(getErrorMessage('sessionNotFound', language));
  }

  const data = snapshot.data() as FirestoreGroupSession;
  let session = fromFirestore(data);

  session = GroupSession.removeParticipant(session, participantId);

  // If creator left, cancel the session
  if (participantId === session.creatorId) {
    session = GroupSession.cancelSession(session);
  }

  await updateDoc(sessionRef, {
    participants: session.participants,
    status: session.status,
    endedAt: session.endedAt ? Timestamp.fromDate(new Date(session.endedAt)) : undefined
  });

  return session;
}

/**
 * Start the workout
 */
export async function startWorkout(sessionId: string, language: 'hebrew' | 'english' = 'hebrew'): Promise<GroupSession> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) {
    throw new Error(getErrorMessage('sessionNotFound', language));
  }

  const data = snapshot.data() as FirestoreGroupSession;
  let session = fromFirestore(data);

  session = GroupSession.startWorkout(session);

  await updateDoc(sessionRef, {
    status: session.status,
    startedAt: session.startedAt ? Timestamp.fromDate(new Date(session.startedAt)) : undefined
  });

  return session;
}

/**
 * Mark participant as having completed current exercise
 */
export async function setParticipantCompleted(
  sessionId: string,
  participantId: string,
  completed: boolean,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) {
    throw new Error(getErrorMessage('sessionNotFound', language));
  }

  const data = snapshot.data() as FirestoreGroupSession;
  let session = fromFirestore(data);

  session = GroupSession.setParticipantCompleted(session, participantId, completed);

  await updateDoc(sessionRef, {
    participants: session.participants
  });

  return session;
}

/**
 * Move to next exercise
 */
export async function moveToNext(
  sessionId: string,
  nextPartIndex: number,
  nextComponentIndex: number,
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<GroupSession> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) {
    throw new Error(getErrorMessage('sessionNotFound', language));
  }

  const data = snapshot.data() as FirestoreGroupSession;
  let session = fromFirestore(data);

  // Verify all participants completed
  if (session.requireAllToComplete && !GroupSession.allParticipantsCompleted(session)) {
    throw new Error(getErrorMessage('notAllCompleted', language));
  }

  session = GroupSession.moveToNext(session, nextPartIndex, nextComponentIndex);

  await updateDoc(sessionRef, {
    currentPartIndex: session.currentPartIndex,
    currentComponentIndex: session.currentComponentIndex,
    participants: session.participants
  });

  return session;
}

/**
 * Complete the workout
 */
export async function completeWorkout(sessionId: string, language: 'hebrew' | 'english' = 'hebrew'): Promise<GroupSession> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) {
    throw new Error(getErrorMessage('sessionNotFound', language));
  }

  const data = snapshot.data() as FirestoreGroupSession;
  let session = fromFirestore(data);

  session = GroupSession.completeWorkout(session);

  await updateDoc(sessionRef, {
    status: session.status,
    endedAt: session.endedAt ? Timestamp.fromDate(new Date(session.endedAt)) : undefined
  });

  return session;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await deleteDoc(sessionRef);
}

/**
 * Get user's active sessions
 */
export async function getUserActiveSessions(userId: string): Promise<GroupSession[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('status', 'in', ['waiting', 'ready', 'in_progress'])
  );

  const snapshot = await getDocs(q);

  const sessions: GroupSession[] = [];

  snapshot.forEach(doc => {
    const data = doc.data() as FirestoreGroupSession;
    const session = fromFirestore(data);

    // Check if user is a participant and hasn't left
    const isParticipant = session.participants.some(
      p => p.id === userId && !p.leftSession
    );

    if (isParticipant && !GroupSession.isExpired(session)) {
      sessions.push(session);
    }
  });

  return sessions;
}

/**
 * Clean up old and expired sessions
 */
export async function cleanupOldSessions(): Promise<void> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const snapshot = await getDocs(collection(db, SESSIONS_COLLECTION));
  const batch = writeBatch(db);
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data() as FirestoreGroupSession;
    const session = fromFirestore(data);

    // Remove expired sessions
    if (GroupSession.isExpired(session)) {
      batch.delete(doc.ref);
      count++;
      return;
    }

    // Remove old completed/cancelled sessions
    if ((session.status === 'completed' || session.status === 'cancelled') && session.endedAt) {
      const endDate = new Date(session.endedAt);
      if (endDate < oneDayAgo) {
        batch.delete(doc.ref);
        count++;
      }
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Cleaned up ${count} old group training sessions`);
  }
}

/**
 * Subscribe to session updates in real-time
 *
 * @param sessionId - The session ID to watch
 * @param onUpdate - Callback when session updates
 * @param onError - Callback when error occurs
 * @returns Unsubscribe function
 */
export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: GroupSession | null) => void,
  onError?: (error: Error) => void
): () => void {
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);

  return onSnapshot(
    sessionRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }

      const data = snapshot.data() as FirestoreGroupSession;
      const session = fromFirestore(data);
      onUpdate(session);
    },
    (error) => {
      console.error('Session subscription error:', error);
      if (onError) onError(error);
    }
  );
}
