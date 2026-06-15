/**
 * Workout Format Builders
 *
 * Implements the specific training formats from the Expert 2023 booklet:
 * Pyramid, Tabata, Station Rotation, EMOM, For-Time, Partner Intervals, Competition
 */

import type { WorkoutComponent, ComponentType } from './workoutComposition';
import { generateExerciseInstruction, getExerciseTips, generateFormatInstructions, generateRestInstruction } from './instructionGenerator';

// ============ FORMAT TYPES ============

export type WorkoutFormat =
  | 'rounds'           // Existing: X rounds of circuit
  | 'amrap'            // Existing: As many rounds as possible
  | 'pyramid'          // Ascending-descending rep scheme
  | 'emom'             // Every Minute On the Minute
  | 'for_time'         // Complete work ASAP
  | 'tabata'           // 20s work / 10s rest × 8
  | 'stations'         // Timed station rotation
  | 'partner_interval' // One works while other rests/holds
  | 'competition';     // Head-to-head or team tournament

// ============ MILITARY EQUIPMENT & DRILLS ============

export type MilitaryEquipment =
  | 'sandbag'       // שק חול
  | 'stretcher'     // אלונקה
  | 'tire'          // צמיג
  | 'weight_vest'   // וסט משקל
  | 'rope'          // חבל
  | 'water_jugs';   // ג'ריקנים

export type MilitaryDrill =
  | 'crawl'            // זחילה
  | 'bear_walk'        // דוב הליכת
  | 'duck_walk'        // ברווז הליכת
  | 'crab_walk'        // סרטן הליכת
  | 'casualty_drag'    // פצוע סחיבת
  | 'stretcher_carry'  // אלונקה סחיבת
  | 'sandbag_carry'    // מסע שק
  | 'tsokuon'          // צוקון (hill charge with sandbag)
  | 'elephant_march'   // פילים מסע
  | 'sprint_arrival';  // הגעה סדרי ספרינטים

// ============ EXERCISE DEFINITION ============

export interface FormatExercise {
  name: string;
  type: 'rep_based' | 'time_based' | 'distance_based';
  /** Level-indexed values: 10 elements for levels 1-10 */
  levelValues: number[];
  restSeconds?: number;
  isCompetition?: boolean;
  equipment?: MilitaryEquipment;
  drill?: MilitaryDrill;
}

// ============ SCALING TABLES ============

/**
 * Level-based scaling parameters from the booklet patterns.
 * Index 0 = level 1, index 9 = level 10.
 */
export const scalingTables = {
  sprint: {
    warmupReps:       [3, 3, 4, 5, 5, 5, 6, 7, 7, 7],
    competitionReps:  [3, 4, 5, 5, 6, 7, 8, 10, 10, 10],
    withVestFromLevel: 8, // vest added at level 8+
  },
  intervals: {
    distance200Reps:  [4, 5, 6, 6, 7, 8, 8, 8, 8, 8],
    distance400Reps:  [3, 4, 5, 6, 6, 7, 8, 8, 8, 8],
    distance500Reps:  [3, 3, 4, 5, 5, 6, 6, 6, 6, 6],
    distance800Reps:  [2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
    distance1000Reps: [2, 2, 2, 3, 3, 3, 4, 4, 4, 4],
  },
  stations: {
    workSeconds:       [90, 90, 100, 100, 105, 105, 110, 110, 110, 110],
    transitionSeconds: [30, 30, 20, 20, 15, 15, 15, 10, 10, 10],
    rounds:            [2, 2, 2, 2, 2, 3, 3, 3, 3, 4],
  },
  pyramid: {
    // Base multiplier for each level (the pyramid is multiplied by this)
    baseMultiplier:    [0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 1.0, 1.1, 1.25],
  },
  tabata: {
    rounds:            [2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
    workSeconds:       [15, 15, 20, 20, 20, 20, 20, 20, 25, 25],
    restSeconds:       [15, 15, 10, 10, 10, 10, 10, 10, 10, 10],
  },
  tsokuon: {
    uphillMeters:      [30, 35, 40, 45, 50, 55, 60, 70, 80, 100],
    durationMinutes:   [8, 9, 10, 10, 12, 12, 14, 15, 15, 15],
  },
  abs: {
    durationMinutes:   [4, 5, 5, 6, 6, 7, 7, 8, 8, 10],
  },
  general: {
    /** Rest multiplier (higher levels get less rest) */
    restMultiplier:    [1.3, 1.2, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75],
  },
};

/**
 * Get a scaling value for a given level (1-10)
 */
export function getScaledValue(table: number[], level: number): number {
  const idx = Math.max(0, Math.min(9, Math.round(level) - 1));
  return table[idx];
}

// ============ PYRAMID BUILDER ============

/**
 * Build a pyramid workout sequence.
 *
 * Example: steps = [20, 40, 60, 40, 20] with exercises [pushups, squats, run400m, situps]
 * Each step produces one component per exercise using the step value as the rep/distance count.
 */
export function buildPyramidComponents(
  exercises: FormatExercise[],
  pyramidSteps: number[],
  level: number,
  restBetweenSteps: number = 60
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];
  const multiplier = getScaledValue(scalingTables.pyramid.baseMultiplier, level);
  const restMult = getScaledValue(scalingTables.general.restMultiplier, level);

  pyramidSteps.forEach((step, stepIdx) => {
    const scaledStep = Math.round(step * multiplier);

    exercises.forEach((ex, exIdx) => {
      const value = ex.type === 'distance_based'
        ? (ex.levelValues ? ex.levelValues[Math.min(9, Math.round(level) - 1)] : scaledStep)
        : scaledStep;
      const isLastExInStep = exIdx === exercises.length - 1;
      const isLastStep = stepIdx === pyramidSteps.length - 1;

      components.push({
        id: `pyramid-s${stepIdx}-e${exIdx}`,
        type: 'strength_exercise' as ComponentType,
        name: ex.name,
        description: formatValueDescription(ex.type, value),
        reps: ex.type === 'rep_based' ? value : undefined,
        duration: ex.type === 'time_based' ? value : undefined,
        distance: ex.type === 'distance_based' ? value : undefined,
        restAfter: (isLastExInStep && !isLastStep) ? Math.round(restBetweenSteps * restMult) : (ex.restSeconds || 0),
        requiresGPS: ex.type === 'distance_based',
        instructions: generateExerciseInstruction(ex.name, ex.type === 'rep_based' ? value : undefined),
        tips: `פירמידה - שלב ${stepIdx + 1}/${pyramidSteps.length} (${scaledStep})`,
      });
    });
  });

  return components;
}

/**
 * Default pyramid steps (from booklet page 31)
 */
export function getDefaultPyramidSteps(level: number): number[] {
  // Base pyramid: 20, 40, 60, 40, 20
  // Scaled by level multiplier in buildPyramidComponents
  return [20, 40, 60, 40, 20];
}

// ============ TABATA BUILDER ============

/**
 * Build a Tabata workout sequence.
 * 20s work / 10s rest × 8 rounds (classic), with exercises cycling.
 */
export function buildTabataComponents(
  exercises: FormatExercise[],
  level: number
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];
  const rounds = getScaledValue(scalingTables.tabata.rounds, level);
  const workSec = getScaledValue(scalingTables.tabata.workSeconds, level);
  const restSec = getScaledValue(scalingTables.tabata.restSeconds, level);

  for (let round = 0; round < rounds; round++) {
    // Each round cycles through all exercises
    exercises.forEach((ex, exIdx) => {
      // Tabata intervals within a round (8 intervals total, split among exercises)
      const intervalsPerExercise = Math.ceil(8 / exercises.length);

      for (let interval = 0; interval < intervalsPerExercise; interval++) {
        const totalInterval = round * exercises.length * intervalsPerExercise + exIdx * intervalsPerExercise + interval;

        // Work phase
        components.push({
          id: `tabata-r${round}-e${exIdx}-i${interval}`,
          type: 'strength_exercise' as ComponentType,
          name: `${ex.name}`,
          description: `${workSec} שניות עבודה`,
          duration: workSec,
          restAfter: restSec,
          instructions: `טאבאטה סבב ${round + 1} - ${ex.name}. ${workSec} שניות, הכל!`,
          tips: `סבב ${round + 1}/${rounds} - מרווח ${interval + 1}/${intervalsPerExercise}`,
        });
      }
    });

    // Rest between rounds (1 minute, except after last round)
    if (round < rounds - 1) {
      components.push({
        id: `tabata-rest-${round}`,
        type: 'rest' as ComponentType,
        name: 'מנוחה בין סבבים',
        duration: 60,
        instructions: generateRestInstruction(60, exercises[0]?.name),
      });
    }
  }

  return components;
}

// ============ STATION ROTATION BUILDER ============

/**
 * Build a timed station rotation workout.
 *
 * Pattern from the booklet:
 * - 4-5 stations (מתח, מקבילים, שכיבות, סקוואט, בטן)
 * - 1:30-1:50 work per station
 * - 10-15s transition
 * - 2-3 rounds
 */
export function buildStationComponents(
  exercises: FormatExercise[],
  level: number
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];
  const workSec = getScaledValue(scalingTables.stations.workSeconds, level);
  const transitionSec = getScaledValue(scalingTables.stations.transitionSeconds, level);
  const rounds = getScaledValue(scalingTables.stations.rounds, level);

  for (let round = 0; round < rounds; round++) {
    exercises.forEach((ex, exIdx) => {
      const isLastInRound = exIdx === exercises.length - 1;
      const isLastRound = round === rounds - 1;

      components.push({
        id: `station-r${round}-e${exIdx}`,
        type: 'strength_exercise' as ComponentType,
        name: rounds > 1 ? `${ex.name} (סבב ${round + 1}/${rounds})` : ex.name,
        description: `${workSec} שניות עבודה`,
        duration: workSec,
        restAfter: (isLastInRound && isLastRound) ? 0 : transitionSec,
        instructions: generateExerciseInstruction(ex.name),
        tips: getExerciseTips(ex.name),
      });
    });

    // Rest between rounds
    if (round < rounds - 1) {
      components.push({
        id: `station-roundrest-${round}`,
        type: 'rest' as ComponentType,
        name: 'מנוחה בין סבבים',
        duration: 60,
        instructions: `סיום סבב ${round + 1}. דקה מנוחה. ${exercises[0]?.name} הבא.`,
      });
    }
  }

  return components;
}

/**
 * Default station exercises (from booklet's recurring pattern)
 */
export function getDefaultStationExercises(): FormatExercise[] {
  return [
    { name: 'מתח', type: 'time_based', levelValues: [90, 90, 100, 100, 105, 105, 110, 110, 110, 110] },
    { name: 'מקבילים', type: 'time_based', levelValues: [90, 90, 100, 100, 105, 105, 110, 110, 110, 110] },
    { name: 'שכיבות סמיכה', type: 'time_based', levelValues: [90, 90, 100, 100, 105, 105, 110, 110, 110, 110] },
    { name: 'סקוואטים', type: 'time_based', levelValues: [90, 90, 100, 100, 105, 105, 110, 110, 110, 110] },
    { name: 'בטן סטטית', type: 'time_based', levelValues: [90, 90, 100, 100, 105, 105, 110, 110, 110, 110] },
  ];
}

// ============ EMOM BUILDER ============

/**
 * Build an EMOM (Every Minute On the Minute) workout.
 * Each minute, perform the prescribed exercise. Rest = remaining time in the minute.
 */
export function buildEMOMComponents(
  exercises: FormatExercise[],
  totalMinutes: number,
  level: number
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];

  for (let minute = 0; minute < totalMinutes; minute++) {
    const exIdx = minute % exercises.length;
    const ex = exercises[exIdx];
    const value = ex.levelValues[Math.min(9, Math.round(level) - 1)];

    components.push({
      id: `emom-m${minute}`,
      type: 'strength_exercise' as ComponentType,
      name: ex.name,
      description: formatValueDescription(ex.type, value),
      reps: ex.type === 'rep_based' ? value : undefined,
      duration: ex.type === 'time_based' ? value : undefined,
      restAfter: 0, // EMOM - rest is implicit (remaining time in minute)
      instructions: `EMOM דקה ${minute + 1}/${totalMinutes} - ${ex.name}. סיימת? תנוח עד הדקה הבאה.`,
      tips: `EMOM - סיים מהר, נוח יותר.`,
    });
  }

  return components;
}

// ============ FOR-TIME BUILDER ============

/**
 * Build a For-Time workout (complete all work as fast as possible).
 * Rendered as sequential components with a running timer.
 */
export function buildForTimeComponents(
  exercises: FormatExercise[],
  level: number,
  rounds: number = 1
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];

  for (let round = 0; round < rounds; round++) {
    exercises.forEach((ex, exIdx) => {
      const value = ex.levelValues[Math.min(9, Math.round(level) - 1)];

      components.push({
        id: `fortime-r${round}-e${exIdx}`,
        type: ex.type === 'distance_based' ? 'cardio_exercise' as ComponentType : 'strength_exercise' as ComponentType,
        name: rounds > 1 ? `${ex.name} (${round + 1}/${rounds})` : ex.name,
        description: formatValueDescription(ex.type, value),
        reps: ex.type === 'rep_based' ? value : undefined,
        duration: ex.type === 'time_based' ? value : undefined,
        distance: ex.type === 'distance_based' ? value : undefined,
        restAfter: 0,
        requiresGPS: ex.type === 'distance_based',
        instructions: `זמן רץ - ${ex.name}. סיים ועבור הלאה.`,
      });
    });
  }

  return components;
}

// ============ PARTNER INTERVAL BUILDER ============

/**
 * Build partner interval components.
 * Pattern: One partner runs/works while the other holds a position.
 */
export function buildPartnerIntervalComponents(
  workExercise: FormatExercise,
  holdExercise: FormatExercise,
  level: number,
  rounds: number = 6
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];
  const workValue = workExercise.levelValues[Math.min(9, Math.round(level) - 1)];

  for (let round = 0; round < rounds; round++) {
    // Partner A works, Partner B holds
    components.push({
      id: `partner-r${round}-work`,
      type: workExercise.type === 'distance_based' ? 'cardio_exercise' as ComponentType : 'strength_exercise' as ComponentType,
      name: `${workExercise.name}`,
      description: `${formatValueDescription(workExercise.type, workValue)} - השותף מחזיק ${holdExercise.name}`,
      reps: workExercise.type === 'rep_based' ? workValue : undefined,
      duration: workExercise.type === 'time_based' ? workValue : undefined,
      distance: workExercise.type === 'distance_based' ? workValue : undefined,
      restAfter: 0,
      requiresGPS: workExercise.type === 'distance_based',
      instructions: `סבב ${round + 1}/${rounds}. אתה עובד - השותף מחזיק ${holdExercise.name}. מחליפים כשתסיים.`,
      tips: `זוגות - אחד עובד, אחד מחזיק. תדחפו אחד את השני.`,
    });
  }

  return components;
}

// ============ COMPETITION BUILDER ============

/**
 * Build competition/tournament components.
 */
export function buildCompetitionComponents(
  exercises: FormatExercise[],
  level: number,
  competitionType: 'max_reps' | 'for_time' | 'endurance' = 'max_reps'
): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];

  exercises.forEach((ex, exIdx) => {
    const value = ex.levelValues[Math.min(9, Math.round(level) - 1)];

    components.push({
      id: `competition-e${exIdx}`,
      type: 'special_exercise' as ComponentType,
      name: `אליפות ${ex.name}`,
      description: competitionType === 'max_reps'
        ? 'מקסימום חזרות'
        : competitionType === 'endurance'
          ? 'מי שמחזיק הכי הרבה'
          : formatValueDescription(ex.type, value),
      reps: competitionType === 'for_time' && ex.type === 'rep_based' ? value : undefined,
      duration: competitionType === 'endurance' ? 300 : undefined, // 5 min max
      restAfter: 90, // Rest between competitions
      instructions: `אליפות ${ex.name}. תוצאות נרשמות. תנו הכל.`,
      tips: `תחרות אישית - כל חזרה חייבת להיות מלאה ונקייה.`,
    });
  });

  return components;
}

// ============ SPRINT BUILDER ============

/**
 * Build sprint sequence matching booklet pattern:
 * warmup sprints → arrival-order sprints → competition sprints (with vest at high levels)
 */
export function buildSprintSequence(level: number): WorkoutComponent[] {
  const components: WorkoutComponent[] = [];
  const warmupCount = getScaledValue(scalingTables.sprint.warmupReps, level);
  const competitionCount = getScaledValue(scalingTables.sprint.competitionReps, level);
  const useVest = level >= scalingTables.sprint.withVestFromLevel;

  // Warmup sprints
  components.push({
    id: 'sprint-warmup',
    type: 'cardio_exercise',
    name: 'ספרינטים חימום',
    description: `${warmupCount} ספרינטים`,
    reps: warmupCount,
    restAfter: 30,
    instructions: `${warmupCount} ספרינטים חימום. מתגברים בהדרגה.`,
  });

  // Arrival-order sprints
  components.push({
    id: 'sprint-arrival',
    type: 'cardio_exercise',
    name: 'ספרינטים הגעה סדרי',
    description: `${competitionCount} ספרינטים${useVest ? ' + וסט' : ''}`,
    reps: competitionCount,
    restAfter: 60,
    instructions: useVest
      ? `${competitionCount} ספרינטים הגעה סדרי עם וסט. מאה אחוז.`
      : `${competitionCount} ספרינטים הגעה סדרי. ראשון מנצח.`,
    tips: useVest ? 'ספרינטים עם וסט משקל - הזנקה חזקה מהרגליים.' : undefined,
  });

  return components;
}

// ============ ABS FINISHER ============

/**
 * Build abs finisher matching booklet pattern (7-8 דק בטן)
 */
export function buildAbsFinisher(level: number): WorkoutComponent[] {
  const durationMin = getScaledValue(scalingTables.abs.durationMinutes, level);

  return [{
    id: 'abs-finisher',
    type: 'strength_exercise' as ComponentType,
    name: `${durationMin} דקות בטן`,
    description: `${durationMin} דקות עבודת ליבה`,
    duration: durationMin * 60,
    restAfter: 0,
    instructions: `${durationMin} דקות בטן - עובדים ביחד, קצב קבוצתי. כפיפות, פלאנק, צדדיים.`,
    tips: 'שמרו על נשימה סדירה. כל חזרה מלאה.',
  }];
}

// ============ WARMUP BUILDER ============

/**
 * Build a standard warmup sequence (booklet pattern: joint warmup + light run)
 */
export function buildStandardWarmup(level: number): WorkoutComponent[] {
  const jogDuration = level >= 6 ? 360 : level >= 3 ? 240 : 120; // 2-6 min

  return [
    {
      id: 'warmup-jog',
      type: 'warmup_exercise' as ComponentType,
      name: 'ריצה קלה',
      description: `${Math.round(jogDuration / 60)} דקות`,
      duration: jogDuration,
      restAfter: 0,
      instructions: 'ריצה קלה - ביחד, קצב קבוצתי. חימום הגוף.',
    },
    {
      id: 'warmup-joints',
      type: 'warmup_exercise' as ComponentType,
      name: 'חימום מפרקים',
      description: 'כתפיים, כפות ידיים, קרסוליים, ברכיים',
      duration: 180, // 3 minutes
      restAfter: 0,
      instructions: 'סיבובי כתפיים, כפות ידיים, קרסוליים, ברכיים. חצי דקה כל מפרק.',
    },
  ];
}

// ============ HELPERS ============

function formatValueDescription(type: string, value: number): string {
  switch (type) {
    case 'rep_based':
      return `${value} חזרות`;
    case 'time_based':
      if (value >= 60) {
        const min = Math.floor(value / 60);
        const sec = value % 60;
        return sec > 0 ? `${min}:${String(sec).padStart(2, '0')} דקות` : `${min} דקות`;
      }
      return `${value} שניות`;
    case 'distance_based':
      return value >= 1000 ? `${(value / 1000).toFixed(1)} ק"מ` : `${value} מטר`;
    default:
      return `${value}`;
  }
}
