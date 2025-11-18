import React, { useContext, useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, Settings as SettingsIcon, Globe, Info, Palette, Ruler, User as UserIcon, LogOut, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { useTheme } from "../../components/shared/ThemeContext";
import { User as UserEntity } from "../../Entities/User";
import { useAuth } from "../../features/auth/useAuth";
import { LoginModal } from "../../features/auth/components/LoginModal";

export default function SettingsPage() {
  const context = useContext(LanguageContext);
  const { language, setLanguage } = context || { language: 'hebrew', setLanguage: () => {} };
  const { theme, setTheme } = useTheme();
  const { currentUser, userProfile, logout } = useAuth();
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load measurement system preference on mount
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

  const toggleLanguage = () => {
    setLanguage((prev: 'hebrew' | 'english') => prev === 'hebrew' ? 'english' : 'hebrew');
  };

  return (
    <div className="p-6 text-dark-olive" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
              <ArrowLeft className="w-6 h-6 text-dark-olive" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-7 h-7 text-idf-olive" />
              הגדרות
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Account Card */}
          <Card className="bg-white card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserIcon className="w-5 h-5 text-idf-olive" />
                {language === 'hebrew' ? 'חשבון משתמש' : 'User Account'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {currentUser.photoURL && (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {!currentUser.photoURL && (
                      <div className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{userProfile?.displayName || currentUser.displayName}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          console.log('👤 User tier:', userProfile?.subscription.tier);
                          const tier = userProfile?.subscription.tier;
                          if (tier === 'free') {
                            return language === 'hebrew' ? 'משתמש חינם' : 'Free User';
                          } else if (tier === 'premium') {
                            return language === 'hebrew' ? 'משתמש פרימיום' : 'Premium User';
                          } else if (tier === 'pro') {
                            return language === 'hebrew' ? 'משתמש Pro' : 'Pro User';
                          } else {
                            return language === 'hebrew' ? 'משתמש חינמי' : 'Free User';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white w-full btn-press"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'hebrew' ? 'התנתק' : 'Sign Out'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    {language === 'hebrew'
                      ? 'התחבר כדי לשמור את ההתקדמות שלך ולסנכרן בין מכשירים'
                      : 'Sign in to save your progress and sync across devices'}
                  </p>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-idf-olive hover:bg-idf-olive/90 text-white w-full btn-press"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {language === 'hebrew' ? 'התחבר / הירשם' : 'Login / Sign Up'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Language Card */}
          <Card className="bg-white card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-idf-olive" />
                {language === 'hebrew' ? 'שפה' : 'Language'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={toggleLanguage} className="bg-idf-olive text-light-sand w-full btn-press">
                {language === 'hebrew' ? 'Switch to English' : 'עבור לעברית'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ruler className="w-5 h-5 text-idf-olive" />
                {language === 'hebrew' ? 'יחידות מדידה' : 'Measurement Units'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => {
                  if (measurementSystem !== 'metric') {
                    setMeasurementSystem('metric');
                    UserEntity.update({ measurement_system: 'metric' }).catch(console.error);
                  }
                }}
                variant={measurementSystem === 'metric' ? 'default' : 'outline'}
                className="w-full btn-press"
              >
                {language === 'hebrew' ? 'מטרי (ק"מ, ק"ג)' : 'Metric (km, kg)'}
              </Button>
              <Button
                onClick={() => {
                  if (measurementSystem !== 'imperial') {
                    setMeasurementSystem('imperial');
                    UserEntity.update({ measurement_system: 'imperial' }).catch(console.error);
                  }
                }}
                variant={measurementSystem === 'imperial' ? 'default' : 'outline'}
                className="w-full btn-press"
              >
                {language === 'hebrew' ? 'אימפריאלי (מייל, פאונד)' : 'Imperial (miles, lbs)'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5 text-idf-olive" />
                {language === 'hebrew' ? 'ערכת צבעים' : 'Color Theme'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setTheme('default')}
                variant={theme === 'default' ? 'default' : 'outline'}
                className="w-full btn-press"
              >
                {language === 'hebrew' ? 'ברירת מחדל (בהיר)' : 'Default (Light)'}
              </Button>
              <Button
                onClick={() => setTheme('ranger-green')}
                variant={theme === 'ranger-green' ? 'default' : 'outline'}
                className="w-full btn-press"
              >
                {language === 'hebrew' ? 'רינג\'ר ירוק (כהה)' : 'Ranger Green (Dark)'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5 text-idf-olive" />
                {language === 'hebrew' ? 'אודות' : 'About'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p> {language === 'hebrew' ? 'אזימוט כושר קרבי גרסא 1.0.0' : 'Azimut Kosher Kravi Version 1.0.0'}</p>

                <p className="text-sm"> {language === 'hebrew' ?
                  'פלטפורמת אימון בהשראת יחידות מיוחדות' :
                  'A training platform inspired by special forces units'
                }</p>
                <p className="text-xs mt-4">{language === 'hebrew' ? 'לזכר אופק בכר ושילה הר-אבן' : 'In memory of Ofek Bechar and Shilo Har-Even'}</p>
              </div>
              <Link to={createPageUrl("AboutUs")}>
                <Button variant="outline" className="w-full btn-press border-idf-olive text-idf-olive hover:bg-idf-olive hover:text-light-sand">
                  {language === 'hebrew' ? 'קצת עלינו' : 'About Us'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          language={language}
        />
      )}
    </div>
  );
}