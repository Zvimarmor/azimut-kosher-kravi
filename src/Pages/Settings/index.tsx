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
  const { currentUser, login, loginWithEmail, registerWithEmail, logout, isAuthenticating, authError, clearAuthError } = useAuth();
  const { theme, setTheme } = useTheme();
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = async (provider: 'google') => {
    try {
      clearAuthError();
      await login(provider);
      // Note: login() will redirect, so this code won't execute
    } catch (error: unknown) {
      console.error('Login failed:', error);
      // Error will be displayed via authError from context
    }
  };

  const handleEmailAuth = async () => {
    try {
      clearAuthError();
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // Success - reset form
      setShowEmailLogin(false);
      setEmail('');
      setPassword('');
    } catch (error: unknown) {
      console.error('Email auth failed:', error);
      // Error will be displayed via authError from context
    }
  };

  const handleLogout = async () => {
    try {
      clearAuthError();
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Error will be displayed via authError from context
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
              {/* Error Display */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-red-800">{authError}</p>
                    </div>
                    <button
                      onClick={clearAuthError}
                      className="text-red-800 hover:text-red-900"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State During OAuth Redirect */}
              {isAuthenticating && !currentUser && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-blue-800">
                      {language === 'hebrew' ? 'מתחבר...' : 'Signing in...'}
                    </p>
                  </div>
                </div>
              )}

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
                    disabled={isAuthenticating}
                    className="bg-red-500 hover:bg-red-600 text-white w-full btn-press"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isAuthenticating ?
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

                  {!showEmailLogin ? (
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        onClick={() => handleLogin('google')}
                        disabled={isAuthenticating}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 w-full btn-press"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {isAuthenticating ?
                          (language === 'hebrew' ? 'מתחבר...' : 'Signing in...') :
                          (language === 'hebrew' ? 'התחבר עם Google' : 'Sign in with Google')
                        }
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">
                            {language === 'hebrew' ? 'או' : 'or'}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowEmailLogin(true)}
                        disabled={isAuthenticating}
                        className="bg-idf-olive hover:bg-idf-olive/90 text-white w-full btn-press"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {language === 'hebrew' ? 'התחבר עם אימייל' : 'Sign in with Email'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder={language === 'hebrew' ? 'אימייל' : 'Email'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-idf-olive"
                        dir={language === 'hebrew' ? 'rtl' : 'ltr'}
                      />
                      <input
                        type="password"
                        name="password"
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        placeholder={language === 'hebrew' ? 'סיסמה' : 'Password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-idf-olive"
                        dir={language === 'hebrew' ? 'rtl' : 'ltr'}
                      />

                      <Button
                        onClick={handleEmailAuth}
                        disabled={isAuthenticating || !email || !password}
                        className="bg-idf-olive hover:bg-idf-olive/90 text-white w-full btn-press"
                      >
                        {isAuthenticating ?
                          (language === 'hebrew' ? 'מתחבר...' : 'Signing in...') :
                          (isRegister ?
                            (language === 'hebrew' ? 'הירשם' : 'Register') :
                            (language === 'hebrew' ? 'התחבר' : 'Sign in')
                          )
                        }
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setIsRegister(!isRegister)}
                          variant="outline"
                          className="flex-1 btn-press"
                        >
                          {isRegister ?
                            (language === 'hebrew' ? 'כבר רשום? התחבר' : 'Already registered? Sign in') :
                            (language === 'hebrew' ? 'משתמש חדש? הירשם' : 'New user? Register')
                          }
                        </Button>

                        <Button
                          onClick={() => {
                            setShowEmailLogin(false);
                            setEmail('');
                            setPassword('');
                            setIsRegister(false);
                          }}
                          variant="outline"
                          className="flex-1 btn-press"
                        >
                          {language === 'hebrew' ? 'ביטול' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  )}
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
    </div>
  );
}