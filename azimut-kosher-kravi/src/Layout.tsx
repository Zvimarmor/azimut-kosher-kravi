import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { User, Globe, History, Settings, Info, Menu } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageContext } from "@/components/shared/LanguageContext";

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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'hebrew' | 'english'>('hebrew');
  const { currentUser } = useAuth();

  const currentTexts = allTexts[language];

  // Define CSS color variables based on the new palette
  const militaryPalette = `
    :root {
      --color-bg-primary: #000000;
      --color-bg-neutral: #F5F5DC;
      --color-accent-primary: #4B5320;
      --color-accent-secondary: #6B8E23;
      --color-highlight: #A6C36F;
      --color-text-light: #F8F8F8;
      --color-text-dark: #4B5320;
    }
  `;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, allTexts }}>
      <div className={`min-h-screen bg-[var(--color-bg-neutral)] ${language === 'hebrew' ? 'rtl' : 'ltr'} flex flex-col`}>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&display=swap');
            
            ${militaryPalette}

            * {
              font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .card-shadow {
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }
            
            .btn-press {
              transition: transform 0.1s ease;
            }
            
            .btn-press:active {
              transform: scale(0.95);
            }

            /* Mobile viewport fix */
            html, body, #root {
              height: 100vh;
              height: 100dvh;
              overflow-x: hidden;
            }
          `}
        </style>
        
        <header className="bg-[var(--color-accent-primary)] relative z-50 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded bg-[var(--color-bg-neutral)] flex items-center justify-center btn-press card-shadow">
                    <Menu className="w-6 h-6 text-[var(--color-text-dark)]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-72 bg-[var(--color-bg-neutral)] border border-gray-200 card-shadow"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center">
                          <User className="w-6 h-6 text-[var(--color-text-light)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[var(--color-text-dark)]">
                          {currentUser?.displayName || (language === 'hebrew' ? 'משתמש אורח' : 'Guest User')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentUser ? currentTexts.proUser : currentTexts.freeUser}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuItem 
                    className="text-[var(--color-text-dark)] hover:bg-gray-200 cursor-pointer"
                    onClick={() => setLanguage(language === 'hebrew' ? 'english' : 'hebrew')}
                  >
                    <Globe className="w-4 h-4 mr-3" />
                    <div className="flex items-center gap-2">
                      <span>{language === 'hebrew' ? '🇺🇸' : '🇮🇱'}</span>
                      <span>{currentTexts.language}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-[var(--color-text-dark)] hover:bg-gray-200 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("WorkoutHistory")}
                  >
                    <History className="w-4 h-4 mr-3" />
                    <span>{currentTexts.workoutHistory}</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem 
                    className="text-[var(--color-text-dark)] hover:bg-gray-200 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("AboutUs")}
                  >
                    <Info className="w-4 h-4 mr-3" />
                    <span>{currentTexts.aboutUs}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-[var(--color-text-dark)] hover:bg-gray-200 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("Settings")}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    <span>{currentTexts.settings}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to={createPageUrl("Home")}
                className="btn-press"
              >
                <img
                  src="/logo.png"
                  alt="AI Kosher Kravi Logo"
                  className="w-14 h-14 rounded-lg"
                />
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </LanguageContext.Provider>
  );
}