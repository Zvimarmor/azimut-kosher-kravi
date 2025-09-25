import { createContext } from "react";

const allTexts = {
  hebrew: {
    appName: "AI כושר קרבי",
    aboutUs: "קצת עלינו",
    language: "English",
    workoutHistory: "היסטוריית אימונים",
    settings: "הגדרות",
    memorial: "לזכר אופק בכר ושילה הר-אבן\n© כל הזכויות שמורות",
    freeUser: "משתמש חינמי",
    proUser: "משתמש פרו",
  },
  english: {
    appName: "AI Kosher Kravi",
    aboutUs: "About Us",
    language: "עברית",
    workoutHistory: "Workout History",
    settings: "Settings",
    memorial: "In memory of Ofek Becher and Shila Har-Even\n© All rights reserved",
    freeUser: "Free User",
    proUser: "Pro User",
  }
};

interface LanguageContextType {
  language: 'hebrew' | 'english';
  setLanguage: (language: 'hebrew' | 'english') => void;
  allTexts: typeof allTexts;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);