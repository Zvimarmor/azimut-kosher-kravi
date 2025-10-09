import { User, UserAttributes } from '../../Entities/User';
import { Warmup } from '../../Entities/Warmup';
import { RunningEndurance } from '../../Entities/RunningEndurance';
import { StrengthExplosive } from '../../Entities/StrengthExplosive';
import { Special } from '../../Entities/Special';

/**
 * Component Types - Each exercise within a part
 */
export type ComponentType =
  | 'strength_exercise'     // Push-ups, squats, etc.
  | 'cardio_exercise'       // Running, burpees, etc.
  | 'warmup_exercise'       // Dynamic stretches, mobility
  | 'special_exercise'      // Tactical drills, skills
  | 'rest';                 // Rest periods

/**
 * A single workout component (one exercise or rest period)
 */
export interface WorkoutComponent {
  id: string;
  type: ComponentType;
  name: string;
  description?: string;

  // Exercise parameters (personalized to user level)
  reps?: number;
  sets?: number;
  duration?: number;        // seconds
  distance?: number;        // meters

  // Rest period after this component
  restAfter?: number;       // seconds

  // GPS tracking requirement
  requiresGPS?: boolean;

  // Display metadata
  instructions?: string;
  tips?: string;
}

/**
 * Part Types - Major sections of a workout
 */
export type PartType = 'warmup' | 'cardio' | 'strength' | 'special';

/**
 * A workout part (collection of components)
 */
export interface WorkoutPart {
  id: string;
  type: PartType;
  name: string;
  description?: string;
  components: WorkoutComponent[];

  // Part-level settings
  defaultRestBetweenComponents?: number;  // seconds
  requiresGPS?: boolean;
}

/**
 * Workout Types
 */
export type WorkoutType = 'classic' | 'special' | 'short';

/**
 * Complete workout structure
 */
export interface ComposedWorkout {
  id: string;
  type: WorkoutType;
  title: string;
  description?: string;
  parts: WorkoutPart[];

  // Metadata
  estimatedDuration: number;  // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  targetAttributes: string[];
}

/**
 * Workout Composition Service
 * Handles the assembly and personalization of workouts
 */
export class WorkoutCompositionService {

  /**
   * Creates a classic workout: Warmup + Cardio + Strength
   */
  static async createClassicWorkout(
    warmupSource?: Warmup,
    cardioSource?: RunningEndurance,
    strengthSource?: StrengthExplosive,
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    // Get or generate workout sources
    const warmup = warmupSource || await this.getRandomWarmup();
    const cardio = cardioSource || await this.getRandomCardio();
    const strength = strengthSource || await this.getRandomStrength();

    // Create parts
    const warmupPart = this.createWarmupPart(warmup, avgLevel, user);
    const cardioPart = this.createCardioPart(cardio, avgLevel, user);
    const strengthPart = this.createStrengthPart(strength, avgLevel, user);

    return {
      id: crypto.randomUUID(),
      type: 'classic',
      title: `אימון מלא: ${warmup.title} + ${cardio.title} + ${strength.title}`,
      description: 'אימון מלא עם חימום, קרדיו וכוח',
      parts: [warmupPart, cardioPart, strengthPart],
      estimatedDuration: this.calculateTotalDuration([warmupPart, cardioPart, strengthPart]),
      difficulty: this.determineDifficulty([warmup.difficulty, cardio.difficulty, strength.difficulty]),
      targetAttributes: [...new Set([...warmup.target_attributes, ...cardio.target_attributes, ...strength.target_attributes])]
    };
  }

  /**
   * Creates a special workout: Warmup + Special
   */
  static async createSpecialWorkout(
    warmupSource?: Warmup,
    specialSource?: Special,
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    const warmup = warmupSource || await this.getRandomWarmup();
    const special = specialSource || await this.getRandomSpecial();

    const warmupPart = this.createWarmupPart(warmup, avgLevel, user);
    const specialPart = this.createSpecialPart(special, avgLevel, user);

    return {
      id: crypto.randomUUID(),
      type: 'special',
      title: `אימון מיוחד: ${special.title}`,
      description: special.instructions,
      parts: [warmupPart, specialPart],
      estimatedDuration: this.calculateTotalDuration([warmupPart, specialPart]),
      difficulty: special.difficulty,
      targetAttributes: [...new Set([...warmup.target_attributes, ...special.target_attributes])]
    };
  }

  /**
   * Creates a short workout: Single main part only
   */
  static async createShortWorkout(
    source: StrengthExplosive | RunningEndurance | Special,
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    let mainPart: WorkoutPart;
    let workoutTitle: string;

    if ('distance' in source) {
      // Running workout
      mainPart = this.createCardioPart(source as RunningEndurance, avgLevel, user);
      workoutTitle = `ריצה: ${source.title}`;
    } else if ('category' in source && (source as Special).category) {
      // Special workout
      mainPart = this.createSpecialPart(source as Special, avgLevel, user);
      workoutTitle = `מיוחד: ${source.title}`;
    } else {
      // Strength workout
      mainPart = this.createStrengthPart(source as StrengthExplosive, avgLevel, user);
      workoutTitle = `כוח: ${source.title}`;
    }

    return {
      id: crypto.randomUUID(),
      type: 'short',
      title: workoutTitle,
      description: source.instructions,
      parts: [mainPart],
      estimatedDuration: this.calculateTotalDuration([mainPart]),
      difficulty: source.difficulty,
      targetAttributes: source.target_attributes
    };
  }

  /**
   * Creates a warmup part from a Warmup entity
   */
  private static createWarmupPart(warmup: Warmup, userLevel: number, user: User): WorkoutPart {
    const components: WorkoutComponent[] = [];

    if (warmup.exercises && warmup.exercises.length > 0) {
      // Use exercises structure
      warmup.exercises.forEach((exercise, index) => {
        const value = this.getValueForLevel(exercise.values, userLevel);

        components.push({
          id: `warmup-${index}`,
          type: 'warmup_exercise',
          name: exercise.name,
          description: exercise.type === 'rep_based' ? `${value} חזרות` : `${value} שניות`,
          reps: exercise.type === 'rep_based' ? value : undefined,
          duration: exercise.type === 'time_based' ? value : undefined,
          restAfter: this.calculateRestForUser(exercise.rest_seconds || 30, user),
          instructions: warmup.instructions
        });
      });
    } else {
      // Single warmup component
      components.push({
        id: 'warmup-main',
        type: 'warmup_exercise',
        name: warmup.title,
        description: `${warmup.duration} דקות`,
        duration: warmup.duration * 60,
        instructions: warmup.instructions
      });
    }

    return {
      id: 'part-warmup',
      type: 'warmup',
      name: warmup.title,
      description: 'חימום',
      components,
      defaultRestBetweenComponents: 20,
      requiresGPS: false
    };
  }

  /**
   * Creates a cardio part from a RunningEndurance entity
   */
  private static createCardioPart(cardio: RunningEndurance, userLevel: number, user: User): WorkoutPart {
    const components: WorkoutComponent[] = [];

    if (cardio.exercises && cardio.exercises.length > 0) {
      // Interval/Fartlek style workout
      cardio.exercises.forEach((exercise, index) => {
        const value = this.getValueForLevel(exercise.values, userLevel);

        components.push({
          id: `cardio-${index}`,
          type: 'cardio_exercise',
          name: exercise.name,
          description: this.formatExerciseDescription(exercise.type, value),
          reps: exercise.type === 'rep_based' ? value : undefined,
          duration: exercise.type === 'time_based' ? value : undefined,
          distance: exercise.type === 'distance_based' ? value : undefined,
          restAfter: this.calculateRestForUser(exercise.rest_seconds || 60, user),
          requiresGPS: true,
          instructions: cardio.instructions
        });
      });
    } else {
      // Steady-state cardio
      components.push({
        id: 'cardio-main',
        type: 'cardio_exercise',
        name: cardio.title,
        description: cardio.distance ? `${(cardio.distance / 1000).toFixed(2)} ק"מ` : `${cardio.duration} דקות`,
        distance: cardio.distance,
        duration: cardio.duration ? cardio.duration * 60 : undefined,
        requiresGPS: true,
        instructions: cardio.instructions
      });
    }

    return {
      id: 'part-cardio',
      type: 'cardio',
      name: cardio.title,
      description: 'חלק קרדיו',
      components,
      defaultRestBetweenComponents: 60,
      requiresGPS: true
    };
  }

  /**
   * Creates a strength part from a StrengthExplosive entity
   */
  private static createStrengthPart(strength: StrengthExplosive, userLevel: number, user: User): WorkoutPart {
    const components: WorkoutComponent[] = [];

    if (strength.exercises && strength.exercises.length > 0) {
      const rounds = strength.rounds || 1;

      // If multiple rounds, create components for each round
      for (let round = 0; round < rounds; round++) {
        strength.exercises.forEach((exercise, index) => {
          const value = this.getValueForLevel(exercise.values, userLevel);
          const isLastInRound = index === strength.exercises!.length - 1;
          const isLastRound = round === rounds - 1;

          components.push({
            id: `strength-r${round}-e${index}`,
            type: 'strength_exercise',
            name: rounds > 1 ? `${exercise.name} (${round + 1}/${rounds})` : exercise.name,
            description: this.formatExerciseDescription(exercise.type, value),
            reps: exercise.type === 'rep_based' ? value : undefined,
            duration: exercise.type === 'time_based' ? value : undefined,
            restAfter: (isLastInRound && isLastRound) ? 0 : this.calculateRestForUser(exercise.rest_seconds || 60, user),
            instructions: strength.instructions
          });
        });
      }
    } else {
      // Legacy single exercise format
      components.push({
        id: 'strength-main',
        type: 'strength_exercise',
        name: strength.title,
        description: `${strength.sets} סטים × ${strength.reps} חזרות`,
        sets: strength.sets,
        reps: typeof strength.reps === 'number' ? strength.reps : undefined,
        restAfter: strength.rest_between_sets,
        instructions: strength.instructions
      });
    }

    return {
      id: 'part-strength',
      type: 'strength',
      name: strength.title,
      description: 'חלק כוח',
      components,
      defaultRestBetweenComponents: 60,
      requiresGPS: false
    };
  }

  /**
   * Creates a special part from a Special entity
   */
  private static createSpecialPart(special: Special, userLevel: number, user: User): WorkoutPart {
    const components: WorkoutComponent[] = [];

    if (special.exercises && special.exercises.length > 0) {
      const rounds = special.rounds || 1;

      for (let round = 0; round < rounds; round++) {
        special.exercises.forEach((exercise, index) => {
          const value = this.getValueForLevel(exercise.values, userLevel);
          const isLastInRound = index === special.exercises!.length - 1;
          const isLastRound = round === rounds - 1;

          components.push({
            id: `special-r${round}-e${index}`,
            type: 'special_exercise',
            name: rounds > 1 ? `${exercise.name} (${round + 1}/${rounds})` : exercise.name,
            description: this.formatExerciseDescription(exercise.type, value),
            reps: exercise.type === 'rep_based' ? value : undefined,
            duration: exercise.type === 'time_based' ? value : undefined,
            distance: exercise.type === 'distance_based' ? value : undefined,
            restAfter: (isLastInRound && isLastRound) ? 0 : this.calculateRestForUser(exercise.rest_seconds || 60, user),
            requiresGPS: exercise.type === 'distance_based',
            instructions: special.instructions
          });
        });
      }
    } else {
      // Single special activity
      components.push({
        id: 'special-main',
        type: 'special_exercise',
        name: special.title,
        description: `${special.duration} דקות`,
        duration: special.duration * 60,
        instructions: special.instructions,
        tips: special.safety_notes
      });
    }

    return {
      id: 'part-special',
      type: 'special',
      name: special.title,
      description: 'פעילות מיוחדת',
      components,
      defaultRestBetweenComponents: 90,
      requiresGPS: false
    };
  }

  /**
   * Helper: Get value for user level from values array/object
   */
  private static getValueForLevel(values: number[] | { [key: string]: number | null }, level: number): number {
    const clampedLevel = Math.max(0, Math.min(10, Math.round(level)));

    if (Array.isArray(values)) {
      return values[clampedLevel] || values[0] || 1;
    } else {
      const value = values[clampedLevel.toString()] || values['0'] || values[Object.keys(values)[0]];
      return value !== null && value !== undefined ? value : 1;
    }
  }

  /**
   * Helper: Calculate rest period adjusted for user fitness
   */
  private static calculateRestForUser(baseRest: number, user: User): number {
    const avgFitness = this.calculateAverageLevel(user.attributes);

    // Higher fitness = shorter rest (10-20% reduction)
    if (avgFitness >= 8) return Math.round(baseRest * 0.8);
    if (avgFitness >= 6) return Math.round(baseRest * 0.9);
    if (avgFitness <= 3) return Math.round(baseRest * 1.2);

    return baseRest;
  }

  /**
   * Helper: Format exercise description based on type
   */
  private static formatExerciseDescription(type: string, value: number): string {
    switch (type) {
      case 'rep_based':
        return `${value} חזרות`;
      case 'time_based':
        return `${value} שניות`;
      case 'distance_based':
        return `${(value / 1000).toFixed(2)} ק"מ`;
      default:
        return `${value}`;
    }
  }

  /**
   * Helper: Calculate total workout duration
   */
  private static calculateTotalDuration(parts: WorkoutPart[]): number {
    let totalSeconds = 0;

    parts.forEach(part => {
      part.components.forEach(component => {
        // Add exercise duration
        if (component.duration) {
          totalSeconds += component.duration;
        } else if (component.reps) {
          totalSeconds += component.reps * 3; // Assume 3 seconds per rep
        } else {
          totalSeconds += 30; // Default
        }

        // Add rest
        if (component.restAfter) {
          totalSeconds += component.restAfter;
        }
      });
    });

    return Math.ceil(totalSeconds / 60); // Return minutes
  }

  /**
   * Helper: Determine overall difficulty
   */
  private static determineDifficulty(difficulties: string[]): 'beginner' | 'intermediate' | 'advanced' | 'elite' {
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
    const avg = difficulties.reduce((sum, d) => sum + (difficultyMap[d as keyof typeof difficultyMap] || 2), 0) / difficulties.length;

    if (avg >= 3.5) return 'elite';
    if (avg >= 2.5) return 'advanced';
    if (avg >= 1.5) return 'intermediate';
    return 'beginner';
  }

  /**
   * Helper: Calculate average user level
   */
  private static calculateAverageLevel(attributes: UserAttributes): number {
    const values = Object.values(attributes);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Helper: Get random warmup
   */
  private static async getRandomWarmup(): Promise<Warmup> {
    const warmups = await Warmup.list();
    return warmups[Math.floor(Math.random() * warmups.length)];
  }

  /**
   * Helper: Get random cardio
   */
  private static async getRandomCardio(): Promise<RunningEndurance> {
    const cardios = await RunningEndurance.list();
    return cardios[Math.floor(Math.random() * cardios.length)];
  }

  /**
   * Helper: Get random strength
   */
  private static async getRandomStrength(): Promise<StrengthExplosive> {
    const strengths = await StrengthExplosive.list();
    return strengths[Math.floor(Math.random() * strengths.length)];
  }

  /**
   * Helper: Get random special
   */
  private static async getRandomSpecial(): Promise<Special> {
    const specials = await Special.list();
    return specials[Math.floor(Math.random() * specials.length)];
  }

  /**
   * Generate a random workout (50/50 classic vs special)
   */
  static async generateRandomWorkout(): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = this.calculateAverageLevel(user.attributes);

    if (Math.random() < 0.5) {
      return this.createClassicWorkout(undefined, undefined, undefined, avgLevel);
    } else {
      return this.createSpecialWorkout(undefined, undefined, avgLevel);
    }
  }
}
