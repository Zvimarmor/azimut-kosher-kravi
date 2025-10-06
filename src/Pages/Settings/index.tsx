import React, { useContext, useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ArrowLeft, Settings as SettingsIcon, Globe, Bell, Shield, Info, User, LogOut, LogIn, Palette, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { useAuth } from "../../features/auth/AuthContext";
import { useTheme } from "../../components/shared/ThemeContext";
import { User as UserEntity } from "../../Entities/User";

export default function SettingsPage() {
  const context = useContext(LanguageContext);
  const { language, setLanguage } = context || { language: 'hebrew', setLanguage: () => {} };
  const { currentUser, login, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric');

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

  const toggleMeasurementSystem = async () => {
    const newSystem = measurementSystem === 'metric' ? 'imperial' : 'metric';
    setMeasurementSystem(newSystem);
    try {
      await UserEntity.update({ measurement_system: newSystem });
    } catch (error) {
      console.error('Error updating measurement system:', error);
      // Revert on error
      setMeasurementSystem(measurementSystem);
    }
  };

  const handleLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log('Settings: Starting login with provider:', provider);
      setIsLoading(true);
      await login(provider);
      console.log('Settings: Login function completed');
    } catch (error: any) {
      console.error('Settings: Login failed:', {
        code: error?.code,
        message: error?.message,
        fullError: error
      });
      alert('Login failed. Please try again.');
    } finally {
      console.log('Settings: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <Card className="bg-white card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-idf-olive" />
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
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{currentUser.displayName}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="bg-red-500 hover:bg-red-600 text-white w-full btn-press"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoading ?
                      (language === 'hebrew' ? 'מתנתק...' : 'Signing out...') :
                      (language === 'hebrew' ? 'התנתק' : 'Sign Out')
                    }
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    {language === 'hebrew' ?
                      'התחבר כדי לשמור את ההתקדמות שלך ולסנכרן בין מכשירים' :
                      'Sign in to save your progress and sync across devices'
                    }
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={() => handleLogin('google')}
                      disabled={isLoading}
                      className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 w-full btn-press"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {isLoading ?
                        (language === 'hebrew' ? 'מתחבר...' : 'Signing in...') :
                        (language === 'hebrew' ? 'התחבר עם Google' : 'Sign in with Google')
                      }
                    </Button>
                    <Button
                      onClick={() => handleLogin('facebook')}
                      disabled={isLoading}
                      className="bg-[#1877F2] hover:bg-[#166FE5] text-white w-full btn-press"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {isLoading ?
                        (language === 'hebrew' ? 'מתחבר...' : 'Signing in...') :
                        (language === 'hebrew' ? 'התחבר עם Facebook' : 'Sign in with Facebook')
                      }
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
            <CardContent>
              <Button onClick={toggleMeasurementSystem} className="bg-idf-olive text-light-sand w-full btn-press">
                {measurementSystem === 'metric'
                  ? (language === 'hebrew' ? 'עבור למערכת אימפריאלית (מיילים)' : 'Switch to Imperial (miles)')
                  : (language === 'hebrew' ? 'עבור למערכת מטרית (ק"מ)' : 'Switch to Metric (km)')
                }
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {measurementSystem === 'metric'
                  ? (language === 'hebrew' ? 'כרגע: מטרי (ק"מ, ק"ג)' : 'Current: Metric (km, kg)')
                  : (language === 'hebrew' ? 'כרגע: אימפריאלי (מייל, פאונד)' : 'Current: Imperial (miles, lbs)')
                }
              </p>
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
            <CardContent className="text-center text-gray-600">
              <p> {language === 'hebrew' ? 'אזימוט כושר קרבי גרסא 1.0.0' : 'Azimut Kosher Kravi Version 1.0.0'}</p>
              
              <p className="text-sm"> {language === 'hebrew' ?
                'פלטפורמת אימון בהשראת יחידות מיוחדות' :
                'A training platform inspired by special forces units'
              }</p>
              <p className="text-xs mt-4">{language === 'hebrew' ? 'לזכר אופק בכר ושילה הר-אבן' : 'In memory of Ofek Bechar and Shilo Har-Even'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}