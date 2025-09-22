import { AttributeType } from './Warmup';
import { DataService } from '../services/DataService';

export interface RunningEndurance {
  title: string;
  target_attributes: AttributeType[];
  distance?: number; // in meters
  duration?: number; // in minutes
  intensity: 'low' | 'moderate' | 'high' | 'variable';
  pace?: string; // e.g., "6:00/km"
  instructions: string;
  terrain?: 'road' | 'track' | 'trail' | 'treadmill';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  warmup_required: boolean;
  cooldown_required: boolean;
}

export class RunningEndurance {
  static async list(): Promise<RunningEndurance[]> {
    return DataService.getRunningEndurance();
  }

  static async filter(criteria: any, sortBy?: string, limit?: number): Promise<RunningEndurance[]> {
    const runs = await this.list();
    return runs;
  }

  static async create(data: Partial<RunningEndurance>): Promise<RunningEndurance> {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || ['cardio_endurance'],
      distance: data.distance,
      duration: data.duration,
      intensity: data.intensity || 'moderate',
      pace: data.pace,
      instructions: data.instructions || '',
      terrain: data.terrain || 'road',
      difficulty: data.difficulty || 'beginner',
      warmup_required: data.warmup_required ?? true,
      cooldown_required: data.cooldown_required ?? true
    };
  }
}

export class RunningEnduranceService {
  static createRun(data: Partial<RunningEndurance>): RunningEndurance {
    return {
      title: data.title || '',
      target_attributes: data.target_attributes || ['cardio_endurance'],
      distance: data.distance,
      duration: data.duration,
      intensity: data.intensity || 'moderate',
      pace: data.pace,
      instructions: data.instructions || '',
      terrain: data.terrain || 'road',
      difficulty: data.difficulty || 'beginner',
      warmup_required: data.warmup_required ?? true,
      cooldown_required: data.cooldown_required ?? true
    };
  }

  static calculatePace(distance: number, duration: number): string {
    // Calculate pace in min/km
    const paceMinutes = duration / (distance / 1000);
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }

  static getRunsByIntensity(runs: RunningEndurance[], intensity: 'low' | 'moderate' | 'high' | 'variable'): RunningEndurance[] {
    return runs.filter(run => run.intensity === intensity);
  }
}