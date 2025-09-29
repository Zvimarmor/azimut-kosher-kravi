import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { ChevronRight, Shuffle, Swords, Heart, Shield, BookOpen, ArrowLeft } from "lucide-react";

const heritageButtons = [
  { title: "ערך אקראי", category: "all", icon: Shuffle },
  { title: "קרבות ישראל מהעבר", category: "PastBattles", icon: Swords },
  { title: "חללי צה״ל", category: "FallenSoldiers", icon: Heart },
  { title: "מושגים צבאיים וטקטיים", category: "MilitaryConcepts", icon: Shield },
  { title: "פילוסופיה ויהדות בנושאי צבא", category: "PhilosophyAndJudaism", icon: BookOpen }
];

export default function Heritage() {
  const { language } = useContext(LanguageContext);

  return (
    <div 
      className="flex flex-col px-6 py-8 text-dark-olive" 
      style={{ height: 'calc(100vh - 73px)' }}
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
       <div className="flex items-center justify-between mb-4">
        <Link to={createPageUrl("Home")}>
          <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
            <ArrowLeft className="w-6 h-6 text-dark-olive" />
          </button>
        </Link>
      </div>
      
      <p className="text-sm text-center text-gray-500 mb-6">
        לשילה הר-אבן, שזכיתי והיה המפקד שלי בפלגת לוחמים באגוז, היה משפט קבוע: תרבות מנצחת מלחמות.
      </p>

      <div className="flex-grow flex flex-col justify-center gap-4 max-w-md mx-auto w-full">
        {heritageButtons.map((button) => {
          const IconComponent = button.icon;
          
          return (
            <Link 
              key={button.category} 
              to={createPageUrl(`heritage-entry?category=${button.category}`)} 
              className="block"
            >
              <div 
                className="rounded-xl p-5 card-shadow btn-press transition-all duration-200 bg-idf-olive text-light-sand flex items-center justify-between"
              >
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-lg">
                    {button.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 mr-2">
                  <IconComponent className="w-6 h-6 text-light-sand opacity-90" />
                  <ChevronRight className="w-5 h-5 text-light-sand opacity-70" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}