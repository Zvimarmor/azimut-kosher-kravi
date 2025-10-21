export interface WorkoutHistory {
  id: string;
  userId: string; // Make workouts private per user
  workout_title: string;
  duration_completed: number; // in minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  feeling: 'great' | 'good' | 'okay' | 'tired';
  completion_date: string; // ISO date string
  exercises_completed: string[];
  notes?: string;
  rating?: number; // 1-5 stars
}

import { DataService } from '../lib/services/DataService';

export interface WorkoutHistoryFilterCriteria {
  created_by?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
  feeling?: 'great' | 'good' | 'okay' | 'tired';
  minRating?: number;
  maxRating?: number;
}

export class WorkoutHistory {
  static async filter(criteria: WorkoutHistoryFilterCriteria, sortBy?: string, limit?: number): Promise<WorkoutHistory[]> {
    if (criteria.created_by) {
      return DataService.getWorkoutHistory(criteria.created_by);
    }
    return [];
  }

  static async create(data: Omit<WorkoutHistory, 'id'>): Promise<WorkoutHistory> {
    return DataService.addWorkoutHistory(data);
  }

  static async delete(id: string): Promise<void> {
    return DataService.deleteWorkoutHistory(id);
  }
}

export class WorkoutHistoryService {
  private static readonly MAX_HISTORY_PER_USER = 25;

  static createWorkoutHistory(data: Partial<WorkoutHistory>): WorkoutHistory {
    return {
      id: data.id || crypto.randomUUID(),
      userId: data.userId || '',
      workout_title: data.workout_title || '',
      duration_completed: data.duration_completed || 0,
      difficulty: data.difficulty || 'moderate',
      feeling: data.feeling || 'okay',
      completion_date: data.completion_date || new Date().toISOString(),
      exercises_completed: data.exercises_completed || [],
      notes: data.notes,
      rating: data.rating
    };
  }

  static getUserWorkouts(allWorkouts: WorkoutHistory[], userId: string): WorkoutHistory[] {
    return allWorkouts
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())
      .slice(0, this.MAX_HISTORY_PER_USER); // Limit to 25 most recent
  }

  static addWorkout(allWorkouts: WorkoutHistory[], newWorkout: WorkoutHistory): WorkoutHistory[] {
    const userWorkouts = this.getUserWorkouts(allWorkouts, newWorkout.userId);
    const otherWorkouts = allWorkouts.filter(w => w.userId !== newWorkout.userId);
    
    // Add new workout and keep only the 25 most recent for this user
    const updatedUserWorkouts = [newWorkout, ...userWorkouts].slice(0, this.MAX_HISTORY_PER_USER);
    
    return [...otherWorkouts, ...updatedUserWorkouts];
  }

  static getWorkoutStats(workouts: WorkoutHistory[]): {
    totalWorkouts: number;
    totalMinutes: number;
    averageRating: number;
    mostCommonDifficulty: string;
  } {
    if (workouts.length === 0) {
      return { totalWorkouts: 0, totalMinutes: 0, averageRating: 0, mostCommonDifficulty: 'moderate' };
    }

    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration_completed, 0);
    const ratingsWithValues = workouts.filter(w => w.rating !== undefined);
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, w) => sum + (w.rating || 0), 0) / ratingsWithValues.length 
      : 0;

    const difficultyCount = workouts.reduce((acc, w) => {
      acc[w.difficulty] = (acc[w.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonDifficulty = Object.entries(difficultyCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'moderate';

    return {
      totalWorkouts: workouts.length,
      totalMinutes,
      averageRating,
      mostCommonDifficulty
    };
  }
}