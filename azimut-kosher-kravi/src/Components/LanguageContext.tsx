import { createContext } from "react";

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);