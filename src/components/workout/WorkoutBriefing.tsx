import React from "react";
import { motion } from "framer-motion";
import { Target, Clock, Zap, Play, ArrowRight, MessageSquare, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { ComposedWorkout, WorkoutPart } from "../../lib/services/workoutComposition";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { createPageUrl } from "../../lib/utils";

interface WorkoutBriefingProps {
  workout: ComposedWorkout;
  onStart: () => void;
  language?: 'hebrew' | 'english';
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } }
};

export const WorkoutBriefing: React.FC<WorkoutBriefingProps> = ({
  workout,
  onStart,
  language = 'hebrew'
}) => {
  const texts = {
    hebrew: {
      missionBrief: 'תדריך משימה',
      startMission: 'התחל משימה',
      estimatedDuration: 'זמן משוער',
      minutes: 'דקות',
      parts: 'חלקים',
      components: 'תרגילים',
      difficulty: 'רמת קושי',
      overview: 'סקירה כללית'
    },
    english: {
      missionBrief: 'Mission Brief',
      startMission: 'Start Mission',
      estimatedDuration: 'Estimated Duration',
      minutes: 'minutes',
      parts: 'Parts',
      components: 'Exercises',
      difficulty: 'Difficulty',
      overview: 'Overview'
    }
  };

  const t = texts[language];

  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/20',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    elite: 'bg-red-500/20 text-red-400 border-red-500/20'
  };

  const partTypeColors: Record<string, string> = {
    warmup: 'bg-sky-500/20 text-sky-400 border-sky-500/20',
    cardio: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
    strength: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    special: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    sprints: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    closing: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
    motivation: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  };

  const partTypeLabels: Record<string, Record<string, string>> = {
    hebrew: {
      warmup: 'חימום',
      cardio: 'קרדיו',
      strength: 'כוח',
      special: 'מיוחד',
      sprints: 'ספרינטים',
      closing: 'סיום',
      motivation: 'חנתר',
    },
    english: {
      warmup: 'Warmup',
      cardio: 'Cardio',
      strength: 'Strength',
      special: 'Special',
      sprints: 'Sprints',
      closing: 'Closing',
      motivation: 'Talk',
    }
  };

  const totalComponents = workout.parts.reduce((sum, part) => sum + part.components.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-tactical-text"
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-xl glass-card press-scale hover:glow-border transition-all duration-200">
              <ArrowRight className="w-5 h-5 text-tactical-muted" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-tactical-text">{t.missionBrief}</h1>
          </div>
        </motion.div>

        {/* Main Brief Card */}
        <motion.div 
          className="glass-card-elevated rounded-2xl p-6 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-tactical-accent/5 to-transparent pointer-events-none rounded-2xl" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full glass-card flex items-center justify-center mx-auto mb-4 glow-border">
              <Target className="w-7 h-7 text-tactical-accent" />
            </div>
            <h2 className="text-xl font-bold text-tactical-text text-center mb-3">{workout.title}</h2>

            {workout.description && (
              <p className="text-tactical-muted whitespace-pre-wrap text-center mb-4 text-sm">{workout.description}</p>
            )}

            {/* Stats Row */}
            <div className="flex justify-center gap-3 mb-2">
              <Badge className={difficultyColors[workout.difficulty]}>
                {workout.difficulty}
              </Badge>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg glass-card text-tactical-muted">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-mono-data font-medium">{workout.estimatedDuration} {t.minutes}</span>
              </div>
            </div>

            {/* Equipment Requirements */}
            {workout.requiredEquipment && workout.requiredEquipment.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <Shield className="w-3.5 h-3.5 text-tactical-muted" />
                <span className="text-xs text-tactical-muted">
                  {language === 'hebrew' ? 'ציוד נדרש: ' : 'Equipment: '}
                  {workout.requiredEquipment.map(eq => {
                    const eqNames: Record<string, string> = {
                      sandbag: 'שק חול',
                      stretcher: 'אלונקה',
                      tire: 'צמיג',
                      weight_vest: 'וסט משקל',
                      rope: 'חבל',
                      water_jugs: 'ג׳ריקנים',
                    };
                    return eqNames[eq] || eq;
                  }).join(', ')}
                </span>
              </div>
            )}

            {/* Partner Mode Indicator */}
            {workout.isPartnerMode && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs px-3 py-1 rounded-lg bg-tactical-accent/10 text-tactical-accent border border-tactical-accent/20">
                  {language === 'hebrew' ? 'מצב שותפים' : 'Partner Mode'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Parts Overview */}
        <motion.div 
          className="glass-card-elevated rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-base font-bold text-tactical-text mb-4 text-center">{t.overview}</h3>

          <motion.div 
            className="space-y-2.5"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {workout.parts.map((part, index) => (
              <motion.div key={part.id} variants={itemVariants} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-tactical-accent font-mono-data">{String(index + 1).padStart(2, '0')}</span>
                    <span className="font-semibold text-tactical-text text-sm">{part.name}</span>
                  </div>
                  <Badge className={partTypeColors[part.type]}>
                    {partTypeLabels[language][part.type]}
                  </Badge>
                </div>
                
                {/* Exercise details within this part */}
                <div className="mt-2 space-y-1.5 pr-6">
                  {part.components.slice(0, 6).map((comp, ci) => (
                    <div key={comp.id} className="flex items-center justify-between text-xs">
                      <span className="text-tactical-muted truncate flex-1">{comp.name}</span>
                      {comp.description && (
                        <span className="text-tactical-data font-mono-data mr-2 flex-shrink-0">{comp.description}</span>
                      )}
                    </div>
                  ))}
                  {part.components.length > 6 && (
                    <p className="text-xs text-tactical-muted/50">
                      +{part.components.length - 6} {language === 'hebrew' ? 'נוספים' : 'more'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-tactical-muted mt-2 pt-2 border-t border-tactical-accent/5">
                  <span className="font-mono-data">{part.components.length} {t.components}</span>
                  {part.requiresGPS && (
                    <span className="flex items-center gap-1 text-tactical-accent/70">
                      <Zap className="w-3 h-3" />
                      GPS
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-tactical-accent/10 flex justify-between text-sm font-semibold">
            <span className="text-tactical-muted">{language === 'hebrew' ? 'סה"כ:' : 'Total:'}</span>
            <span className="text-tactical-text font-mono-data">{totalComponents} {t.components}</span>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            onClick={onStart}
            className="w-full py-4 text-lg glow-border-strong"
          >
            <Play className="w-5 h-5 ml-2" />
            {t.startMission}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
