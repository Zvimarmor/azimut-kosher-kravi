export interface UserAttributes {
  push_strength: number;
  pull_strength: number;
  cardio_endurance: number;
  running_volume: number;
  rucking_volume: number;
  weight_work: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  age?: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  preferred_language: 'hebrew' | 'english';
  attributes: UserAttributes;
  created_date: string;
  last_active: string;
  unit?: string; // Military unit
  rank?: string; // Military rank
  goals?: string[];
  medical_restrictions?: string[];
}

import { DataService } from '@/lib/services/DataService';

export class User {
  static async me(): Promise<User> {
    return DataService.getCurrentUser();
  }

  static async update(updates: Partial<User>): Promise<User> {
    return DataService.updateUser(updates);
  }

  static async filter(criteria: any, sortBy?: string, limit?: number): Promise<User[]> {
    const user = await this.me();
    return [user];
  }

  static async create(data: Partial<User>): Promise<User> {
    return {
      id: data.id || crypto.randomUUID(),
      name: data.name || '',
      email: data.email,
      age: data.age,
      fitness_level: data.fitness_level || 'beginner',
      preferred_language: data.preferred_language || 'hebrew',
      attributes: data.attributes || {
        push_strength: 5,
        pull_strength: 5,
        cardio_endurance: 5,
        running_volume: 5,
        rucking_volume: 5,
        weight_work: 5
      },
      created_date: data.created_date || new Date().toISOString(),
      last_active: data.last_active || new Date().toISOString(),
      unit: data.unit,
      rank: data.rank,
      goals: data.goals || [],
      medical_restrictions: data.medical_restrictions || []
    };
  }
}

export class UserService {
  static createUser(data: Partial<User>): User {
    return {
      id: data.id || crypto.randomUUID(),
      name: data.name || '',
      email: data.email,
      age: data.age,
      fitness_level: data.fitness_level || 'beginner',
      preferred_language: data.preferred_language || 'hebrew',
      attributes: data.attributes || {
        push_strength: 5,
        pull_strength: 5,
        cardio_endurance: 5,
        running_volume: 5,
        rucking_volume: 5,
        weight_work: 5
      },
      created_date: data.created_date || new Date().toISOString(),
      last_active: data.last_active || new Date().toISOString(),
      unit: data.unit,
      rank: data.rank,
      goals: data.goals || [],
      medical_restrictions: data.medical_restrictions || []
    };
  }

  static updateAttributes(user: User, attributeUpdates: Partial<UserAttributes>): User {
    return {
      ...user,
      attributes: {
        ...user.attributes,
        ...attributeUpdates
      },
      last_active: new Date().toISOString()
    };
  }

  static updateLastActive(user: User): User {
    return {
      ...user,
      last_active: new Date().toISOString()
    };
  }

  static calculateOverallFitness(attributes: UserAttributes): number {
    const values = Object.values(attributes);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static getWeakestAttribute(attributes: UserAttributes): keyof UserAttributes {
    return Object.entries(attributes).reduce((weakest, [key, value]) => 
      value < attributes[weakest as keyof UserAttributes] ? key as keyof UserAttributes : weakest
    , Object.keys(attributes)[0] as keyof UserAttributes);
  }

  static getStrongestAttribute(attributes: UserAttributes): keyof UserAttributes {
    return Object.entries(attributes).reduce((strongest, [key, value]) => 
      value > attributes[strongest as keyof UserAttributes] ? key as keyof UserAttributes : strongest
    , Object.keys(attributes)[0] as keyof UserAttributes);
  }
}