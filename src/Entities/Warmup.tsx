import { DataService } from '../lib/services/DataService';

export type AttributeType = 'push_strength' | 'pull_strength' | 'cardio_endurance' | 'running_volume' | 'rucking_volume' | 'weight_work';

export interface Warmup {
  id?: string;
  title: string;
  target_attributes: AttributeType[];
  duration: number;
  instructions: string;
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  video_url?: string;
  category?: string;
  exercises?: Array<{
    name: string;
    type: string;
    values: number[] | { [key: string]: number | null };
    rest_seconds?: number;
  }>;
  rounds?: number;
}

export class Warmup {
  static async list(): Promise<Warmup[]> {
    return DataService.getWarmups();
  }

  static async filter(criteria: any, sortBy?: string, limit?: number): Promise<Warmup[]> {
    const warmups = await this.list();
    return warmups;
  }

  static async create(data: Partial<Warmup>): Promise<Warmup> {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || [],
      duration: data.duration || 5,
      instructions: data.instructions || '',
      equipment: data.equipment || [],
      difficulty: data.difficulty || 'beginner',
      video_url: data.video_url,
      category: data.category || 'Warmup',
      exercises: data.exercises || [],
      rounds: data.rounds || 1
    };
  }

  static getWarmupsByAttribute(warmups: Warmup[], attribute: AttributeType): Warmup[] {
    return warmups.filter(warmup => warmup.target_attributes.includes(attribute));
  }

  static getWarmupsByDifficulty(warmups: Warmup[], difficulty: 'beginner' | 'intermediate' | 'advanced'): Warmup[] {
    return warmups.filter(warmup => warmup.difficulty === difficulty);
  }
}