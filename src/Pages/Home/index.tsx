import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { ChevronRight, BookOpen, MessageCircle, Activity, Dumbbell } from "lucide-react";
import { User } from '../../Entities/User';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }
};

export default function Home() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = context?.allTexts[language];
  const navigate = useNavigate();

  const mainButtons = [
    { title: t?.createWorkout || "צור אימון", subtitle: t?.createWorkoutDesc || "תוכנית אימון מלאה ומותאמת אישית", href: createPageUrl("WorkoutSetup"), icon: Activity, isPrimary: true },
    { title: t?.selectWorkout || "בחר אימון", subtitle: t?.selectWorkoutDesc || "בחר אימון קיים", href: createPageUrl("SelectWorkout"), icon: Dumbbell, isPrimary: false },
    { title: t?.heritage || "תרבות ומורשת", subtitle: null, href: createPageUrl("Heritage"), icon: BookOpen, isPrimary: false },
    { title: t?.militaryChat || "יועץ הכנה צבאית", subtitle: t?.militaryChatDesc || "ייעוץ מקצועי מבוסס AI", href: createPageUrl("MilitaryChat"), icon: MessageCircle, isPrimary: false }
  ];

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const user = await User.me();
        if (
          (user.attributes.push_strength === 0 || !user.attributes.push_strength) &&
          (user.attributes.pull_strength === 0 || !user.attributes.pull_strength) &&
          (user.attributes.cardio_endurance === 0 || !user.attributes.cardio_endurance)
        ) {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (error) {
        console.log("Onboarding check: user not logged in or error fetching user data.", error);
      }
    };
    checkOnboarding();
  }, [navigate]);

  return (
    <div 
      className="flex flex-col px-6 py-6 h-full overflow-hidden" 
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <motion.div 
        className="flex-1 flex flex-col justify-center gap-5 max-w-md mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Primary Action — Create Workout */}
        <motion.div variants={cardVariants} className="mb-4">
          <Link to={mainButtons[0].href} className="block group">
            <div className="glass-card-elevated glow-border hover:glow-border-strong rounded-2xl px-8 py-10 press-scale transition-all duration-300 flex items-center justify-between relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-tactical-accent/10 to-transparent pointer-events-none rounded-2xl" />
              
              <div className="flex-1 text-right relative z-10">
                <h2 className="text-2xl font-bold text-tactical-text mb-2 group-hover:text-tactical-glow transition-colors duration-300">{mainButtons[0].title}</h2>
                <p className="text-base text-tactical-muted">{mainButtons[0].subtitle}</p>
              </div>
              <div className="flex items-center gap-3 mr-4 relative z-10">
                <Activity className="w-10 h-10 text-tactical-accent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <ChevronRight className="w-6 h-6 text-tactical-muted group-hover:text-tactical-accent transition-colors duration-300" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Secondary Actions */}
        {mainButtons.slice(1).map((button, index) => {
          const IconComponent = button.icon;

          return (
            <motion.div key={index + 1} variants={cardVariants}>
              <Link to={button.href} className="block group">
                <div className="glass-card hover-lift rounded-xl px-6 py-5 press-scale transition-all duration-300 flex items-center justify-between hover:border-tactical-accent/20">
                  <div className="flex-1 text-right">
                    <h3 className="text-lg font-semibold text-tactical-text mb-1 group-hover:text-tactical-glow transition-colors duration-300">{button.title}</h3>
                    {button.subtitle && (
                      <p className="text-sm text-tactical-muted">{button.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mr-3">
                    <IconComponent className="w-6 h-6 text-tactical-accent/70 group-hover:text-tactical-accent transition-all duration-300" />
                    <ChevronRight className="w-5 h-5 text-tactical-muted/50 group-hover:text-tactical-accent/70 transition-colors duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div 
        className="text-center py-4 flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-tactical-muted/50 text-xs leading-relaxed whitespace-pre-line">
          {t?.memorial || `לזכר אופק בכר ושילה הר-אבן ז״ל\nכל הזכויות שמורות ©`}
        </p>
      </motion.div>
    </div>
  );
}