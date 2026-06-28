import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { ChevronRight, Shuffle, Swords, Heart, Shield, BookOpen, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.25 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, x: -16, scale: 0.97 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
  }
};

const categoryAccents = [
  'border-l-tactical-accent',
  'border-l-amber-500',
  'border-l-rose-400',
  'border-l-sky-400',
  'border-l-purple-400',
];

const categoryBadgeColors = [
  'text-tactical-accent',
  'text-amber-400',
  'text-rose-400',
  'text-sky-400',
  'text-purple-400',
];

export default function Heritage() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = context?.allTexts[language];

  const isRTL = language === 'hebrew';

  const heritageButtons = [
    { title: t?.randomEntry || "ערך אקראי", category: "all", icon: Shuffle,
      desc: language === 'hebrew' ? 'גלה ערך אקראי מכל הקטגוריות' : language === 'spanish' ? 'Descubre una entrada aleatoria de todas las categorías' : 'Discover a random entry from all categories' },
    { title: t?.pastBattles || "קרבות ישראל מהעבר", category: "PastBattles", icon: Swords,
      desc: language === 'hebrew' ? 'קרבות ומבצעים משמעותיים' : language === 'spanish' ? 'Batallas y operaciones significativas' : 'Significant battles and operations' },
    { title: t?.fallenSoldiers || "חללי צה״ל", category: "FallenSoldiers", icon: Heart,
      desc: language === 'hebrew' ? 'לזכרם של הלוחמים שנפלו' : language === 'spanish' ? 'En memoria de los soldados caídos' : 'In memory of fallen soldiers' },
    { title: t?.militaryConcepts || "מושגים צבאיים וטקטיים", category: "MilitaryConcepts", icon: Shield,
      desc: language === 'hebrew' ? 'טקטיקות ומושגים מבצעיים' : language === 'spanish' ? 'Tácticas y conceptos operacionales' : 'Tactics and operational concepts' },
    { title: t?.philosophyJudaism || "פילוסופיה ויהדות בנושאי צבא", category: "PhilosophyAndJudaism", icon: BookOpen,
      desc: language === 'hebrew' ? 'חיבור בין ערכים, אמונה ולחימה' : language === 'spanish' ? 'Conexión entre valores, fe y combate' : 'Connection between values, faith and combat' },
  ];

  return (
    <div
      className="flex flex-col px-5 py-5 text-tactical-text"
      style={{ height: 'calc(100vh - 57px)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header row */}
      <motion.div
        className="flex items-center gap-4 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={createPageUrl("Home")}>
          <button className="p-2 rounded-xl glass-card press-scale hover:glow-border transition-all duration-200">
            <ArrowRight className="w-5 h-5 text-tactical-muted" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-tactical-text">
          {t?.heritage || 'Heritage & Culture'}
        </h1>
      </motion.div>

      {/* Hero Quote — Editorial Style */}
      <motion.div
        className="glass-card-elevated rounded-2xl px-5 py-6 mb-5 relative overflow-hidden flex-shrink-0"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Accent bar */}
        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-4 bottom-4 w-1 rounded-full bg-tactical-accent/50`} />
        {/* Gradient shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-tactical-accent/5 to-transparent pointer-events-none rounded-2xl" />

        <p className={`text-sm text-tactical-muted leading-relaxed italic ${isRTL ? 'text-right pr-4' : 'text-left pl-4'} relative z-10`}>
          {t?.heritageQuote || "Culture conquers wars."}
        </p>
      </motion.div>

      {/* Category Cards */}
      <motion.div
        className="flex-grow flex flex-col justify-center gap-2.5 max-w-md mx-auto w-full"
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
                  className={`glass-card hover-lift rounded-xl p-4 press-scale transition-all duration-300 flex items-center justify-between border-l-2 ${categoryAccents[index]}`}
                >
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className={`font-semibold text-sm text-tactical-text group-hover:text-tactical-glow transition-colors duration-300 ${categoryBadgeColors[index]}`}>
                      {button.title}
                    </h3>
                    <p className="text-xs text-tactical-muted mt-0.5 line-clamp-1">
                      {button.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-tactical-accent/70 group-hover:text-tactical-accent transition-all duration-300" />
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
