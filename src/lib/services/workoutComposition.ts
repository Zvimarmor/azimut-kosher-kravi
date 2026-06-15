import { User, UserAttributes, UserService } from '../../Entities/User';
import { Warmup } from '../../Entities/Warmup';
import { RunningEndurance } from '../../Entities/RunningEndurance';
import { StrengthExplosive } from '../../Entities/StrengthExplosive';
import { Special } from '../../Entities/Special';
import {
  type WorkoutFormat,
  type FormatExercise,
  type MilitaryEquipment,
  scalingTables,
  getScaledValue,
  buildPyramidComponents,
  getDefaultPyramidSteps,
  buildTabataComponents,
  buildStationComponents,
  getDefaultStationExercises,
  buildEMOMComponents,
  buildForTimeComponents,
  buildPartnerIntervalComponents,
  buildCompetitionComponents,
  buildSprintSequence,
  buildAbsFinisher,
  buildStandardWarmup,
} from './workoutFormats';
import {
  generateFormatInstructions,
  generatePhaseInstruction,
  getMotivationTalk,
  generateWorkoutTitle,
  generateCompetitionInstruction,
  generateRestInstruction,
  generateExerciseInstruction,
  getExerciseTips,
} from './instructionGenerator';

// Re-export WorkoutFormat for use by instructionGenerator and other consumers
export type { WorkoutFormat } from './workoutFormats';

/**
 * Component Types - Each exercise within a part
 */
export type ComponentType =
  | 'strength_exercise'     // Push-ups, squats, etc.
  | 'cardio_exercise'       // Running, burpees, etc.
  | 'warmup_exercise'       // Dynamic stretches, mobility
  | 'special_exercise'      // Tactical drills, skills
  | 'motivation_talk'       // חנתר שיחת - motivational interstitial
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

  // NEW: Competition & format metadata
  isCompetition?: boolean;
  format?: WorkoutFormat;
  equipment?: MilitaryEquipment;

  // NEW: Partner mode
  partnerMode?: 'work' | 'hold' | 'alternate';
  partnerExercise?: string;  // What partner does while you work
}

/**
 * Part Types - Major sections of a workout
 */
export type PartType = 'warmup' | 'cardio' | 'strength' | 'special' | 'sprints' | 'closing' | 'motivation';

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

  // NEW: Format metadata
  format?: WorkoutFormat;
  phaseInstruction?: string;
}

/**
 * Workout Types
 */
export type WorkoutType =
  | 'classic'          // Warmup + Cardio + Strength (existing)
  | 'special'          // Warmup + Special mission (existing)
  | 'short'            // Single-part quickie (existing)
  | 'combat_classic'   // Full Expert-style session (5 phases)
  | 'pyramid'          // Pyramid drill
  | 'tsokuon'          // Hill/dune charge drill (צוקון)
  | 'competition_day'  // Tournament style (championships)
  | 'masa'             // Equipment march (מסע) + strength finish
  | 'tabata_finisher'; // Tabata-focused closing drill

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

  // NEW: Partner mode support
  isPartnerMode?: boolean;

  // NEW: Equipment requirements
  requiredEquipment?: MilitaryEquipment[];
}

/**
 * Workout Composition Service
 * Handles the assembly and personalization of workouts
 */
export class WorkoutCompositionService {

  // ================================================================
  // EXISTING METHODS (preserved for backward compatibility)
  // ================================================================

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

  // ================================================================
  // NEW WORKOUT CREATION METHODS
  // ================================================================

  /**
   * Creates a Combat Classic workout - the Expert 2023 standard session.
   *
   * 5-phase structure:
   *   1. חימום (Warmup)           - 5-8 min
   *   2. ספרינטים (Sprints)       - 10-15 min
   *   3. גוף מרכזי (Main Body)   - 20-30 min
   *   4. כוח (Strength Stations)  - 10-15 min
   *   5. סיום (Closing)           - 5-8 min
   */
  static async createCombatClassicWorkout(
    userLevel?: number,
    isPartnerMode?: boolean
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    // Phase 1: Warmup
    const warmupComponents = buildStandardWarmup(avgLevel);
    const warmupPart: WorkoutPart = {
      id: 'phase-warmup',
      type: 'warmup',
      name: 'חימום',
      description: generatePhaseInstruction('warmup', avgLevel),
      components: warmupComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
      phaseInstruction: generatePhaseInstruction('warmup', avgLevel),
    };

    // Phase 2: Sprints
    const sprintComponents = buildSprintSequence(avgLevel);
    const sprintPart: WorkoutPart = {
      id: 'phase-sprints',
      type: 'sprints',
      name: 'ספרינטים',
      description: generatePhaseInstruction('sprints', avgLevel),
      components: sprintComponents,
      defaultRestBetweenComponents: 30,
      requiresGPS: false,
      phaseInstruction: generatePhaseInstruction('sprints', avgLevel),
    };

    // Phase 3: Main Body - randomly select a format
    const mainPart = await this.createMainBodyPart(avgLevel, user, isPartnerMode);

    // Phase 4: Strength Stations
    const stationExercises = getDefaultStationExercises();
    const stationComponents = buildStationComponents(stationExercises, avgLevel);
    const strengthPart: WorkoutPart = {
      id: 'phase-strength',
      type: 'strength',
      name: 'תחנות כוח',
      description: generatePhaseInstruction('strength', avgLevel),
      components: stationComponents,
      defaultRestBetweenComponents: 15,
      requiresGPS: false,
      format: 'stations',
      phaseInstruction: generatePhaseInstruction('strength', avgLevel),
    };

    // Phase 5: Closing (abs + motivation)
    const absComponents = buildAbsFinisher(avgLevel);
    const closingPart: WorkoutPart = {
      id: 'phase-closing',
      type: 'closing',
      name: 'סיום',
      description: generatePhaseInstruction('closing', avgLevel),
      components: [
        ...absComponents,
        // חנתר שיחת - motivation talk (skippable interstitial)
        {
          id: 'motivation-closing',
          type: 'motivation_talk',
          name: 'חנתר שיחת',
          description: getMotivationTalk('post_workout'),
          duration: 60,
          instructions: getMotivationTalk('post_workout'),
        },
      ],
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
      phaseInstruction: generatePhaseInstruction('closing', avgLevel),
    };

    // Add mid-workout motivation between sprints and main
    const motivationPart: WorkoutPart = {
      id: 'phase-motivation-mid',
      type: 'motivation',
      name: 'חנתר שיחת',
      components: [{
        id: 'motivation-mid',
        type: 'motivation_talk',
        name: 'חנתר שיחת',
        description: getMotivationTalk('between_phases'),
        duration: 30,
        instructions: getMotivationTalk('between_phases'),
      }],
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    const allParts = [warmupPart, sprintPart, motivationPart, mainPart, strengthPart, closingPart];

    return {
      id: crypto.randomUUID(),
      type: 'combat_classic',
      title: generateWorkoutTitle('combat_classic'),
      description: 'אימון מלא בסגנון אקספרט - 5 שלבים',
      parts: allParts,
      estimatedDuration: this.calculateTotalDuration(allParts),
      difficulty: this.determineDifficultyByLevel(avgLevel),
      targetAttributes: ['push_strength', 'pull_strength', 'cardio_endurance', 'running_volume', 'weight_work'],
      isPartnerMode,
    };
  }

  /**
   * Creates a Pyramid workout
   */
  static async createPyramidWorkout(
    userLevel?: number,
    isPartnerMode?: boolean
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    // Warmup
    const warmupComponents = buildStandardWarmup(avgLevel);
    const warmupPart: WorkoutPart = {
      id: 'part-warmup',
      type: 'warmup',
      name: 'חימום',
      components: warmupComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    // Pyramid exercises (from booklet page 31)
    const pyramidExercises: FormatExercise[] = [
      { name: 'כפיפות בטן', type: 'rep_based', levelValues: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35] },
      { name: 'סקוואטים', type: 'rep_based', levelValues: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35] },
      { name: 'ריצה', type: 'distance_based', levelValues: [200, 200, 300, 300, 400, 400, 400, 400, 400, 400] },
      { name: 'שכיבות סמיכה', type: 'rep_based', levelValues: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35] },
    ];

    const steps = getDefaultPyramidSteps(avgLevel);
    const pyramidComponents = buildPyramidComponents(pyramidExercises, steps, avgLevel);

    const mainPart: WorkoutPart = {
      id: 'part-pyramid',
      type: 'strength',
      name: 'פירמידה',
      description: generateFormatInstructions('pyramid', avgLevel),
      components: pyramidComponents,
      defaultRestBetweenComponents: 30,
      requiresGPS: true,
      format: 'pyramid',
    };

    // Closing
    const absComponents = buildAbsFinisher(avgLevel);
    const closingPart: WorkoutPart = {
      id: 'part-closing',
      type: 'closing',
      name: 'סיום',
      components: absComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    const allParts = [warmupPart, mainPart, closingPart];

    return {
      id: crypto.randomUUID(),
      type: 'pyramid',
      title: generateWorkoutTitle('pyramid'),
      description: `פירמידה: ${steps.join(' → ')}`,
      parts: allParts,
      estimatedDuration: this.calculateTotalDuration(allParts),
      difficulty: this.determineDifficultyByLevel(avgLevel),
      targetAttributes: ['push_strength', 'cardio_endurance', 'running_volume', 'weight_work'],
      isPartnerMode,
    };
  }

  /**
   * Creates a Tsokuon (צוקון) hill charge drill
   */
  static async createTsokuonWorkout(
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    const uphillMeters = getScaledValue(scalingTables.tsokuon.uphillMeters, avgLevel);
    const durationMin = getScaledValue(scalingTables.tsokuon.durationMinutes, avgLevel);

    // Warmup
    const warmupComponents = buildStandardWarmup(avgLevel);
    const warmupPart: WorkoutPart = {
      id: 'part-warmup',
      type: 'warmup',
      name: 'חימום',
      components: warmupComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    // Tsokuon round 1
    const tsokuonPart1: WorkoutPart = {
      id: 'part-tsokuon-1',
      type: 'special',
      name: 'צוקון - סבב ראשון',
      description: `${durationMin} דקות - עליות עם שק, ${uphillMeters} מטר עלייה`,
      components: [{
        id: 'tsokuon-1',
        type: 'special_exercise',
        name: 'צוקון',
        description: `${uphillMeters} מטר עלייה עם שק - ${durationMin} דקות`,
        duration: durationMin * 60,
        distance: uphillMeters,
        restAfter: 0,
        requiresGPS: true,
        instructions: `צוקון - ${uphillMeters} מטר עלייה עם שק. ירידה בהליכה. סבבים שיותר כמה ב-${durationMin} דקות.`,
        tips: 'עלייה בריצה, ירידה בהליכה. אל תעצרו.',
        equipment: 'sandbag',
      }],
      defaultRestBetweenComponents: 0,
      requiresGPS: true,
    };

    // Rest between rounds
    const restPart: WorkoutPart = {
      id: 'part-rest-mid',
      type: 'motivation',
      name: 'מנוחה + חנתר שיחת',
      components: [
        {
          id: 'rest-mid',
          type: 'rest',
          name: 'מנוחה',
          duration: 300, // 5 minutes
          instructions: generateRestInstruction(300),
        },
        {
          id: 'motivation-mid',
          type: 'motivation_talk',
          name: 'חנתר שיחת',
          description: getMotivationTalk('mid_workout'),
          duration: 30,
          instructions: getMotivationTalk('mid_workout'),
        },
      ],
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    // Tsokuon round 2
    const tsokuonPart2: WorkoutPart = {
      id: 'part-tsokuon-2',
      type: 'special',
      name: 'צוקון - סבב שני',
      description: `${durationMin} דקות - עליות עם שק, ${uphillMeters} מטר עלייה`,
      components: [{
        id: 'tsokuon-2',
        type: 'special_exercise',
        name: 'צוקון',
        description: `${uphillMeters} מטר עלייה עם שק - ${durationMin} דקות`,
        duration: durationMin * 60,
        distance: uphillMeters,
        restAfter: 0,
        requiresGPS: true,
        instructions: `סבב שני - אותו דבר. תלחצו. ${uphillMeters} מטר כל עלייה.`,
        equipment: 'sandbag',
      }],
      defaultRestBetweenComponents: 0,
      requiresGPS: true,
    };

    const allParts = [warmupPart, tsokuonPart1, restPart, tsokuonPart2];

    return {
      id: crypto.randomUUID(),
      type: 'tsokuon',
      title: generateWorkoutTitle('tsokuon'),
      description: `צוקון - עליות עם שק, ${uphillMeters} מטר`,
      parts: allParts,
      estimatedDuration: this.calculateTotalDuration(allParts),
      difficulty: this.determineDifficultyByLevel(avgLevel),
      targetAttributes: ['cardio_endurance', 'rucking_volume', 'weight_work'],
      requiredEquipment: ['sandbag'],
    };
  }

  /**
   * Creates a Competition Day workout
   */
  static async createCompetitionDay(
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    // Warmup
    const warmupComponents = buildStandardWarmup(avgLevel);
    const warmupPart: WorkoutPart = {
      id: 'part-warmup',
      type: 'warmup',
      name: 'חימום',
      components: warmupComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    // Measurement run (3km)
    const measurementPart: WorkoutPart = {
      id: 'part-measurement',
      type: 'cardio',
      name: 'מדידה - 3 ק"מ',
      components: [{
        id: 'measurement-3k',
        type: 'cardio_exercise',
        name: 'ריצה 3 ק"מ - מדידה',
        description: '3 ק"מ',
        distance: 3000,
        restAfter: 120,
        requiresGPS: true,
        instructions: 'מדידת 3 ק"מ. תוצאות נרשמות. תנו הכל.',
        isCompetition: true,
      }],
      defaultRestBetweenComponents: 0,
      requiresGPS: true,
    };

    // Competition exercises
    const competitionExercises: FormatExercise[] = [
      { name: 'מתח', type: 'rep_based', levelValues: [3, 5, 7, 8, 10, 12, 14, 16, 18, 20], isCompetition: true },
      { name: 'שכיבות סמיכה', type: 'rep_based', levelValues: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60], isCompetition: true },
      { name: 'מצב 2', type: 'time_based', levelValues: [30, 45, 60, 75, 90, 105, 120, 150, 180, 240], isCompetition: true },
    ];
    const competitionComponents = buildCompetitionComponents(competitionExercises, avgLevel);

    const competitionPart: WorkoutPart = {
      id: 'part-competition',
      type: 'special',
      name: 'אליפויות',
      description: 'אליפויות - מתח, שכיבות סמיכה, מצב 2',
      components: competitionComponents,
      defaultRestBetweenComponents: 90,
      requiresGPS: false,
      format: 'competition',
    };

    // Abs finisher
    const absComponents = buildAbsFinisher(avgLevel);
    const closingPart: WorkoutPart = {
      id: 'part-closing',
      type: 'closing',
      name: 'סיום',
      components: [
        ...absComponents,
        {
          id: 'motivation-closing',
          type: 'motivation_talk',
          name: 'חנתר שיחת',
          description: getMotivationTalk('post_workout'),
          duration: 60,
          instructions: getMotivationTalk('post_workout'),
        },
      ],
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    const allParts = [warmupPart, measurementPart, competitionPart, closingPart];

    return {
      id: crypto.randomUUID(),
      type: 'competition_day',
      title: generateWorkoutTitle('competition_day'),
      description: 'יום אליפויות - מדידה, תחרויות כוח',
      parts: allParts,
      estimatedDuration: this.calculateTotalDuration(allParts),
      difficulty: this.determineDifficultyByLevel(avgLevel),
      targetAttributes: ['push_strength', 'pull_strength', 'cardio_endurance', 'running_volume'],
    };
  }

  /**
   * Creates a Masa (מסע) workout - equipment march + strength finish
   */
  static async createMasaWorkout(
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    // Equipment prep
    const prepPart: WorkoutPart = {
      id: 'part-prep',
      type: 'warmup',
      name: 'הכנה',
      components: [
        {
          id: 'prep-bags',
          type: 'warmup_exercise',
          name: 'מילוי שקים והעמסת אלונקה',
          description: 'מילוי שקים, קשירה, העמסה על אלונקה',
          duration: 300,
          instructions: 'מילוי שקים - עבודה צוותית. קשירה מהירה. העמסה על אלונקה. זמן על.',
          equipment: 'stretcher',
        },
        ...buildStandardWarmup(avgLevel),
      ],
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    // March distance by level
    const marchDistances = [1500, 2000, 2500, 3000, 3000, 3500, 4000, 4500, 5000, 5000];
    const marchDistance = getScaledValue(marchDistances, avgLevel);

    // March part
    const marchPart: WorkoutPart = {
      id: 'part-march',
      type: 'cardio',
      name: 'מסע ציוד',
      description: `${(marchDistance / 1000).toFixed(1)} ק"מ עם אלונקה ושקים`,
      components: [{
        id: 'march-main',
        type: 'cardio_exercise',
        name: 'מסע ציוד',
        description: `${(marchDistance / 1000).toFixed(1)} ק"מ`,
        distance: marchDistance,
        requiresGPS: true,
        instructions: `מסע - ${(marchDistance / 1000).toFixed(1)} ק"מ עם אלונקה ושקים. חילופים כל 200 מטר.`,
        tips: 'שמרו על קצב קבוע. חילופים מסודרים.',
        equipment: 'stretcher',
      }],
      defaultRestBetweenComponents: 0,
      requiresGPS: true,
    };

    // Strength finish
    const stationExercises = getDefaultStationExercises();
    const stationComponents = buildStationComponents(stationExercises, avgLevel);
    const strengthPart: WorkoutPart = {
      id: 'part-strength',
      type: 'strength',
      name: 'תחנות כוח',
      components: stationComponents,
      defaultRestBetweenComponents: 15,
      requiresGPS: false,
      format: 'stations',
    };

    const allParts = [prepPart, marchPart, strengthPart];

    return {
      id: crypto.randomUUID(),
      type: 'masa',
      title: generateWorkoutTitle('masa'),
      description: `מסע ${(marchDistance / 1000).toFixed(1)} ק"מ + תחנות כוח`,
      parts: allParts,
      estimatedDuration: this.calculateTotalDuration(allParts),
      difficulty: this.determineDifficultyByLevel(avgLevel),
      targetAttributes: ['rucking_volume', 'cardio_endurance', 'push_strength', 'pull_strength', 'weight_work'],
      requiredEquipment: ['stretcher', 'sandbag'],
    };
  }

  /**
   * Creates a Tabata finisher workout
   */
  static async createTabataWorkout(
    userLevel?: number
  ): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = userLevel || this.calculateAverageLevel(user.attributes);

    // Warmup
    const warmupComponents = buildStandardWarmup(avgLevel);
    const warmupPart: WorkoutPart = {
      id: 'part-warmup',
      type: 'warmup',
      name: 'חימום',
      components: warmupComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
    };

    // Tabata exercises (from booklet)
    const tabataExercises: FormatExercise[] = [
      { name: 'שכיבות סמיכה', type: 'time_based', levelValues: [15, 15, 20, 20, 20, 20, 20, 20, 25, 25] },
      { name: 'סקוואטים', type: 'time_based', levelValues: [15, 15, 20, 20, 20, 20, 20, 20, 25, 25] },
      { name: 'כפיפות בטן', type: 'time_based', levelValues: [15, 15, 20, 20, 20, 20, 20, 20, 25, 25] },
    ];

    const tabataComponents = buildTabataComponents(tabataExercises, avgLevel);
    const mainPart: WorkoutPart = {
      id: 'part-tabata',
      type: 'strength',
      name: 'טאבאטה',
      description: generateFormatInstructions('tabata', avgLevel),
      components: tabataComponents,
      defaultRestBetweenComponents: 0,
      requiresGPS: false,
      format: 'tabata',
    };

    const allParts = [warmupPart, mainPart];

    return {
      id: crypto.randomUUID(),
      type: 'tabata_finisher',
      title: generateWorkoutTitle('tabata_finisher'),
      description: 'אימון טאבאטה - 20 שניות עבודה, 10 שניות מנוחה',
      parts: allParts,
      estimatedDuration: this.calculateTotalDuration(allParts),
      difficulty: this.determineDifficultyByLevel(avgLevel),
      targetAttributes: ['push_strength', 'weight_work', 'cardio_endurance'],
    };
  }

  // ================================================================
  // SMART WORKOUT GENERATION
  // ================================================================

  /**
   * Generate a smart workout based on user level and attributes.
   * Replaces the old 50/50 coin flip with intelligent selection.
   */
  static async generateSmartWorkout(isPartnerMode?: boolean): Promise<ComposedWorkout> {
    const user = await User.me();
    const avgLevel = this.calculateAverageLevel(user.attributes);
    const weakest = UserService.getWeakestAttribute(user.attributes);

    // Level-based workout type selection
    const random = Math.random();

    if (avgLevel <= 3) {
      // Beginner: Focus on classic + stations (build foundation)
      if (random < 0.4) {
        return this.createClassicWorkout(undefined, undefined, undefined, avgLevel);
      } else if (random < 0.7) {
        return this.createTabataWorkout(avgLevel);
      } else {
        return this.createSpecialWorkout(undefined, undefined, avgLevel);
      }
    } else if (avgLevel <= 6) {
      // Intermediate: Introduce pyramids, tabata, equipment drills
      if (random < 0.25) {
        return this.createCombatClassicWorkout(avgLevel, isPartnerMode);
      } else if (random < 0.45) {
        return this.createPyramidWorkout(avgLevel, isPartnerMode);
      } else if (random < 0.6) {
        return this.createTabataWorkout(avgLevel);
      } else if (random < 0.8) {
        return this.createClassicWorkout(undefined, undefined, undefined, avgLevel);
      } else {
        return this.createSpecialWorkout(undefined, undefined, avgLevel);
      }
    } else if (avgLevel <= 8) {
      // Advanced: Full combat classic, tsokuon, for-time
      if (random < 0.3) {
        return this.createCombatClassicWorkout(avgLevel, isPartnerMode);
      } else if (random < 0.45) {
        return this.createTsokuonWorkout(avgLevel);
      } else if (random < 0.6) {
        return this.createPyramidWorkout(avgLevel, isPartnerMode);
      } else if (random < 0.75) {
        return this.createCompetitionDay(avgLevel);
      } else if (random < 0.9) {
        return this.createMasaWorkout(avgLevel);
      } else {
        return this.createTabataWorkout(avgLevel);
      }
    } else {
      // Elite (9-10): Competition days, hero WODs, marches
      if (random < 0.25) {
        return this.createCompetitionDay(avgLevel);
      } else if (random < 0.45) {
        return this.createCombatClassicWorkout(avgLevel, isPartnerMode);
      } else if (random < 0.6) {
        return this.createMasaWorkout(avgLevel);
      } else if (random < 0.75) {
        return this.createTsokuonWorkout(avgLevel);
      } else if (random < 0.9) {
        return this.createPyramidWorkout(avgLevel, isPartnerMode);
      } else {
        return this.createSpecialWorkout(undefined, undefined, avgLevel);
      }
    }
  }

  /**
   * Generate a random workout (legacy compatibility - now calls generateSmartWorkout)
   */
  static async generateRandomWorkout(): Promise<ComposedWorkout> {
    return this.generateSmartWorkout();
  }

  // ================================================================
  // PART CREATION HELPERS (existing - preserved)
  // ================================================================

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

      if (rounds === 999) {
        // AMRAP format - create a single timed component for the whole circuit
        const match = strength.title.match(/AMRAP\s*(\d+)/i);
        const durationMinutes = match ? parseInt(match[1], 10) : 20;

        const amrapDescription = strength.exercises.map(ex => {
          const value = this.getValueForLevel(ex.values, userLevel);
          return `${ex.name}: ${this.formatExerciseDescription(ex.type, value)}`;
        }).join(' • ');

        components.push({
          id: 'strength-amrap',
          type: 'special_exercise', // Renders with a single large countdown timer
          name: strength.title,
          description: amrapDescription,
          duration: durationMinutes * 60,
          instructions: strength.instructions || 'AMRAP - סבבים שיותר כמה. הזמן רץ, אתם לא עוצרים.',
          tips: 'AMRAP - סיים סבב, תתחיל מההתחלה. כל חזרה מלאה.',
          format: 'amrap',
        });
      } else {
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
              instructions: generateExerciseInstruction(exercise.name, exercise.type === 'rep_based' ? value : undefined),
              tips: getExerciseTips(exercise.name),
            });
          });
        }
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

      if (rounds === 999) {
        // AMRAP format
        const match = special.title.match(/AMRAP\s*(\d+)/i);
        const durationMinutes = match ? parseInt(match[1], 10) : 20;

        const amrapDescription = special.exercises.map(ex => {
          const value = this.getValueForLevel(ex.values, userLevel);
          return `${ex.name}: ${this.formatExerciseDescription(ex.type, value)}`;
        }).join(' • ');

        components.push({
          id: 'special-amrap',
          type: 'special_exercise',
          name: special.title,
          description: amrapDescription,
          duration: durationMinutes * 60,
          instructions: special.instructions || 'AMRAP - סבבים שיותר כמה. הזמן רץ, אתם לא עוצרים.',
          tips: 'AMRAP - סיים סבב, תתחיל מההתחלה. כל חזרה מלאה.',
          format: 'amrap',
        });
      } else {
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
              instructions: generateExerciseInstruction(exercise.name, exercise.type === 'rep_based' ? value : undefined),
              tips: getExerciseTips(exercise.name),
            });
          });
        }
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

  // ================================================================
  // NEW INTERNAL HELPERS
  // ================================================================

  /**
   * Create the main body part for a combat classic workout.
   * Randomly selects between intervals, pyramid, for-time, or partner intervals.
   */
  private static async createMainBodyPart(
    level: number,
    user: User,
    isPartnerMode?: boolean
  ): Promise<WorkoutPart> {
    const random = Math.random();

    if (isPartnerMode && random < 0.3) {
      // Partner intervals (one runs, one holds)
      const workEx: FormatExercise = {
        name: 'ריצה',
        type: 'distance_based',
        levelValues: [300, 350, 400, 400, 500, 500, 500, 600, 700, 800],
      };
      const holdEx: FormatExercise = {
        name: 'בטן סטטית',
        type: 'time_based',
        levelValues: [20, 25, 30, 35, 40, 45, 50, 55, 60, 60],
      };
      const rounds = level >= 7 ? 6 : level >= 4 ? 5 : 4;
      const components = buildPartnerIntervalComponents(workEx, holdEx, level, rounds);

      return {
        id: 'phase-main',
        type: 'cardio',
        name: 'אינטרוואלים בזוגות',
        description: generateFormatInstructions('partner_interval', level),
        components,
        defaultRestBetweenComponents: 0,
        requiresGPS: true,
        format: 'partner_interval',
        phaseInstruction: generatePhaseInstruction('main', level),
      };
    }

    // Select format based on level and randomness
    if (random < 0.35) {
      // Intervals with cardio source
      const cardio = await this.getRandomCardio();
      return {
        id: 'phase-main',
        type: 'cardio',
        name: cardio.title,
        description: generatePhaseInstruction('main', level),
        components: this.createCardioPart(cardio, level, user).components,
        defaultRestBetweenComponents: 60,
        requiresGPS: true,
        phaseInstruction: generatePhaseInstruction('main', level),
      };
    } else if (random < 0.55) {
      // Pyramid
      const pyramidExercises: FormatExercise[] = [
        { name: 'כפיפות בטן', type: 'rep_based', levelValues: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35] },
        { name: 'סקוואטים', type: 'rep_based', levelValues: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35] },
        { name: 'ריצה', type: 'distance_based', levelValues: [200, 200, 300, 300, 400, 400, 400, 400, 400, 400] },
        { name: 'שכיבות סמיכה', type: 'rep_based', levelValues: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35] },
      ];
      const steps = getDefaultPyramidSteps(level);
      const components = buildPyramidComponents(pyramidExercises, steps, level);

      return {
        id: 'phase-main',
        type: 'strength',
        name: 'פירמידה',
        description: generateFormatInstructions('pyramid', level),
        components,
        defaultRestBetweenComponents: 30,
        requiresGPS: true,
        format: 'pyramid',
        phaseInstruction: generatePhaseInstruction('main', level),
      };
    } else if (random < 0.75) {
      // For-Time
      const forTimeExercises: FormatExercise[] = [
        { name: 'ריצה', type: 'distance_based', levelValues: [400, 400, 600, 800, 1000, 1000, 1200, 1400, 1600, 1600] },
        { name: 'סקוואטים', type: 'rep_based', levelValues: [50, 60, 80, 100, 120, 150, 180, 200, 250, 300] },
        { name: 'שכיבות סמיכה', type: 'rep_based', levelValues: [20, 30, 40, 50, 60, 75, 90, 100, 120, 150] },
        { name: 'מתח', type: 'rep_based', levelValues: [5, 8, 10, 15, 20, 25, 30, 40, 50, 75] },
      ];
      const components = buildForTimeComponents(forTimeExercises, level);

      return {
        id: 'phase-main',
        type: 'strength',
        name: 'For Time',
        description: generateFormatInstructions('for_time', level),
        components,
        defaultRestBetweenComponents: 0,
        requiresGPS: true,
        format: 'for_time',
        phaseInstruction: generatePhaseInstruction('main', level),
      };
    } else {
      // EMOM
      const emomExercises: FormatExercise[] = [
        { name: 'מתח', type: 'rep_based', levelValues: [3, 4, 5, 6, 7, 8, 9, 10, 12, 14] },
        { name: 'שכיבות סמיכה', type: 'rep_based', levelValues: [8, 10, 12, 15, 18, 20, 22, 25, 28, 30] },
        { name: 'סקוואטים', type: 'rep_based', levelValues: [10, 12, 15, 18, 20, 22, 25, 28, 30, 35] },
      ];
      const totalMinutes = level >= 7 ? 20 : level >= 4 ? 15 : 12;
      const components = buildEMOMComponents(emomExercises, totalMinutes, level);

      return {
        id: 'phase-main',
        type: 'strength',
        name: 'EMOM',
        description: generateFormatInstructions('emom', level),
        components,
        defaultRestBetweenComponents: 0,
        requiresGPS: false,
        format: 'emom',
        phaseInstruction: generatePhaseInstruction('main', level),
      };
    }
  }

  // ================================================================
  // CORE UTILITY METHODS
  // ================================================================

  /**
   * Helper: Get value for user level from values array/object
   *
   * Values arrays contain 10 elements (indices 0-9) representing levels 1-10.
   * The level is clamped to [1, 10] and converted to a zero-based index.
   *
   * For sparse key maps (e.g. {"0": 10, "5": 20, "10": 40}),
   * uses linear interpolation between defined breakpoints.
   *
   * BUG FIX: The interpolation now correctly maps user levels 1-10
   * to the 0-10 key space used by CSV data.
   */
  static getValueForLevel(values: number[] | { [key: string]: number | null }, level: number): number {
    if (!values) return 30; // Safe fallback if values object is completely missing

    const clampedLevel = Math.max(1, Math.min(10, Math.round(level)));
    const arrayIndex = clampedLevel - 1; // Convert to zero-based index

    if (Array.isArray(values)) {
      return values[arrayIndex] ?? values[values.length - 1] ?? 30;
    } else {
      // Sparse key map interpolation
      // CSV data uses keys 0-10 where:
      //   key 0  = lowest level
      //   key 5  = mid level
      //   key 10 = highest level
      // User levels 1-10 map linearly to key space 0-10:
      //   level 1 → key 0, level 5.5 → key 5, level 10 → key 10
      const lookupKey = ((clampedLevel - 1) / 9) * 10; // Map 1-10 → 0-10

      // Collect defined (non-null) breakpoints
      const definedKeys = Object.keys(values)
        .map(Number)
        .filter(k => !isNaN(k) && values[k.toString()] !== null && values[k.toString()] !== undefined)
        .sort((a, b) => a - b);

      if (definedKeys.length === 0) return 30;
      if (definedKeys.length === 1) return values[definedKeys[0].toString()]!;

      // Clamp to defined range
      if (lookupKey <= definedKeys[0]) return values[definedKeys[0].toString()]!;
      if (lookupKey >= definedKeys[definedKeys.length - 1]) return values[definedKeys[definedKeys.length - 1].toString()]!;

      // Find surrounding breakpoints and interpolate
      for (let i = 0; i < definedKeys.length - 1; i++) {
        const lowerKey = definedKeys[i];
        const upperKey = definedKeys[i + 1];
        if (lookupKey >= lowerKey && lookupKey <= upperKey) {
          const lowerVal = values[lowerKey.toString()]!;
          const upperVal = values[upperKey.toString()]!;
          const fraction = (lookupKey - lowerKey) / (upperKey - lowerKey);
          return Math.round(lowerVal + fraction * (upperVal - lowerVal));
        }
      }

      // Fallback
      return values[definedKeys[0].toString()] ?? 30;
    }
  }

  /**
   * Helper: Calculate rest period adjusted for user fitness
   */
  private static calculateRestForUser(baseRest: number, user: User): number {
    const avgFitness = this.calculateAverageLevel(user.attributes);
    const multiplier = getScaledValue(scalingTables.general.restMultiplier, avgFitness);
    return Math.round(baseRest * multiplier);
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
        return value >= 1000
          ? `${(value / 1000).toFixed(2)} ק"מ`
          : `${value} מטר`;
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
        } else if (component.distance) {
          // Assume ~5 min/km pace for distance-based exercises
          totalSeconds += (component.distance / 1000) * 300;
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
   * Helper: Determine overall difficulty from source difficulties
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
   * Helper: Determine difficulty directly from user level
   */
  private static determineDifficultyByLevel(level: number): 'beginner' | 'intermediate' | 'advanced' | 'elite' {
    if (level >= 9) return 'elite';
    if (level >= 7) return 'advanced';
    if (level >= 4) return 'intermediate';
    return 'beginner';
  }

  /**
   * Helper: Calculate average user level
   */
  static calculateAverageLevel(attributes: UserAttributes): number {
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
}
