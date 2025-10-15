import { AttributeType } from './Warmup';
import { DataService } from '../lib/services/DataService';

export interface Exercise {
  id: string;
  name: string;
  nameEnglish: string;
  category: 'warmup' | 'strength' | 'cardio' | 'special';
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Descriptive content
  description: string;
  descriptionEnglish: string;
  formTips: string[];
  formTipsEnglish: string[];
  commonMistakes: string[];

  // Media
  thumbnailUrl: string;
  images: string[]; // Array of image URLs
  videoUrl?: string; // YouTube URL or local path
  videoType?: 'youtube' | 'local';

  // Metadata
  targetMuscles: string[];
  equipment: string[];
  targetAttributes: AttributeType[];

  // Related content
  relatedExercises?: string[]; // IDs of related exercises
  progressions?: string[]; // IDs of easier/harder variations
}

export class Exercise {
  static async list(): Promise<Exercise[]> {
    return DataService.getExercises();
  }

  static async getById(id: string): Promise<Exercise | null> {
    return DataService.getExerciseById(id);
  }

  static async getByCategory(category: string): Promise<Exercise[]> {
    return DataService.getExercisesByCategory(category);
  }

  static async search(query: string): Promise<Exercise[]> {
    const exercises = await this.list();
    const lowerQuery = query.toLowerCase();
    return exercises.filter(ex =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.nameEnglish.toLowerCase().includes(lowerQuery) ||
      ex.description.toLowerCase().includes(lowerQuery)
    );
  }
}
