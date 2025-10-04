import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { WorkoutHistory } from '../../../Entities/WorkoutHistory';

const WORKOUT_HISTORY_COLLECTION = 'workoutHistory';
const MAX_HISTORY_PER_USER = 25;

// Get user's workout history collection reference
const getUserWorkoutCollection = (userId: string) => {
  return collection(db, 'users', userId, WORKOUT_HISTORY_COLLECTION);
};

// Get all workout history for a user
export const getWorkoutHistory = async (userId: string): Promise<WorkoutHistory[]> => {
  const workoutRef = getUserWorkoutCollection(userId);
  const q = query(workoutRef, orderBy('completion_date', 'desc'), limit(MAX_HISTORY_PER_USER));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      completion_date: data.completion_date instanceof Timestamp
        ? data.completion_date.toDate().toISOString()
        : data.completion_date
    } as WorkoutHistory;
  });
};

// Add a workout to history
export const addWorkoutHistory = async (userId: string, workout: Omit<WorkoutHistory, 'id'>): Promise<WorkoutHistory> => {
  // Generate ID
  const id = crypto.randomUUID();
  const workoutRef = doc(getUserWorkoutCollection(userId), id);

  const workoutData = {
    ...workout,
    userId,
    completion_date: workout.completion_date || new Date().toISOString()
  };

  await setDoc(workoutRef, workoutData);

  // Check if we need to delete old entries
  const allWorkouts = await getWorkoutHistory(userId);
  if (allWorkouts.length > MAX_HISTORY_PER_USER) {
    // Delete the oldest entries
    const toDelete = allWorkouts.slice(MAX_HISTORY_PER_USER);
    await Promise.all(toDelete.map(w => deleteWorkoutHistory(userId, w.id)));
  }

  return {
    ...workoutData,
    id
  } as WorkoutHistory;
};

// Delete a workout from history
export const deleteWorkoutHistory = async (userId: string, workoutId: string): Promise<void> => {
  const workoutRef = doc(getUserWorkoutCollection(userId), workoutId);
  await deleteDoc(workoutRef);
};
