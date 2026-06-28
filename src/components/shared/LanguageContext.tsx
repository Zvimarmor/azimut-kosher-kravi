import { createContext } from "react";

export type SupportedLanguage = 'hebrew' | 'english' | 'spanish';

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
    createWorkoutDesc: "תוכנית אימון מלאה ומותאמת אישית",
    selectWorkout: "בחר אימון",
    selectWorkoutDesc: "בחר אימון קיים",
    heritage: "תרבות ומורשת",
    militaryChat: "יועץ הכנה צבאית",
    militaryChatDesc: "ייעוץ מקצועי מבוסס AI",

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
    loginRequiredMessage: "נדרשת התחברות לחשבון על מנת לגשת ליועץ ההכנה הצבאית.",
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
    exerciseLibrary: "ספריית תרגילים",
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
    or: "או",

    // Settings
    languageLabel: "שפה",
    languageHebrew: "עברית",
    languageEnglish: "English",
    languageSpanish: "Español",
    measurementUnits: "יחידות מדידה",
    metric: "מטרי (ק\"מ, ק\"ג)",
    imperial: "אימפריאלי (מייל, פאונד)",
    colorTheme: "ערכת צבעים",
    themeDefault: "ברירת מחדל (בהיר)",
    themeRanger: "רינג'ר ירוק (כהה)",
    userAccount: "חשבון משתמש",
    signIn: "התחבר / הירשם",
    signOut: "התנתק",
    aboutSection: "אודות",
    version: "גרסה",
    signInDesc: "התחבר כדי לשמור את ההתקדמות שלך ולסנכרן בין מכשירים",
  },
  english: {
    appName: "Azimut Kosher Kravi",
    aboutUs: "About Us",
    language: "Español",
    workoutHistory: "Workout History",
    settings: "Settings",
    memorial: "In memory of Ofek Becher and Shilo Har-Even z\"l\n© All rights reserved",
    freeUser: "Free User",
    proUser: "Pro User",

    // Home page
    createWorkout: "Create Workout",
    createWorkoutDesc: "Full personalized training program",
    selectWorkout: "Select Workout",
    selectWorkoutDesc: "Choose existing workout",
    heritage: "Heritage & Culture",
    militaryChat: "Military Preparation Advisor",
    militaryChatDesc: "AI-powered professional guidance",

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
    loginRequiredMessage: "Authentication is required to access the Military Preparation Advisor.",
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
    exerciseLibrary: "Exercise Library",
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
    or: "or",

    // Settings
    languageLabel: "Language",
    languageHebrew: "עברית",
    languageEnglish: "English",
    languageSpanish: "Español",
    measurementUnits: "Measurement Units",
    metric: "Metric (km, kg)",
    imperial: "Imperial (miles, lbs)",
    colorTheme: "Color Theme",
    themeDefault: "Default (Light)",
    themeRanger: "Ranger Green (Dark)",
    userAccount: "User Account",
    signIn: "Login / Sign Up",
    signOut: "Sign Out",
    aboutSection: "About",
    version: "Version",
    signInDesc: "Sign in to save your progress and sync across devices",
  },
  spanish: {
    appName: "Azimut Kósher Kravi",
    aboutUs: "Sobre Nosotros",
    language: "עברית",
    workoutHistory: "Historial de Entrenamientos",
    settings: "Configuración",
    memorial: "En memoria de Ofek Becher y Shilo Har-Even z\"l\n© Todos los derechos reservados",
    freeUser: "Usuario Gratuito",
    proUser: "Usuario Pro",

    // Home page
    createWorkout: "Crear Entrenamiento",
    createWorkoutDesc: "Plan de entrenamiento completo y personalizado",
    selectWorkout: "Seleccionar Entrenamiento",
    selectWorkoutDesc: "Elige un entrenamiento existente",
    heritage: "Herencia y Cultura",
    militaryChat: "Asesor Militar",
    militaryChatDesc: "Orientación profesional con IA",

    // Common UI elements
    back: "Atrás",
    next: "Siguiente",
    continue: "Continuar",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    yes: "Sí",
    no: "No",

    // Workout related
    workout: "Entrenamiento",
    workouts: "Entrenamientos",
    exercise: "Ejercicio",
    exercises: "Ejercicios",
    duration: "Duración",
    difficulty: "Dificultad",
    instructions: "Instrucciones",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    searchWorkout: "Buscar entrenamiento...",
    selectWorkoutTitle: "Seleccionar Entrenamiento",
    noWorkoutsFound: "No se encontraron entrenamientos",
    tryDifferentSearch: "Prueba una búsqueda diferente o cambia la categoría.",
    allWorkouts: "Todos",
    strengthWorkouts: "Fuerza",
    specialWorkouts: "Especiales",
    strength: "Fuerza",
    special: "Especial",

    // Time and dates
    minutes: "minutos",
    seconds: "segundos",
    today: "Hoy",
    yesterday: "Ayer",

    // Login/Auth
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    loginRequired: "Inicio de sesión requerido",
    loginRequiredMessage: "Se requiere autenticación para acceder al Asesor de Preparación Militar.",
    loginWithGoogle: "Iniciar sesión con Google",
    loginWithFacebook: "Iniciar sesión con Facebook",

    // Categories and search
    categoryStrength: "Fuerza",
    categorySpecial: "Especial",

    // User status
    guestUser: "Usuario Invitado",

    // Workout Setup
    workoutSetup: "Configuración del Entrenamiento",
    workoutSetupDesc: "Marca las condiciones y el equipo disponibles (opcional)",
    equipment: "Equipo",
    environment: "Entorno",
    temperature: "Temperatura",
    timeOfDay: "Hora del día",
    rain: "Lluvia",
    rememberEnvironment: "Recordar este entorno",

    // Equipment options
    weight: "Peso",
    sandbag: "Saco de arena",

    // Environment options
    dune: "Duna",
    track: "400m superficie recta",
    pullupBar: "Barra de dominadas",
    dipStation: "Paralelas",

    // Temperature options
    hot: "Caliente",
    mild: "Templado",
    cold: "Frío",

    // Time of day options
    morning: "Mañana",
    noon: "Mediodía",
    evening: "Tarde",

    // Rain options
    rainYes: "Lluvia",
    rainNo: "Sin lluvia",

    // Heritage page
    heritageQuote: "A Shilo Har-Even, que tuve el privilegio de tener como comandante en Agoz, tenía una frase constante: La cultura gana las guerras.",
    randomEntry: "Entrada aleatoria",
    pastBattles: "Batallas pasadas de Israel",
    fallenSoldiers: "Soldados caídos de las FDI",
    militaryConcepts: "Conceptos militares y tácticos",
    philosophyJudaism: "Filosofía y Judaísmo en asuntos militares",

    // Exercise Library
    exerciseLibrary: "Biblioteca de Ejercicios",
    exerciseDetails: "Detalles del ejercicio",
    formTips: "Consejos de forma",
    commonMistakes: "Errores comunes",
    targetMuscles: "Músculos objetivo",
    relatedExercises: "Ejercicios relacionados",
    watchVideo: "Ver video",
    searchExercises: "Buscar ejercicios...",
    allCategories: "Todos",

    // Group Training
    groupTraining: "Entrenamiento en grupo",
    inviteOthers: "Invitar a otros",
    joinWorkout: "Unirse al entrenamiento",
    sessionCode: "Código de sesión",
    enterSessionCode: "Ingresar código de sesión",
    createSession: "Crear nueva sesión",
    waitingForParticipants: "Esperando participantes",
    participants: "Participantes",
    maxParticipants: "Hasta 4 participantes",
    leaveSession: "Salir de la sesión",
    waitingForOthers: "Esperando a otros participantes...",
    allCompleted: "¡Todos completaron!",
    copyCode: "Copiar código",
    codeCopied: "¡Código copiado!",
    or: "o",

    // Settings
    languageLabel: "Idioma",
    languageHebrew: "עברית",
    languageEnglish: "English",
    languageSpanish: "Español",
    measurementUnits: "Unidades de medida",
    metric: "Métrico (km, kg)",
    imperial: "Imperial (millas, libras)",
    colorTheme: "Tema de color",
    themeDefault: "Predeterminado (Claro)",
    themeRanger: "Verde Ranger (Oscuro)",
    userAccount: "Cuenta de usuario",
    signIn: "Iniciar sesión / Registrarse",
    signOut: "Cerrar sesión",
    aboutSection: "Acerca de",
    version: "Versión",
    signInDesc: "Inicia sesión para guardar tu progreso y sincronizar entre dispositivos",
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  allTexts: typeof allTexts;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
