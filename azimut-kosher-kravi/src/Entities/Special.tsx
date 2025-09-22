import { AttributeType } from './Warmup';
import { DataService } from '../services/DataService';

export interface Special {
  title: string;
  target_attributes: AttributeType[];
  category: 'military_skills' | 'tactical' | 'endurance_challenge' | 'team_building' | 'assessment';
  duration: number; // in minutes
  instructions: string;
  equipment?: string[];
  min_participants?: number;
  max_participants?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  location_requirements?: string;
  safety_notes?: string;
  scoring_method?: string;
  exercises?: Array<{
    name: string;
    type: string;
    values: number[];
    rest_seconds?: number;
  }>;
  rounds?: number;
}

export class Special {
  static async list(): Promise<Special[]> {
    return DataService.getSpecial();
  }

  static async filter(criteria: any, sortBy?: string, limit?: number): Promise<Special[]> {
    const specials = await this.list();
    return specials;
  }

  static async create(data: Partial<Special>): Promise<Special> {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || [],
      category: data.category || 'military_skills',
      duration: data.duration || 30,
      instructions: data.instructions || '',
      equipment: data.equipment || [],
      min_participants: data.min_participants,
      max_participants: data.max_participants,
      difficulty: data.difficulty || 'intermediate',
      location_requirements: data.location_requirements,
      safety_notes: data.safety_notes,
      scoring_method: data.scoring_method
    };
  }
}

export class SpecialService {
  static createSpecial(data: Partial<Special>): Special {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || [],
      category: data.category || 'military_skills',
      duration: data.duration || 30,
      instructions: data.instructions || '',
      equipment: data.equipment || [],
      min_participants: data.min_participants,
      max_participants: data.max_participants,
      difficulty: data.difficulty || 'intermediate',
      location_requirements: data.location_requirements,
      safety_notes: data.safety_notes,
      scoring_method: data.scoring_method
    };
  }

  static getSpecialsByCategory(specials: Special[], category: Special['category']): Special[] {
    return specials.filter(special => special.category === category);
  }

  static getSpecialsByParticipantCount(specials: Special[], participantCount: number): Special[] {
    return specials.filter(special => {
      const minOk = !special.min_participants || participantCount >= special.min_participants;
      const maxOk = !special.max_participants || participantCount <= special.max_participants;
      return minOk && maxOk;
    });
  }

  static getAssessmentExercises(specials: Special[]): Special[] {
    return specials.filter(special => special.category === 'assessment');
  }
}