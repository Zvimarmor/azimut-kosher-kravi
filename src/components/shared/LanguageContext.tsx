import { createContext } from "react";

export const allTexts = {
  hebrew: {
    appName: "אזימוט כושר קרבי",
    aboutUs: "קצת עלינו",
    language: "English",
    workoutHistory: "היסטוריית אימונים",
    settings: "הגדרות",
    memorial: "לזכר אופק בכר ושילה הר-אבן ז״ל\nכל הזכויות שמורות ©",
    freeUser: "משתמש חינמי",
    proUser: "משתמש pro",

    // Home page
    createWorkout: "צור אימון",
    createWorkoutDesc: "אימון ארוך/מותאם אישית",
    selectWorkout: "בחר אימון",
    selectWorkoutDesc: "בחר אימון קיים",
    heritage: "תרבות ומורשת",
    militaryChat: "צ׳אט ייעוץ",
    militaryChatDesc: "צ׳אט מבוסס AI להתייעצות",

    // Common UI elements
    back: "חזור",
    next: "הבא",
    continue: "המשך",
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    edit: "ערוך",
    close: "סגור",
    yes: "כן",
    no: "לא",

    // Workout related
    workout: "אימון",
    workouts: "אימונים",
    exercise: "תרגיל",
    exercises: "תרגילים",
    duration: "משך",
    difficulty: "קושי",
    instructions: "הוראות",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    searchWorkout: "חפש אימון...",
    selectWorkoutTitle: "בחר אימון",
    noWorkoutsFound: "לא נמצאו אימונים",
    tryDifferentSearch: "נסה חיפוש אחר או שנה את הקטגוריה.",
    allWorkouts: "הכל",
    strengthWorkouts: "כוח",
    specialWorkouts: "מיוחדים",
    strength: "כוח",
    special: "מיוחד",

    // Time and dates
    minutes: "דקות",
    seconds: "שניות",
    today: "היום",
    yesterday: "אתמול",

    // Login/Auth
    login: "התחברות",
    logout: "התנתקות",
    loginRequired: "נדרש חשבון משתמש",
    loginRequiredMessage: "על מנת לשאול שאלות בצ'אט הצבאי, יש להתחבר תחילה לחשבון המשתמש שלך.",
    loginWithGoogle: "התחבר עם Google",
    loginWithFacebook: "התחבר עם Facebook",

    // Categories and search
    categoryStrength: "כוח",
    categorySpecial: "מיוחד",

    // User status
    guestUser: "משתמש אורח",

    // Workout Setup
    workoutSetup: "הגדרת אימון",
    workoutSetupDesc: "סמן את התנאים והציוד הזמינים",
    equipment: "ציוד",
    environment: "סביבה",
    temperature: "טמפרטורה",
    timeOfDay: "זמן ביום",
    rain: "גשם",
    rememberEnvironment: "זכור סביבה זו",

    // Equipment options
    weight: "משקל",
    sandbag: "שק חול מלא",

    // Environment options
    dune: "דיונה",
    track: "400מ משטח ישר",
    pullupBar: "מתח",
    dipStation: "מקבילים",

    // Temperature options
    hot: "חם",
    mild: "נעים",
    cold: "קר",

    // Time of day options
    morning: "בוקר",
    noon: "צהריים",
    evening: "ערב",

    // Rain options
    rainYes: "גשם",
    rainNo: "לא גשם",

    // Heritage page
    heritageQuote: "לשילה הר-אבן, שזכיתי והיה המפקד שלי בפלגת לוחמים באגוז, היה משפט קבוע: תרבות מנצחת מלחמות.",
    randomEntry: "ערך אקראי",
    pastBattles: "קרבות ישראל מהעבר",
    fallenSoldiers: "חללי צה״ל",
    militaryConcepts: "מושגים צבאיים וטקטיים",
    philosophyJudaism: "פילוסופיה ויהדות בנושאי צבא",

    // Exercise Library
    exerciseLibrary: "הסבר תרגילים",
    exerciseDetails: "פרטי תרגיל",
    formTips: "טיפים לביצוע נכון",
    commonMistakes: "טעויות נפוצות",
    targetMuscles: "שרירים מעורבים",
    relatedExercises: "תרגילים קשורים",
    watchVideo: "צפה בסרטון",
    searchExercises: "חפש תרגיל...",
    allCategories: "הכל",

    // Group Training
    groupTraining: "אימון קבוצתי",
    inviteOthers: "הזמן אחרים להצטרף",
    joinWorkout: "הצטרף לאימון",
    sessionCode: "קוד הצטרפות",
    enterSessionCode: "הזן קוד הצטרפות",
    createSession: "צור סשן חדש",
    waitingForParticipants: "ממתין למשתתפים",
    participants: "משתתפים",
    maxParticipants: "עד 4 משתתפים",
    leaveSession: "עזוב סשן",
    waitingForOthers: "ממתין לשאר המשתתפים...",
    allCompleted: "כולם סיימו!",
    copyCode: "העתק קוד",
    codeCopied: "הקוד הועתק!",
  },
  english: {
    appName: "Azimut Kosher Kravi",
    aboutUs: "About Us",
    language: "עברית",
    workoutHistory: "Workout History",
    settings: "Settings",
    memorial: "In memory of Ofek Becher and Shilo Har-Even z\"l\n© All rights reserved",
    freeUser: "Free User",
    proUser: "Pro User",

    // Home page
    createWorkout: "Create Workout",
    createWorkoutDesc: "Long/personalized workout",
    selectWorkout: "Select Workout",
    selectWorkoutDesc: "Choose existing workout",
    heritage: "Heritage & Culture",
    militaryChat: "Military Consultation",
    militaryChatDesc: "AI-powered consultation chat",

    // Common UI elements
    back: "Back",
    next: "Next",
    continue: "Continue",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    yes: "Yes",
    no: "No",

    // Workout related
    workout: "Workout",
    workouts: "Workouts",
    exercise: "Exercise",
    exercises: "Exercises",
    duration: "Duration",
    difficulty: "Difficulty",
    instructions: "Instructions",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    searchWorkout: "Search workout...",
    selectWorkoutTitle: "Select Workout",
    noWorkoutsFound: "No workouts found",
    tryDifferentSearch: "Try a different search or change category.",
    allWorkouts: "All",
    strengthWorkouts: "Strength",
    specialWorkouts: "Special",
    strength: "Strength",
    special: "Special",

    // Time and dates
    minutes: "minutes",
    seconds: "seconds",
    today: "Today",
    yesterday: "Yesterday",

    // Login/Auth
    login: "Login",
    logout: "Logout",
    loginRequired: "Login Required",
    loginRequiredMessage: "To ask questions in the military chat, please log in to your account first.",
    loginWithGoogle: "Login with Google",
    loginWithFacebook: "Login with Facebook",

    // Categories and search
    categoryStrength: "Strength",
    categorySpecial: "Special",

    // User status
    guestUser: "Guest User",

    // Workout Setup
    workoutSetup: "Workout Setup",
    workoutSetupDesc: "Mark available conditions and equipment (optional)",
    equipment: "Equipment",
    environment: "Environment",
    temperature: "Temperature",
    timeOfDay: "Time of Day",
    rain: "Rain",
    rememberEnvironment: "Remember this environment",

    // Equipment options
    weight: "Weight",
    sandbag: "Sandbag",

    // Environment options
    dune: "Dune",
    track: "400m Straight Surface",
    pullupBar: "Pull-up Bar",
    dipStation: "Parallel Bars",

    // Temperature options
    hot: "Hot",
    mild: "Mild",
    cold: "Cold",

    // Time of day options
    morning: "Morning",
    noon: "Noon",
    evening: "Evening",

    // Rain options
    rainYes: "Rain",
    rainNo: "No Rain",

    // Heritage page
    heritageQuote: "To Shilo Har-Even, who I was privileged to have as my commander at Agoz, had a constant saying: Culture conquers wars.",
    randomEntry: "Random Entry",
    pastBattles: "Israel's Past Battles",
    fallenSoldiers: "Fallen IDF Soldiers",
    militaryConcepts: "Military and Tactical Concepts",
    philosophyJudaism: "Philosophy and Judaism in Military Matters",

    // Exercise Library
    exerciseLibrary: "Exercise Explanation",
    exerciseDetails: "Exercise Details",
    formTips: "Form Tips",
    commonMistakes: "Common Mistakes",
    targetMuscles: "Target Muscles",
    relatedExercises: "Related Exercises",
    watchVideo: "Watch Video",
    searchExercises: "Search exercises...",
    allCategories: "All",

    // Group Training
    groupTraining: "Group Training",
    inviteOthers: "Invite Others to Join",
    joinWorkout: "Join Workout",
    sessionCode: "Session Code",
    enterSessionCode: "Enter Session Code",
    createSession: "Create New Session",
    waitingForParticipants: "Waiting for Participants",
    participants: "Participants",
    maxParticipants: "Up to 4 Participants",
    leaveSession: "Leave Session",
    waitingForOthers: "Waiting for other participants...",
    allCompleted: "Everyone Completed!",
    copyCode: "Copy Code",
    codeCopied: "Code Copied!",
  }
};

interface LanguageContextType {
  language: 'hebrew' | 'english';
  setLanguage: (language: 'hebrew' | 'english') => void;
  allTexts: typeof allTexts;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);