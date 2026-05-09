import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { ChevronRight, Shuffle, Swords, Heart, Shield, BookOpen, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } }
};

const categoryAccents = [
  'border-l-tactical-accent',
  'border-l-amber-500',
  'border-l-rose-400',
  'border-l-sky-400',
  'border-l-purple-400',
];

export default function Heritage() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = context?.allTexts[language];

  const heritageButtons = [
    { title: t?.randomEntry || "ערך אקראי", category: "all", icon: Shuffle },
    { title: t?.pastBattles || "קרבות ישראל מהעבר", category: "PastBattles", icon: Swords },
    { title: t?.fallenSoldiers || "חללי צה״ל", category: "FallenSoldiers", icon: Heart },
    { title: t?.militaryConcepts || "מושגים צבאיים וטקטיים", category: "MilitaryConcepts", icon: Shield },
    { title: t?.philosophyJudaism || "פילוסופיה ויהדות בנושאי צבא", category: "PhilosophyAndJudaism", icon: BookOpen }
  ];

  return (
    <div 
      className="flex flex-col px-6 py-6 text-tactical-text" 
      style={{ height: 'calc(100vh - 57px)' }}
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      {/* Back Button */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={createPageUrl("Home")}>
          <button className="p-2 rounded-xl glass-card press-scale hover:glow-border transition-all duration-200">
            <ArrowRight className="w-5 h-5 text-tactical-muted" />
          </button>
        </Link>
      </motion.div>

      {/* Hero Quote — Editorial Style */}
      <motion.div 
        className="glass-card-elevated rounded-2xl px-6 py-8 mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Accent line */}
        <div className="absolute right-0 top-4 bottom-4 w-1 rounded-full bg-tactical-accent/40" />
        
        <p className="text-base text-tactical-muted leading-relaxed italic pr-4">
          {t?.heritageQuote || "לשילה הר-אבן, שזכיתי והיה המפקד שלי בפלגת לוחמים באגוז, היה משפט קבוע: תרבות מנצחת מלחמות."}
        </p>
      </motion.div>

      {/* Category Cards */}
      <motion.div 
        className="flex-grow flex flex-col justify-center gap-3 max-w-md mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {heritageButtons.map((button, index) => {
          const IconComponent = button.icon;
          
          return (
            <motion.div key={button.category} variants={cardVariants}>
              <Link 
                to={createPageUrl(`heritage-entry?category=${button.category}`)} 
                className="block group"
              >
                <div 
                  className={`glass-card hover-lift rounded-xl p-5 press-scale transition-all duration-300 flex items-center justify-between border-l-2 ${categoryAccents[index]}`}
                >
                  <div className="flex-1 text-right">
                    <h3 className="font-semibold text-base text-tactical-text group-hover:text-tactical-glow transition-colors duration-300">
                      {button.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mr-2">
                    <IconComponent className="w-5 h-5 text-tactical-accent/60 group-hover:text-tactical-accent transition-all duration-300" />
                    <ChevronRight className="w-4 h-4 text-tactical-muted/40 group-hover:text-tactical-accent/60 transition-colors duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}