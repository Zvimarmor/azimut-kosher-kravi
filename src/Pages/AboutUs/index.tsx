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
    ourStory: "הסיפור שלנו",
    storyContent: "[כאן יבוא הטקסט שלך על הסיפור של הפרויקט - תוכל להוסיף אותו מאוחר יותר]",
    ourMission: "המשימה שלנו",
    missionContent: "[כאן יבוא הטקסט על המשימה והחזון של הפרויקט]",
    theTeam: "הצוות",
    teamContent: "[כאן יבוא מידע על הצוות]",
    memorial: "פרויקט זה מוקדש לזכרם של אופק בכר ושילה הר-אבן ז\"ל. יהי זכרם ברוך.",
    backHome: "חזרה למסך הבית"
  },
  english: {
    title: "About Us",
    subtitle: "Built with a passion for combat fitness.",
    ourStory: "Our Story",
    storyContent: "[Your text about the project's story will go here - you can add it later]",
    ourMission: "Our Mission",
    missionContent: "[Your text about the mission and vision of the project]",
    theTeam: "The Team",
    teamContent: "[Information about the team will go here]",
    memorial: "This project is lovingly dedicated to the memory of Ofek Becher and Shilo Har-Even. May their memory be a blessing.",
    backHome: "Back to Home"
  }
};

export default function AboutUs() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const currentTexts = pageTexts[language];

  return (
    <div className="min-h-screen px-6 py-8" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <div className={`flex items-center gap-4 mb-8 ${language === 'hebrew' ? 'flex-row-reverse' : ''}`}>
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="text-[var(--color-4)] hover:text-white hover:bg-[var(--color-2)]/30 p-2">
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
          {/* Our Story Section */}
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <h2 className="text-xl font-bold text-[var(--color-3)] mb-4 text-center">
              {currentTexts.ourStory}
            </h2>
            <div className="text-[var(--color-4)] leading-relaxed whitespace-pre-line">
              {currentTexts.storyContent}
            </div>
            {/* Placeholder for images - you can add them later */}
            {/* <div className="mt-4 flex justify-center">
              <img src="/path/to/image.jpg" alt="Story" className="rounded-lg max-w-full" />
            </div> */}
          </div>

          {/* Our Mission Section */}
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <h2 className="text-xl font-bold text-[var(--color-3)] mb-4 text-center">
              {currentTexts.ourMission}
            </h2>
            <div className="text-[var(--color-4)] leading-relaxed whitespace-pre-line">
              {currentTexts.missionContent}
            </div>
          </div>

          {/* The Team Section */}
          <div className="p-6 rounded-xl bg-black/30 backdrop-blur-md border border-[var(--color-2)]/30">
            <h2 className="text-xl font-bold text-[var(--color-3)] mb-4 text-center">
              {currentTexts.theTeam}
            </h2>
            <div className="text-[var(--color-4)] leading-relaxed whitespace-pre-line">
              {currentTexts.teamContent}
            </div>
            {/* Placeholder for team images */}
            {/* <div className="mt-4 grid grid-cols-2 gap-4">
              <img src="/path/to/team1.jpg" alt="Team member" className="rounded-lg" />
              <img src="/path/to/team2.jpg" alt="Team member" className="rounded-lg" />
            </div> */}
          </div>

          {/* Memorial Section */}
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