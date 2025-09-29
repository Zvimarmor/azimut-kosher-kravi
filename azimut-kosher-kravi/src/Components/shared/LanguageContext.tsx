import { createContext } from "react";

const allTexts = {
  hebrew: {
    appName: "AI כושר קרבי",
    aboutUs: "קצת עלינו",
    language: "English",
    workoutHistory: "היסטוריית אימונים",
    settings: "הגדרות",
    memorial: "לזכר אופק בכר ושילה הר-אבן ז״ל\nכל הזכויות שמורות ©",
    freeUser: "משתמש חינמי",
    proUser: "משתמש פרו",

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
  },
  english: {
    appName: "Azimut Kosher Kravi",
    aboutUs: "About Us",
    language: "עברית",
    workoutHistory: "Workout History",
    settings: "Settings",
    memorial: "In memory of Ofek Becher and Shila Har-Even z\"l\n© All rights reserved",
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
  }
};

interface LanguageContextType {
  language: 'hebrew' | 'english';
  setLanguage: (language: 'hebrew' | 'english') => void;
  allTexts: typeof allTexts;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);