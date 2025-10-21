// Data service for workout entities - reads from CSV files

import type { Warmup, AttributeType } from '../../Entities/Warmup';
import type { StrengthExplosive } from '../../Entities/StrengthExplosive';
import type { RunningEndurance } from '../../Entities/RunningEndurance';
import type { Special } from '../../Entities/Special';
import type { User } from '../../Entities/User';
import type { WorkoutHistory } from '../../Entities/WorkoutHistory';
import type { Exercise } from '../../Entities/Exercise';
import { fetchCSV, parseJSONField, type CSVRow } from '../utils/csvParser';

// Mock workout data
const mockWarmups: Warmup[] = [
  {
    title: "חימום כללי",
    target_attributes: ['cardio_endurance', 'push_strength'],
    duration: 5,
    instructions: "התחל בריצה קלה במקום למשך דקה, עבור לקפיצות, לחיצות כתף וסיבובי ידיים",
    difficulty: 'beginner',
    category: 'Warmup',
    exercises: [
      {
        name: "ריצה במקום",
        type: 'time_based',
        values: [30, 45, 60, 90, 120, 150, 180, 210, 240, 300], // seconds for levels 1-10
        rest_seconds: 0
      },
      {
        name: "קפיצות",
        type: 'rep_based',
        values: [5, 8, 10, 12, 15, 18, 20, 22, 25, 30], // reps for levels 1-10
        rest_seconds: 0
      }
    ],
    rounds: 1
  },
  {
    title: "חימום קרבי",
    target_attributes: ['push_strength', 'pull_strength'],
    duration: 8,
    instructions: "חימום מתקדם הכולל תרגילי משקל גוף וכנה לפעילות אינטנסיבית",
    difficulty: 'intermediate',
    category: 'Warmup',
    exercises: [
      {
        name: "סיבובי זרועות",
        type: 'rep_based',
        values: [8, 10, 12, 15, 18, 20, 22, 25, 28, 30],
        rest_seconds: 0
      },
      {
        name: "לחיצות מעוקבות",
        type: 'rep_based',
        values: [3, 5, 8, 10, 12, 15, 18, 20, 22, 25],
        rest_seconds: 0
      }
    ],
    rounds: 1
  }
];

const mockStrengthExplosive: StrengthExplosive[] = [
  {
    title: "שגרת לחיצות",
    target_attributes: ['push_strength'],
    sets: 3,
    reps: 15,
    rest_between_sets: 60,
    instructions: "לחיצות סטנדרטיות עם שמירה על צורה נכונה",
    difficulty: 'beginner',
    category: 'Strength',
    exercises: [
      {
        name: "לחיצות",
        type: 'rep_based',
        values: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35],
        rest_seconds: 60
      }
    ],
    rounds: 3
  },
  {
    title: "מתחם כוח עליון",
    target_attributes: ['push_strength', 'pull_strength'],
    sets: 4,
    reps: "AMRAP",
    rest_between_sets: 90,
    instructions: "מעגל של לחיצות, משיכות וסחיפות למשך זמן מקסימלי",
    difficulty: 'advanced',
    category: 'Strength',
    exercises: [
      {
        name: "לחיצות",
        type: 'rep_based',
        values: [8, 12, 15, 18, 20, 25, 30, 35, 40, 50],
        rest_seconds: 30
      },
      {
        name: "משיכות",
        type: 'rep_based',
        values: [3, 5, 8, 10, 12, 15, 18, 20, 25, 30],
        rest_seconds: 30
      },
      {
        name: "סחיפות",
        type: 'rep_based',
        values: [5, 8, 10, 15, 20, 25, 30, 35, 40, 50],
        rest_seconds: 90
      }
    ],
    rounds: 4
  }
];

const mockRunningEndurance: RunningEndurance[] = [
  {
    title: "ריצת נפח",
    target_attributes: ['cardio_endurance', 'running_volume'],
    distance: 3000,
    duration: 18,
    intensity: 'moderate',
    instructions: "ריצה במהירות קבועה ונוחה",
    difficulty: 'beginner',
    warmup_required: true,
    cooldown_required: true
  },
  {
    title: "ריצת טמפו",
    target_attributes: ['cardio_endurance'],
    distance: 5000,
    duration: 25,
    intensity: 'high',
    instructions: "ריצה במהירות גבוהה אך שמירה על קצב קבוע",
    difficulty: 'intermediate',
    warmup_required: true,
    cooldown_required: true
  }
];

const mockSpecial: Special[] = [
  {
    title: "אתגר הקומנדו",
    target_attributes: ['push_strength', 'pull_strength', 'cardio_endurance'],
    category: 'tactical',
    duration: 20,
    instructions: "מעגל אינטנסיבי המשלב תרגילי כוח וסיבולת בסגנון קרבי",
    difficulty: 'advanced',
    exercises: [
      {
        name: "לחיצות",
        type: 'rep_based',
        values: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60],
        rest_seconds: 30
      },
      {
        name: "משיכות",
        type: 'rep_based',
        values: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35],
        rest_seconds: 30
      },
      {
        name: "בטן",
        type: 'rep_based',
        values: [15, 20, 25, 30, 35, 40, 50, 60, 70, 80],
        rest_seconds: 30
      },
      {
        name: "ריצה במקום",
        type: 'time_based',
        values: [30, 45, 60, 75, 90, 120, 150, 180, 210, 240],
        rest_seconds: 60
      }
    ],
    rounds: 3
  },
  {
    title: "מבחן כושר בסיסי",
    target_attributes: ['push_strength', 'cardio_endurance'],
    category: 'assessment',
    duration: 15,
    instructions: "בדיקת רמת כושר בסיסית הכוללת לחיצות, בטן וריצה",
    difficulty: 'beginner',
    exercises: [
      {
        name: "לחיצות",
        type: 'rep_based',
        values: [5, 8, 10, 12, 15, 18, 20, 25, 30, 35],
        rest_seconds: 60
      },
      {
        name: "בטן",
        type: 'rep_based',
        values: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60],
        rest_seconds: 60
      }
    ],
    rounds: 2
  }
];

// Mock exercise data
const mockExercises: Exercise[] = [
  {
    id: 'ex_001',
    name: 'לחיצות סטנדרטיות',
    nameEnglish: 'Standard Push-ups',
    category: 'strength',
    difficulty: 'beginner',
    description: 'תרגיל יסוד לחיזוק חזה, כתפיים וטריצפס. שכיבה על הבטן, הידיים ברוחב הכתפיים, דחיפה של הגוף למעלה תוך שמירה על גב ישר.',
    descriptionEnglish: 'Basic exercise for strengthening chest, shoulders and triceps. Lie face down, hands shoulder-width apart, push body up while keeping back straight.',
    formTips: [
      'שמור על גב ישר לאורך כל התרגיל',
      'ירד עד שהמרפקים ביוצרים זווית של 90 מעלות',
      'שמור על הליבה מתוחה',
      'נשימה: שאוף בירידה, נשוף בעלייה'
    ],
    formTipsEnglish: [
      'Keep back straight throughout the exercise',
      'Lower until elbows form a 90-degree angle',
      'Keep core tight',
      'Breathing: inhale on the way down, exhale on the way up'
    ],
    commonMistakes: [
      'גב קעור או מקושת',
      'ישבן מורם גבוה מדי',
      'טווח תנועה חלקי',
      'מרפקים פתוחים רחוק מדי מהגוף'
    ],
    thumbnailUrl: '/exercises/pushup_thumb.jpg',
    images: ['/exercises/pushup_1.jpg', '/exercises/pushup_2.jpg'],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    videoType: 'youtube',
    targetMuscles: ['חזה', 'טריצפס', 'כתפיים קדמיות', 'ליבה'],
    equipment: ['משקל גוף'],
    targetAttributes: ['push_strength']
  },
  {
    id: 'ex_002',
    name: 'משיכות',
    nameEnglish: 'Pull-ups',
    category: 'strength',
    difficulty: 'intermediate',
    description: 'תרגיל מתקדם לחיזוק גב עליון, כתפיים אחוריות וביצפס. תלייה על מוט, משיכה של הגוף למעלה עד שהסנטר מגיע לגובה המוט.',
    descriptionEnglish: 'Advanced exercise for upper back, rear shoulders and biceps. Hang from a bar, pull body up until chin reaches bar level.',
    formTips: [
      'אחיזה מלאה על המוט',
      'משוך עם שרירי הגב, לא רק הזרועות',
      'עלה עד שהסנטר עובר את המוט',
      'ירד באופן מבוקר'
    ],
    formTipsEnglish: [
      'Full grip on the bar',
      'Pull with back muscles, not just arms',
      'Rise until chin passes the bar',
      'Lower in a controlled manner'
    ],
    commonMistakes: [
      'שימוש בתנופה',
      'טווח תנועה חלקי',
      'כתפיים מורמות לאוזניים',
      'חוסר שליטה בירידה'
    ],
    thumbnailUrl: '/exercises/pullup_thumb.jpg',
    images: ['/exercises/pullup_1.jpg', '/exercises/pullup_2.jpg'],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    videoType: 'youtube',
    targetMuscles: ['גב עליון', 'ביצפס', 'כתפיים אחוריות'],
    equipment: ['מתח'],
    targetAttributes: ['pull_strength']
  },
  {
    id: 'ex_003',
    name: 'בטן - סיטאפים',
    nameEnglish: 'Sit-ups',
    category: 'strength',
    difficulty: 'beginner',
    description: 'תרגיל בסיסי לחיזוק שרירי הבטן והליבה. שכיבה על הגב עם ברכיים כפופות, הרמת הגו עד שהידיים נוגעות בברכיים.',
    descriptionEnglish: 'Basic exercise for abdominal and core muscles. Lie on back with knees bent, raise torso until hands touch knees.',
    formTips: [
      'שמור על הרגליים יציבות',
      'השתמש בשרירי הבטן, לא בתנופה',
      'נשימה עמוקה',
      'אל תמשוך בצוואר'
    ],
    formTipsEnglish: [
      'Keep legs stable',
      'Use abdominal muscles, not momentum',
      'Deep breathing',
      'Don\'t pull on neck'
    ],
    commonMistakes: [
      'משיכה של הראש בידיים',
      'שימוש בתנופה',
      'רגליים לא יציבות',
      'גב תחתון מרים מהקרקע'
    ],
    thumbnailUrl: '/exercises/situp_thumb.jpg',
    images: ['/exercises/situp_1.jpg', '/exercises/situp_2.jpg'],
    videoUrl: 'https://www.youtube.com/watch?v=1fbU_MkV7NE',
    videoType: 'youtube',
    targetMuscles: ['בטן', 'ליבה'],
    equipment: ['משקל גוף'],
    targetAttributes: ['push_strength']
  },
  {
    id: 'ex_004',
    name: 'ריצה',
    nameEnglish: 'Running',
    category: 'cardio',
    difficulty: 'beginner',
    description: 'תרגיל אירובי בסיסי לשיפור סיבולת לב-ריאה. ריצה בקצב מתון עד מהיר, תלוי במטרה.',
    descriptionEnglish: 'Basic aerobic exercise for improving cardiovascular endurance. Run at moderate to fast pace, depending on goal.',
    formTips: [
      'נחיתה על אמצע כף הרגל',
      'שמור על גב זקוף',
      'זרועות בזווית 90 מעלות',
      'קצב נשימה סדיר'
    ],
    formTipsEnglish: [
      'Land on midfoot',
      'Keep back upright',
      'Arms at 90-degree angle',
      'Regular breathing pace'
    ],
    commonMistakes: [
      'נחיתה על העקב',
      'גוף מוטה קדימה מדי',
      'זרועות נעות רוחבית',
      'צעדים ארוכים מדי'
    ],
    thumbnailUrl: '/exercises/running_thumb.jpg',
    images: ['/exercises/running_1.jpg', '/exercises/running_2.jpg'],
    videoUrl: 'https://www.youtube.com/watch?v=brFHyOtTwH4',
    videoType: 'youtube',
    targetMuscles: ['רגליים', 'ליבה', 'מערכת לב-ריאה'],
    equipment: ['נעלי ריצה'],
    targetAttributes: ['cardio_endurance', 'running_volume']
  }
];

// Mock user data
let currentUser: User = {
  id: '1',
  name: 'משתמש בדיקה',
  email: 'test@example.com',
  fitness_level: 'intermediate',
  preferred_language: 'hebrew',
  measurement_system: 'metric',
  attributes: {
    push_strength: 5,
    pull_strength: 4,
    cardio_endurance: 6,
    running_volume: 5,
    rucking_volume: 3,
    weight_work: 4
  },
  created_date: new Date().toISOString(),
  last_active: new Date().toISOString()
};

// Workout history storage in localStorage
const WORKOUT_HISTORY_KEY = 'workout_history';

function getStoredWorkoutHistory(): WorkoutHistory[] {
  try {
    const stored = localStorage.getItem(WORKOUT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading workout history from storage:', error);
    return [];
  }
}

function setStoredWorkoutHistory(history: WorkoutHistory[]): void {
  try {
    localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving workout history to storage:', error);
  }
}

// CSV to Entity transformation functions
function transformCSVToWarmup(row: CSVRow): Warmup {
  const exercises = parseJSONField(row.exercises) || [];
  return {
    id: row.id || '',
    title: row.title || '',
    target_attributes: parseJSONField(row.target_attributes) || [],
    duration: parseInt(row.duration) || 0,
    instructions: row.instructions || '',
    difficulty: (row.difficulty?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    category: 'Warmup',
    exercises: exercises,
    rounds: parseInt(row.rounds) || 1
  };
}

function transformCSVToStrengthExplosive(row: CSVRow): StrengthExplosive {
  const exercises = parseJSONField(row.exercises) || [];
  return {
    id: row.id || '',
    title: row.title || '',
    target_attributes: parseJSONField(row.target_attributes) || [],
    sets: parseInt(row.rounds) || 3,
    reps: parseInt(row.reps) || 10,
    rest_between_sets: parseInt(row.rest_between_sets) || 60,
    instructions: row.instructions || '',
    difficulty: (row.difficulty?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    category: 'Strength',
    exercises: exercises,
    rounds: parseInt(row.rounds) || 3
  };
}

function transformCSVToRunningEndurance(row: CSVRow): RunningEndurance {
  const exercises = parseJSONField(row.exercises) || [];
  return {
    id: row.id || '',
    title: row.title || '',
    target_attributes: parseJSONField(row.target_attributes) || [],
    distance: parseInt(row.distance) || 3000,
    duration: parseInt(row.duration) || 20,
    intensity: (row.intensity as 'low' | 'moderate' | 'high') || 'moderate',
    instructions: row.instructions || '',
    difficulty: (row.difficulty?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    warmup_required: row.warmup_required === 'true',
    cooldown_required: row.cooldown_required === 'true',
    category: 'Cardio',
    exercises: exercises,
    rounds: parseInt(row.rounds) || 1
  };
}

function transformCSVToSpecial(row: CSVRow): Special {
  const exercises = parseJSONField(row.exercises) || [];
  return {
    id: row.id || '',
    title: row.title || '',
    target_attributes: parseJSONField(row.target_attributes) || [],
    category: (row.category?.toLowerCase() as 'military_skills' | 'tactical' | 'endurance_challenge' | 'team_building' | 'assessment') || 'tactical',
    duration: parseInt(row.duration) || 20,
    instructions: row.instructions || '',
    difficulty: (row.difficulty?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'elite') || 'intermediate',
    exercises: exercises,
    rounds: parseInt(row.rounds) || 1
  };
}

function transformCSVToExercise(row: CSVRow): Exercise {
  return {
    id: row.id || '',
    name: row.name || '',
    nameEnglish: row.nameEnglish || '',
    category: (row.category?.toLowerCase() as 'warmup' | 'strength' | 'cardio' | 'special') || 'strength',
    difficulty: (row.difficulty?.toLowerCase() as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    description: row.description || '',
    descriptionEnglish: row.descriptionEnglish || '',
    formTips: parseJSONField(row.formTips) || [],
    formTipsEnglish: parseJSONField(row.formTipsEnglish) || [],
    commonMistakes: parseJSONField(row.commonMistakes) || [],
    thumbnailUrl: row.thumbnailUrl || '',
    images: parseJSONField(row.images) || [],
    videoUrl: row.videoUrl || undefined,
    videoType: (row.videoType as 'youtube' | 'local') || 'youtube',
    targetMuscles: parseJSONField(row.targetMuscles) || [],
    equipment: parseJSONField(row.equipment) || [],
    targetAttributes: parseJSONField(row.targetAttributes) || [],
    relatedExercises: parseJSONField(row.relatedExercises) || undefined,
    progressions: parseJSONField(row.progressions) || undefined
  };
}

// Cache storage
const cache = {
  warmups: null as Warmup[] | null,
  strengthExplosive: null as StrengthExplosive[] | null,
  runningEndurance: null as RunningEndurance[] | null,
  special: null as Special[] | null,
  exercises: null as Exercise[] | null,
};

// Data service class
export class DataService {
  // Clear all cached data (useful for refreshing)
  static clearCache(): void {
    cache.warmups = null;
    cache.strengthExplosive = null;
    cache.runningEndurance = null;
    cache.special = null;
    cache.exercises = null;
  }

  // Warmup methods
  static async getWarmups(): Promise<Warmup[]> {
    if (cache.warmups) {
      return cache.warmups;
    }

    try {
      const csvData = await fetchCSV('Warmup.csv');
      cache.warmups = csvData.map(transformCSVToWarmup).filter(warmup => warmup.title);
      return cache.warmups;
    } catch (error) {
      console.error('Error fetching warmups from CSV:', error);
      return [...mockWarmups]; // Fallback to mock data
    }
  }

  // Strength Explosive methods
  static async getStrengthExplosive(): Promise<StrengthExplosive[]> {
    if (cache.strengthExplosive) {
      return cache.strengthExplosive;
    }

    try {
      console.log('Attempting to fetch StrengthExplosive CSV...');
      const csvData = await fetchCSV('StrengthExplosive.csv');
      console.log('CSV data fetched successfully, found:', csvData.length, 'entries');
      cache.strengthExplosive = csvData.map(transformCSVToStrengthExplosive).filter(workout => workout.title);
      return cache.strengthExplosive;
    } catch (error) {
      console.error('Error fetching strength workouts from CSV:', error);
      console.log('Falling back to mock data. Mock data length:', mockStrengthExplosive.length);
      return [...mockStrengthExplosive]; // Fallback to mock data
    }
  }

  // Running Endurance methods
  static async getRunningEndurance(): Promise<RunningEndurance[]> {
    if (cache.runningEndurance) {
      return cache.runningEndurance;
    }

    try {
      const csvData = await fetchCSV('RunningEndurance.csv');
      cache.runningEndurance = csvData.map(transformCSVToRunningEndurance).filter(workout => workout.title);
      return cache.runningEndurance;
    } catch (error) {
      console.error('Error fetching running workouts from CSV:', error);
      return [...mockRunningEndurance]; // Fallback to mock data
    }
  }

  // Special methods
  static async getSpecial(): Promise<Special[]> {
    if (cache.special) {
      return cache.special;
    }

    try {
      console.log('Attempting to fetch Special CSV...');
      const csvData = await fetchCSV('Special.csv');
      console.log('CSV data fetched successfully, found:', csvData.length, 'entries');
      cache.special = csvData.map(transformCSVToSpecial).filter(workout => workout.title);
      return cache.special;
    } catch (error) {
      console.error('Error fetching special workouts from CSV:', error);
      console.log('Falling back to mock data. Mock data length:', mockSpecial.length);
      return [...mockSpecial]; // Fallback to mock data
    }
  }

  // User methods
  static async getCurrentUser(): Promise<User> {
    // If no user exists, create one with default values
    if (!currentUser.id || !currentUser.attributes) {
      currentUser = {
        id: crypto.randomUUID(),
        name: currentUser.name || 'User',
        email: currentUser.email || undefined,
        fitness_level: 'beginner',
        preferred_language: 'hebrew',
        measurement_system: 'metric',
        attributes: {
          push_strength: 5,
          pull_strength: 5,
          cardio_endurance: 5,
          running_volume: 5,
          rucking_volume: 5,
          weight_work: 5
        },
        created_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        goals: [],
        medical_restrictions: []
      };
    }

    // Always ensure attributes exist with default values
    if (!currentUser.attributes) {
      currentUser.attributes = {
        push_strength: 5,
        pull_strength: 5,
        cardio_endurance: 5,
        running_volume: 5,
        rucking_volume: 5,
        weight_work: 5
      };
    }

    // Ensure required fields have values
    currentUser.fitness_level = currentUser.fitness_level || 'beginner';
    currentUser.preferred_language = currentUser.preferred_language || 'hebrew';
    currentUser.measurement_system = currentUser.measurement_system || 'metric';
    
    return Promise.resolve({ ...currentUser });
  }

  static async updateUser(updates: Partial<User>): Promise<User> {
    // Get current user with defaults ensured
    const current = await this.getCurrentUser();
    
    // Merge updates with current user, preserving defaults
    currentUser = { 
      ...current, 
      ...updates,
      // Always preserve attributes structure
      attributes: {
        ...current.attributes,
        ...(updates.attributes || {})
      },
      last_active: new Date().toISOString()
    };
    
    return Promise.resolve({ ...currentUser });
  }

  // Workout History methods
  static async getWorkoutHistory(userEmail: string): Promise<WorkoutHistory[]> {
    const history = getStoredWorkoutHistory()
      .filter((w: WorkoutHistory) => w.userId === userEmail)
      .sort((a: WorkoutHistory, b: WorkoutHistory) => 
        new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
      )
      .slice(0, 25);

    return Promise.resolve(history);
  }

  static async addWorkoutHistory(workout: Omit<WorkoutHistory, 'id'>): Promise<WorkoutHistory> {
    const history = getStoredWorkoutHistory();
    
    const newWorkout: WorkoutHistory = {
      ...workout,
      id: crypto.randomUUID()
    };

    // Add to history
    history.push(newWorkout);

    // Keep only last 25 per user
    const userWorkouts = history.filter((w: WorkoutHistory) => w.userId === workout.userId);
    if (userWorkouts.length > 25) {
      // Remove oldest entries for this user
      const sortedUserWorkouts = userWorkouts.sort((a: WorkoutHistory, b: WorkoutHistory) =>
        new Date(a.completion_date).getTime() - new Date(b.completion_date).getTime()
      );
      const toRemove = sortedUserWorkouts.slice(0, userWorkouts.length - 25);
      const updatedHistory = history.filter((w: WorkoutHistory) =>
        w.userId !== workout.userId || !toRemove.some((r: WorkoutHistory) => r.id === w.id)
      );
      
      setStoredWorkoutHistory(updatedHistory);
    } else {
      setStoredWorkoutHistory(history);
    }

    return Promise.resolve(newWorkout);
  }

  static async deleteWorkoutHistory(id: string): Promise<void> {
    const history = getStoredWorkoutHistory();
    const updatedHistory = history.filter((w: WorkoutHistory) => w.id !== id);
    setStoredWorkoutHistory(updatedHistory);
    return Promise.resolve();
  }

  // Exercise methods
  static async getExercises(): Promise<Exercise[]> {
    if (cache.exercises) {
      return cache.exercises;
    }

    try {
      const csvData = await fetchCSV('Exercises.csv');
      cache.exercises = csvData.map(transformCSVToExercise).filter(ex => ex.name);
      return cache.exercises;
    } catch (error) {
      console.error('Error fetching exercises from CSV:', error);
      return [...mockExercises]; // Fallback to mock data
    }
  }

  static async getExerciseById(id: string): Promise<Exercise | null> {
    const exercises = await this.getExercises();
    return exercises.find(ex => ex.id === id) || null;
  }

  static async getExercisesByCategory(category: string): Promise<Exercise[]> {
    const exercises = await this.getExercises();
    return exercises.filter(ex => ex.category === category);
  }
}