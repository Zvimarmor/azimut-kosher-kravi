import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";

const pageTexts = {
  hebrew: {
    title: "אימונים מיוחדים",
    subtitle: "עמוד בבנייה",
    message: "פיצ'ר זה עדיין בפיתוח. עובדים קשה כדי להביא לכם תוכניות אימון טקטיות מתקדמות!",
    backHome: "חזרה למסך הבית"
  },
  english: {
    title: "Special Workouts",
    subtitle: "Page Under Construction",
    message: "This feature is still in development. We're working hard to bring you advanced tactical training programs!",
    backHome: "Back to Home"
  }
};

export default function SpecialWorkouts() {
  const { language } = useContext(LanguageContext);
  const currentTexts = pageTexts[language];
  
  return (
    <div className="min-h-screen px-6 py-8" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <div className={`flex items-center gap-4 mb-8 ${language === 'hebrew' ? 'flex-row-reverse' : ''}`}>
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon" className="text-[var(--color-4)] hover:text-white hover:bg-[var(--color-2)]/30">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className={language === 'hebrew' ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[var(--color-4)]">{currentTexts.title}</h1>
            <p className="text-[var(--color-3)]/70 text-sm">{currentTexts.subtitle}</p>
          </div>
        </div>

        <div className="text-center p-10 rounded-xl bg-black/30 border border-[var(--color-2)]/30">
          <Construction className="w-16 h-16 text-[var(--color-5)] mx-auto mb-6" />
          <p className="text-[var(--color-3)]/80 text-lg">{currentTexts.message}</p>
           <Link to={createPageUrl("Home")} className="block pt-8">
             <Button variant="outline" className="border-[var(--color-2)]/50 text-[var(--color-3)] hover:bg-[var(--color-2)]/30 hover:text-[var(--color-4)] font-medium py-2 px-6 rounded-xl">
                {currentTexts.backHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}