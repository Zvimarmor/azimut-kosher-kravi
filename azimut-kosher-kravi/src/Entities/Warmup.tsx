export type AttributeType = 'push_strength' | 'pull_strength' | 'cardio_endurance' | 'running_volume' | 'rucking_volume' | 'weight_work';

export interface Warmup {
  title: string;
  target_attributes: AttributeType[];
  duration: number;
  instructions: string;
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  video_url?: string;
}

export class WarmupService {
  static createWarmup(data: Partial<Warmup>): Warmup {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || [],
      duration: data.duration || 5,
      instructions: data.instructions || '',
      equipment: data.equipment || [],
      difficulty: data.difficulty || 'beginner',
      video_url: data.video_url
    };
  }

  static getWarmupsByAttribute(warmups: Warmup[], attribute: AttributeType): Warmup[] {
    return warmups.filter(warmup => warmup.target_attributes.includes(attribute));
  }

  static getWarmupsByDifficulty(warmups: Warmup[], difficulty: 'beginner' | 'intermediate' | 'advanced'): Warmup[] {
    return warmups.filter(warmup => warmup.difficulty === difficulty);
  }
}