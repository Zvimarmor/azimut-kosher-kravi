import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings as SettingsIcon, Globe, Bell, Shield, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LanguageContext } from "@/components/LanguageContext";

export default function SettingsPage() {
  const { language, setLanguage } = useContext(LanguageContext);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hebrew' ? 'english' : 'hebrew');
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
                <Globe className="w-5 h-5 text-idf-olive" />
                שפה
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
                <Info className="w-5 h-5 text-idf-olive" />
                אודות
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              <p>TACTICAL FIT v1.0</p>
              <p className="text-sm">פלטפורמת אימון בהשראת יחידות מיוחדות.</p>
              <p className="text-xs mt-4">לזכר אופק בכר ושילה הר-אבן</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}