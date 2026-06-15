/**
 * Instruction Generator
 * 
 * Generates military-tone Hebrew instructions matching the Expert 2023 booklet style.
 * Uses commanding language (ציווי), competition framing, and intense motivational tone.
 */

import type { WorkoutFormat } from './workoutFormats';

// ============ EXERCISE INSTRUCTION TEMPLATES ============

const exerciseInstructions: Record<string, { command: string; tips?: string }> = {
  'מתח': {
    command: 'אחיזה מלאה, סנטר מעל המוט. בלי תנופות - עבודה נקייה.',
    tips: 'שלוט בירידה, אל תיפול. גב ישר, כתפיים למטה.'
  },
  'שכיבות סמיכה': {
    command: 'ירידה מבוקרת, עלייה נפיצה. אין חצאים.',
    tips: 'מרפקים צמודים לגוף, גב ישר, ליבה מתוחה.'
  },
  'סמיכה שכיבות': {
    command: 'ירידה מבוקרת, עלייה נפיצה. אין חצאים.',
    tips: 'מרפקים צמודים לגוף, גב ישר, ליבה מתוחה.'
  },
  'סקוואטים': {
    command: 'ירכיים מתחת לברכיים. מי שלא יורד עד הסוף - לא סופרים.',
    tips: 'משקל על העקבים, חזה מורם, ברכיים בכיוון האצבעות.'
  },
  'סקוואט': {
    command: 'ירכיים מתחת לברכיים. מי שלא יורד עד הסוף - לא סופרים.',
    tips: 'משקל על העקבים, חזה מורם, ברכיים בכיוון האצבעות.'
  },
  'מקבילים': {
    command: 'ירידה עד תשעים מעלות, עלייה מלאה. בלי קיצורים.',
    tips: 'גוף זקוף, אל תתנדנד. שליטה מלאה בתנועה.'
  },
  'בטן': {
    command: 'כל חזרה - הגעה מלאה. בלי עצירות.',
    tips: 'שמור על קצב קבוע, נשימה סדירה.'
  },
  'כפיפות בטן': {
    command: 'תעבדו ביחד, קצב קבוצתי. כל חזרה מלאה.',
    tips: 'ידיים על החזה או מאחורי הראש, אל תמשכו בצוואר.'
  },
  'בטן סטטית': {
    command: 'החזיקו. בלי תזוזות, בלי רעידות. זה ראש.',
    tips: 'פלאנק - גוף ישר כמו קרש, ליבה מהודקת.'
  },
  'ריצה': {
    command: 'קצב קבוע, נשימה מבוקרת. אף אחד לא נשאר מאחור.',
    tips: 'נחיתה על אמצע כף הרגל, זרועות בזווית 90 מעלות.'
  },
  'ריצה קלה': {
    command: 'ביחד, קצב קבוצתי. חימום - לא הזמן להוכיח.',
  },
  'ספרינט': {
    command: 'מאפס למקסימום. הכל או כלום.',
    tips: 'הזנקה נמוכה, דחיפה חזקה מהרגליים.'
  },
  'לאנגים': {
    command: 'ברך אחורית כמעט נוגעת ברצפה. צעדים ארוכים.',
    tips: 'גב ישר, ברך קדמית לא חורגת מקו האצבעות.'
  },
  'כתפיים הרמות': {
    command: 'הרמה מבוקרת, החזקה בשנייה למעלה.',
    tips: 'אל תעזרו בתנופה, רק שריר נקי.'
  },
  'זחילה': {
    command: 'בטן ברצפה, מרפקים עובדים. זחילת קרב.',
    tips: 'ראש למטה, תנועה שקטה ומהירה.'
  },
  'דוב הליכת': {
    command: 'ארבע, מהר. ברכיים לא נוגעות ברצפה.',
  },
  'ברווז הליכת': {
    command: 'סקוואט עמוק, הליכה. הרגליים שורפות - זה הסימן שזה עובד.',
  },
  'סרטן הליכת': {
    command: 'אחורה, ידיים ורגליים. בטן למעלה.',
  },
};

// ============ FORMAT-SPECIFIC INSTRUCTIONS ============

/**
 * Generate format-specific opening instructions
 */
export function generateFormatInstructions(format: WorkoutFormat, level: number): string {
  switch (format) {
    case 'pyramid':
      return 'יוצאים לפירמידה. המספרים עולים ויורדים - אתם לא עוצרים.';
    case 'tabata':
      return 'טאבאטה - 20 שניות עבודה, 10 שניות מנוחה. 8 סבבים. תנו הכל.';
    case 'emom':
      return 'EMOM - כל דקה, תרגיל חדש. מה שנשאר מהדקה - מנוחה. תהיו יעילים.';
    case 'for_time':
      return 'זמן רץ. סיימו הכל בזמן הקצר ביותר. מי שמסיים ראשון - מנצח.';
    case 'stations':
      return level >= 7
        ? 'תחנות כוח. 1:50 עבודה, 10 שניות מעבר. בלי הפסקות מיותרות.'
        : 'תחנות כוח. 1:30 עבודה, 15 שניות מעבר. עובדים ברצף.';
    case 'partner_interval':
      return 'עבודה בזוגות. אחד עובד, השני מחזיק. מחליפים בהזנקה.';
    case 'competition':
      return 'תחרות אישית. תוצאות נרשמות. תנו הכל.';
    case 'amrap':
      return 'AMRAP - סבבים שיותר כמה. הזמן רץ, אתם לא עוצרים.';
    case 'rounds':
    default:
      return 'עבודה בסבבים. כל סבב - מלא, חזק, בלי ויתורים.';
  }
}

// ============ EXERCISE-SPECIFIC INSTRUCTIONS ============

/**
 * Generate commanding instruction for a specific exercise
 */
export function generateExerciseInstruction(
  exerciseName: string,
  reps?: number,
  duration?: number,
  distance?: number,
  isCompetition?: boolean
): string {
  const base = exerciseInstructions[exerciseName];
  const parts: string[] = [];

  if (base) {
    parts.push(base.command);
  }

  if (isCompetition) {
    if (reps) {
      parts.push(`${reps} חזרות. מי שמסיים ראשון - מנצח.`);
    } else if (duration) {
      parts.push(`${duration} שניות. מי שמחזיק הכי הרבה - מנצח.`);
    }
  }

  return parts.join(' ');
}

/**
 * Get exercise tips for proper form
 */
export function getExerciseTips(exerciseName: string): string | undefined {
  return exerciseInstructions[exerciseName]?.tips;
}

// ============ PHASE INSTRUCTIONS ============

/**
 * Generate phase-specific header instructions for combat classic workouts
 */
export function generatePhaseInstruction(
  phase: 'warmup' | 'sprints' | 'main' | 'strength' | 'closing',
  level: number
): string {
  switch (phase) {
    case 'warmup':
      return 'חימום - מפרקים, ריצה קלה, הכנת הגוף. אף אחד לא מתחיל קר.';
    case 'sprints':
      return level >= 7
        ? 'ספרינטים - חימום, הגעה סדרי, ואז תחרות. מאה אחוז.'
        : 'ספרינטים - חימום, הגעה סדרי. בונים מהירות.';
    case 'main':
      return 'גוף מרכזי - כאן עובדים. בלי חצאים, בלי תירוצים.';
    case 'strength':
      return 'תחנות כוח. עובדים לפי שעון. מה שנשאר - מנוחה.';
    case 'closing':
      return 'סיום - בטן, מתיחות. מסכמים את האימון.';
  }
}

// ============ MOTIVATION TALKS (חנתר שיחות) ============

const motivationTalks = {
  pre_workout: [
    'היום עובדים קשה. מי שבא לפה - בא לתת הכל. אין מקום לחצאים.',
    'אימון הוא לא מקום נוח. זה המקום שבו אתם גדלים. תקבלו את זה.',
    'כל תרגיל - הזדמנות להשתפר. אל תבזבזו אפילו חזרה אחת.',
  ],
  mid_workout: [
    'אני רואה שעובדים. עכשיו תעלו עוד הילוך. אתם יכולים יותר.',
    'חצי אימון מאחורינו. עכשיו מתחילה העבודה האמיתית.',
    'מי שעייף - זה סימן טוב. עכשיו מתחילה הצמיחה.',
    'הגוף רוצה לעצור. הראש אומר להמשיך. תשמעו לראש.',
  ],
  post_workout: [
    'עבודה מצוינת. אימון חזק. נתראה באימון הבא חזקים יותר.',
    'סיימתם. עכשיו מנוחה נכונה, אוכל נכון, ושינה. זה חלק מהאימון.',
    'מי שהיה כאן היום - השקיע בעצמו. זה מה שמפריד בין טובים למצוינים.',
  ],
  between_phases: [
    'דקה מנוחה. תנשמו, תשתו, תתרכזו. השלב הבא מתחיל עכשיו.',
    'מעבר לחלק הבא. תתארגנו, תתמקדו.',
    'שלב חדש. תאפסו את הראש ותתחילו חזק.',
  ],
};

/**
 * Get a random motivation talk for a specific phase
 */
export function getMotivationTalk(
  phase: 'pre_workout' | 'mid_workout' | 'post_workout' | 'between_phases'
): string {
  const talks = motivationTalks[phase];
  return talks[Math.floor(Math.random() * talks.length)];
}

/**
 * Get all motivation talks for a phase (for UI to cycle through)
 */
export function getAllMotivationTalks(
  phase: 'pre_workout' | 'mid_workout' | 'post_workout' | 'between_phases'
): string[] {
  return [...motivationTalks[phase]];
}

// ============ COMPETITION FRAMING ============

/**
 * Generate competition-style instruction text
 */
export function generateCompetitionInstruction(
  type: 'sprint' | 'max_reps' | 'endurance' | 'team' | 'for_time',
  exerciseName?: string
): string {
  switch (type) {
    case 'sprint':
      return 'תחרות ספרינטים - הגעה סדרי. ראשון מנצח, אחרון עושה עשר שכיבות.';
    case 'max_reps':
      return exerciseName
        ? `אליפות ${exerciseName}. מקסימום חזרות. תוצאות נרשמות.`
        : 'אליפות - מקסימום חזרות. תוצאות נרשמות.';
    case 'endurance':
      return 'מי שמחזיק הכי הרבה - מנצח. אחרון שנשאר - אלוף.';
    case 'team':
      return 'עבודה צוותית. הצוות חזק כמו החוליה החלשה. עזרו אחד לשני.';
    case 'for_time':
      return 'זמן רץ. מי שמסיים ראשון - מנצח. הזמן לא מחכה.';
  }
}

// ============ REST PERIOD INSTRUCTIONS ============

/**
 * Generate rest period instruction text
 */
export function generateRestInstruction(restSeconds: number, nextExercise?: string): string {
  const parts: string[] = [];

  if (restSeconds <= 15) {
    parts.push('מעבר מהיר.');
  } else if (restSeconds <= 30) {
    parts.push('חצי דקה. תנשמו.');
  } else if (restSeconds <= 60) {
    parts.push('דקה מנוחה. תנשמו, תשתו מים.');
  } else {
    parts.push(`${Math.round(restSeconds / 60)} דקות מנוחה. תנוחו נכון.`);
  }

  if (nextExercise) {
    parts.push(`הבא: ${nextExercise}.`);
  }

  return parts.join(' ');
}

// ============ WORKOUT TITLE GENERATORS ============

/**
 * Generate a booklet-style workout title in Hebrew
 */
export function generateWorkoutTitle(
  type: string,
  format?: string,
  mainExercise?: string
): string {
  switch (type) {
    case 'combat_classic':
      return 'אימון מלא - סגנון אקספרט';
    case 'pyramid':
      return mainExercise ? `פירמידה - ${mainExercise}` : 'אימון פירמידה';
    case 'tsokuon':
      return 'צוקון - עליות עם שק';
    case 'competition_day':
      return 'יום אליפויות';
    case 'masa':
      return 'מסע ציוד + כוח';
    case 'tabata_finisher':
      return 'אימון טאבאטה';
    default:
      return 'אימון';
  }
}
