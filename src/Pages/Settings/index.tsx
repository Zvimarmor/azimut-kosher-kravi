import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { ArrowRight, Settings as SettingsIcon, Globe, Info, Palette, Ruler, User as UserIcon, LogOut, LogIn, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext, type SupportedLanguage } from "../../components/shared/LanguageContext";
import { User as UserEntity } from "../../Entities/User";
import { useAuth } from "../../features/auth/useAuth";
import { LoginModal } from "../../features/auth/components/LoginModal";

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } }
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};

const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string; flag: string; nativeLabel: string }[] = [
  { value: 'hebrew', label: 'עברית', flag: '🇮🇱', nativeLabel: 'עברית' },
  { value: 'english', label: 'English', flag: '🇺🇸', nativeLabel: 'English' },
  { value: 'spanish', label: 'Español', flag: '🇪🇸', nativeLabel: 'Español' },
];

export default function SettingsPage() {
  const context = useContext(LanguageContext);
  const { language, setLanguage } = context || { language: 'hebrew' as SupportedLanguage, setLanguage: () => {} };
  const t = context?.allTexts[language];
  const { currentUser, userProfile, logout } = useAuth();
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isRTL = language === 'hebrew';

  useEffect(() => {
    const loadMeasurementSystem = async () => {
      try {
        const user = await UserEntity.me();
        setMeasurementSystem(user.measurement_system || 'metric');
      } catch (error) {
        console.error('Error loading measurement system:', error);
      }
    };
    loadMeasurementSystem();
  }, []);

  const handleMeasurementChange = async (system: 'metric' | 'imperial') => {
    if (measurementSystem === system) return;
    setMeasurementSystem(system);
    UserEntity.update({ measurement_system: system }).catch(console.error);
  };

  return (
    <div
      className="px-5 py-6 text-tactical-text overflow-y-auto"
      style={{ height: 'calc(100vh - 57px)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-xl glass-card press-scale hover:glow-border transition-all duration-200">
              <ArrowRight className="w-5 h-5 text-tactical-muted" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-tactical-accent" />
            <h1 className="text-2xl font-bold text-tactical-text">{t?.settings || 'Settings'}</h1>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* User Account Section */}
          <motion.div variants={sectionVariants} className="glass-card-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-tactical-accent/10">
              <UserIcon className="w-5 h-5 text-tactical-accent" />
              <h2 className="font-bold text-tactical-text">{t?.userAccount || 'User Account'}</h2>
            </div>
            <div className="p-5">
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-tactical-accent/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-7 h-7 text-tactical-bg" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-tactical-text truncate">
                        {userProfile?.displayName || currentUser.displayName}
                      </p>
                      <p className="text-sm text-tactical-muted truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md bg-tactical-accent/10 text-tactical-accent border border-tactical-accent/20">
                        {userProfile?.subscription.tier === 'free'
                          ? t?.freeUser
                          : t?.proUser}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full py-3 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:border-red-400/50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t?.signOut || 'Sign Out'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-tactical-muted leading-relaxed">
                    {t?.signInDesc || 'Sign in to save your progress and sync across devices'}
                  </p>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-3 glow-border"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {t?.signIn || 'Login / Sign Up'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Language Section */}
          <motion.div variants={sectionVariants} className="glass-card-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-tactical-accent/10">
              <Globe className="w-5 h-5 text-tactical-accent" />
              <h2 className="font-bold text-tactical-text">{t?.languageLabel || 'Language'}</h2>
            </div>
            <div className="p-4 space-y-2">
              {LANGUAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 press-scale
                    ${language === opt.value
                      ? 'gradient-accent text-tactical-bg glow-border'
                      : 'glass-card text-tactical-text hover:border-tactical-accent/30'}`}
                >
                  <span className="text-xl">{opt.flag}</span>
                  <span className="flex-1 text-left font-semibold">{opt.nativeLabel}</span>
                  {language === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Measurement Units */}
          <motion.div variants={sectionVariants} className="glass-card-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-tactical-accent/10">
              <Ruler className="w-5 h-5 text-tactical-accent" />
              <h2 className="font-bold text-tactical-text">{t?.measurementUnits || 'Measurement Units'}</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {(['metric', 'imperial'] as const).map(system => (
                <button
                  key={system}
                  onClick={() => handleMeasurementChange(system)}
                  className={`flex flex-col items-center gap-1 px-3 py-3.5 rounded-xl transition-all duration-200 press-scale
                    ${measurementSystem === system
                      ? 'gradient-accent text-tactical-bg glow-border'
                      : 'glass-card text-tactical-text hover:border-tactical-accent/30'}`}
                >
                  <span className="text-lg">{system === 'metric' ? '📏' : '🦅'}</span>
                  <span className="text-xs font-bold">
                    {system === 'metric'
                      ? (t?.metric || 'Metric')
                      : (t?.imperial || 'Imperial')}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Color Theme */}
          <motion.div variants={sectionVariants} className="glass-card-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-tactical-accent/10">
              <Palette className="w-5 h-5 text-tactical-accent" />
              <h2 className="font-bold text-tactical-text">{t?.colorTheme || 'Color Theme'}</h2>
            </div>
            <div className="p-4">
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl gradient-accent text-tactical-bg glow-border press-scale"
              >
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-tactical-bg/40" />
                  <div className="w-4 h-4 rounded-full bg-tactical-bg/20" />
                </div>
                <span className="text-sm font-bold flex-1 text-left">Tactical Dark</span>
                <Check className="w-4 h-4" />
              </button>
              <p className="text-xs text-tactical-muted text-center mt-3 opacity-60">
                {language === 'hebrew' ? 'ערכת הצבעים הטקטית הכהה פעילה' :
                  language === 'spanish' ? 'Tema oscuro táctico activo' :
                  'Tactical dark theme is active'}
              </p>
            </div>
          </motion.div>

          {/* About */}
          <motion.div variants={sectionVariants} className="glass-card-elevated rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-tactical-accent/10">
              <Info className="w-5 h-5 text-tactical-accent" />
              <h2 className="font-bold text-tactical-text">{t?.aboutSection || 'About'}</h2>
            </div>
            <div className="p-5 text-center space-y-2">
              <p className="text-tactical-text font-semibold">{t?.appName || 'Azimut Kosher Kravi'}</p>
              <p className="text-sm text-tactical-muted">{t?.version || 'Version'} 1.0.0</p>
              <p className="text-xs text-tactical-muted/60 mt-3 leading-relaxed whitespace-pre-line">
                {t?.memorial}
              </p>
              <Link to={createPageUrl("AboutUs")} className="block mt-4">
                <Button variant="outline" className="w-full hover:glow-border">
                  {t?.aboutUs || 'About Us'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          language={language === 'spanish' ? 'english' : language}
        />
      )}
    </div>
  );
}
