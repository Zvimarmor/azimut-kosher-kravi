import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Shield, Heart } from "lucide-react";
import { LanguageContext } from "../../components/shared/LanguageContext";

const pageTexts = {
  hebrew: {
    title: "קצת עלינו",
    subtitle: "נבנה באהבה ובתשוקה לכושר קרבי.",
    content: "האפליקציה הזו היא פלטפורמת אימונים בהשראת יחידות עילית, שנועדה ללוחמים הדורשים מעצמם מצוינות. כל אימון, כל סיפור מורשת וכל פיצ'ר נבנו כדי לתמוך בך במסע שלך.",
    memorial: "פרויקט זה מוקדש באהבה לזכרם של אופק בכר ושילה הר-אבן ז\"ל. יהי זכרם ברוך.",
    backHome: "חזרה למסך הבית"
  },
  english: {
    title: "About Us",
    subtitle: "Built with a passion for combat fitness.",
    content: "This application is an elite, military-inspired training platform designed for warriors who demand excellence. Every workout, heritage story, and feature is built to support you on your journey.",
    memorial: "This project is lovingly dedicated to the memory of Ofek Becher and Shilo Har-Even. May their memory be a blessing.",
    backHome: "Back to Home"
  }
};

export default function AboutUs() {
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
            <h1 className="text-2xl font-bold text-[var(--color-4)] flex items-center gap-2">
              <Shield className="w-7 h-7 text-[var(--color-3)]" />
              {currentTexts.title}
            </h1>
            <p className="text-[var(--color-3)]/70 text-sm">{currentTexts.subtitle}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <p className="text-[var(--color-4)] leading-relaxed text-center">
              {currentTexts.content}
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-black/40 border border-[var(--color-2)]/30">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-[var(--color-3)]/80 text-base leading-relaxed">{currentTexts.memorial}</p>
          </div>

          <Link to={createPageUrl("Home")} className="block pt-4">
             <Button variant="outline" className="w-full border-[var(--color-2)]/50 text-[var(--color-3)] hover:bg-[var(--color-2)]/30 hover:text-[var(--color-4)] font-medium py-3 rounded-xl">
                {currentTexts.backHome}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}