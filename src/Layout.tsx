import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./lib/utils";
import { User, Globe, History, Settings, Info, Menu, Dumbbell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { LanguageContext, allTexts, type SupportedLanguage } from "./components/shared/LanguageContext";
import { useAuth } from "./features/auth/useAuth";

const LANGUAGE_CYCLE: SupportedLanguage[] = ['hebrew', 'english', 'spanish'];

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  hebrew: '🇮🇱',
  english: '🇺🇸',
  spanish: '🇪🇸',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'english' || saved === 'hebrew' || saved === 'spanish') ? saved as SupportedLanguage : 'hebrew';
  });

  const { currentUser, userProfile, logout } = useAuth();

  React.useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const cycleLanguage = () => {
    const currentIndex = LANGUAGE_CYCLE.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGE_CYCLE.length;
    setLanguage(LANGUAGE_CYCLE[nextIndex]);
  };

  const currentTexts = allTexts[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, allTexts }}>
      <div className={`min-h-screen tactical-bg ${language === 'hebrew' ? 'rtl' : 'ltr'} flex flex-col`}>

        <header className="glass-header relative z-50 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-xl bg-tactical-surface border border-tactical-accent/25 flex items-center justify-center press-scale hover:border-tactical-accent/50 hover:glow-border transition-all duration-200">
                    <Menu className="w-5 h-5 text-tactical-text" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 glass-card-elevated border-tactical-accent/10"
                >
                  <div className="px-4 py-3 border-b border-tactical-accent/10">
                    <div className="flex items-center gap-3">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-tactical-accent/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                          <User className="w-6 h-6 text-tactical-bg" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-tactical-text">
                          {userProfile?.displayName || currentUser?.displayName || currentTexts.guestUser}
                        </p>
                        <p className="text-sm text-tactical-muted">
                          {userProfile?.subscription.tier === 'free'
                            ? currentTexts.freeUser
                            : currentTexts.proUser}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Language Cycle Button */}
                  <DropdownMenuItem
                    className="text-tactical-text hover:bg-tactical-accent/10 cursor-pointer"
                    onClick={cycleLanguage}
                  >
                    <Globe className="w-4 h-4 mr-3 text-tactical-accent" />
                    <div className="flex items-center gap-2 flex-1">
                      <span>{LANGUAGE_FLAGS[language]}</span>
                      <span className="flex-1">{currentTexts.language}</span>
                      <span className="text-xs text-tactical-muted px-2 py-0.5 rounded glass-card">
                        {LANGUAGE_FLAGS[LANGUAGE_CYCLE[(LANGUAGE_CYCLE.indexOf(language) + 1) % LANGUAGE_CYCLE.length]]}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-tactical-text hover:bg-tactical-accent/10 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("WorkoutHistory")}
                  >
                    <History className="w-4 h-4 mr-3 text-tactical-accent" />
                    <span>{currentTexts.workoutHistory}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-tactical-text hover:bg-tactical-accent/10 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("ExerciseLibrary")}
                  >
                    <Dumbbell className="w-4 h-4 mr-3 text-tactical-accent" />
                    <span>{currentTexts.exerciseLibrary}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-tactical-text hover:bg-tactical-accent/10 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("AboutUs")}
                  >
                    <Info className="w-4 h-4 mr-3 text-tactical-accent" />
                    <span>{currentTexts.aboutUs}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-tactical-text hover:bg-tactical-accent/10 cursor-pointer"
                    onClick={() => window.location.href = createPageUrl("Settings")}
                  >
                    <Settings className="w-4 h-4 mr-3 text-tactical-accent" />
                    <span>{currentTexts.settings}</span>
                  </DropdownMenuItem>

                  {currentUser && (
                    <>
                      <div className="border-t border-tactical-accent/10 my-1"></div>
                      <DropdownMenuItem
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                        onClick={logout}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>{currentTexts.logout}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to={createPageUrl("Home")}
                className="press-scale"
              >
                <img
                  src="/logo.png"
                  alt="Azimut Kosher Kravi Logo"
                  className="w-12 h-12 rounded-xl ring-2 ring-tactical-accent/20 hover:ring-tactical-accent/40 transition-all duration-300"
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
