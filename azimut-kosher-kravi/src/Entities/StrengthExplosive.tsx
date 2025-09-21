import { AttributeType } from './Warmup';

export interface StrengthExplosive {
  title: string;
  target_attributes: AttributeType[];
  sets: number;
  reps: number | string; // Can be "AMRAP" or specific number
  rest_between_sets: number; // in seconds
  instructions: string;
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  video_url?: string;
  progression_notes?: string;
}

export class StrengthExplosiveService {
  static createExercise(data: Partial<StrengthExplosive>): StrengthExplosive {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || [],
      sets: data.sets || 3,
      reps: data.reps || 10,
      rest_between_sets: data.rest_between_sets || 60,
      instructions: data.instructions || '',
      equipment: data.equipment || [],
      difficulty: data.difficulty || 'beginner',
      video_url: data.video_url,
      progression_notes: data.progression_notes
    };
  }

  static getExercisesByAttribute(exercises: StrengthExplosive[], attribute: AttributeType): StrengthExplosive[] {
    return exercises.filter(exercise => exercise.target_attributes.includes(attribute));
  }

  static calculateTotalTime(exercise: StrengthExplosive, repDuration: number = 3): number {
    const workTime = typeof exercise.reps === 'number' ? exercise.reps * repDuration : 30; // Default 30s for AMRAP
    const restTime = exercise.rest_between_sets * (exercise.sets - 1);
    const setTime = workTime * exercise.sets;
    return setTime + restTime;
  }
}