import React from "react";
import { motion } from "framer-motion";
import { Clock, Timer, Check, Star, ThumbsUp, Coffee, Target, Zap, ZapOff } from "lucide-react";
import { Button } from "../ui/button";

interface CompletedTask {
  name: string;
  duration: number;
  type: string;
  partName?: string;
}

interface WorkoutSummaryProps {
  workoutTitle: string;
  totalDuration: number;
  completedTasks: CompletedTask[];
  onConfirm: () => void;
  language?: 'hebrew' | 'english';
}

interface WorkoutFeedbackProps {
  onSubmit: (feedback: { difficulty: 'easy' | 'moderate' | 'hard'; feeling: 'great' | 'okay' | 'tired' | 'exhausted' }) => void;
  language?: 'hebrew' | 'english';
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
  return `${seconds}s`;
};

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  workoutTitle,
  totalDuration,
  completedTasks,
  onConfirm,
  language = 'hebrew'
}) => {
  const texts = {
    hebrew: {
      workoutSummary: 'סיכום האימון',
      totalDuration: 'זמן כולל',
      minutes: 'דקות',
      seconds: 'שניות',
      confirm: 'אישור',
      rest: 'מנוחה',
      completed: 'הושלם!'
    },
    english: {
      workoutSummary: 'Workout Summary',
      totalDuration: 'Total Duration',
      minutes: 'minutes',
      seconds: 'seconds',
      confirm: 'Confirm',
      rest: 'Rest',
      completed: 'Completed!'
    }
  };

  const t = texts[language];

  const totalMinutes = Math.floor(totalDuration / 60);
  const remainingSeconds = totalDuration % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 text-tactical-text"
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center glow-border">
            <Clock className="w-5 h-5 text-tactical-accent" />
          </div>
          <h1 className="text-2xl font-bold text-tactical-text">{t.workoutSummary}</h1>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6 mb-6">
          {/* Title and Total Duration */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-tactical-text mb-3">{workoutTitle}</h2>
            <div className="flex items-center justify-center gap-2">
              <Timer className="w-5 h-5 text-tactical-accent" />
              <span className="text-lg font-mono-data text-tactical-data font-semibold">
                {t.totalDuration}: {totalMinutes} {t.minutes} {remainingSeconds} {t.seconds}
              </span>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {completedTasks.map((task, index) => (
              <motion.div 
                key={index} 
                className="flex justify-between items-center p-3 glass-card rounded-xl"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex-1 text-right">
                  <h4 className="font-semibold text-tactical-text text-sm">{task.name}</h4>
                  {task.partName && <p className="text-xs text-tactical-muted">({task.partName})</p>}
                  {task.type === 'rest' && <p className="text-xs text-tactical-muted">{t.rest}</p>}
                </div>
                <div className="text-sm font-mono text-tactical-data">{formatTime(task.duration)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full py-4 text-lg"
        >
          <Check className="w-5 h-5 ml-2" />
          {t.confirm}
        </Button>
      </div>
    </motion.div>
  );
};

export const WorkoutFeedback: React.FC<WorkoutFeedbackProps> = ({
  onSubmit,
  language = 'hebrew'
}) => {
  const [feedback, setFeedback] = React.useState<{ 
    difficulty: 'easy' | 'moderate' | 'hard' | null; 
    feeling: 'great' | 'okay' | 'tired' | 'exhausted' | null 
  }>({
    difficulty: null,
    feeling: null
  });

  const texts = {
    hebrew: {
      workoutFeedback: 'משוב על האימון',
      howWasWorkout: 'איך היה האימון?',
      howDoYouFeel: 'איך אתה מרגיש?',
      easy: 'קל',
      moderate: 'בינוני',
      hard: 'קשה',
      great: 'מצוין',
      okay: 'בסדר',
      tired: 'עייף',
      exhausted: 'תשוש',
      submit: 'שלח'
    },
    english: {
      workoutFeedback: 'Workout Feedback',
      howWasWorkout: 'How was the workout?',
      howDoYouFeel: 'How do you feel?',
      easy: 'Easy',
      moderate: 'Moderate',
      hard: 'Hard',
      great: 'Great',
      okay: 'Okay',
      tired: 'Tired',
      exhausted: 'Exhausted',
      submit: 'Submit'
    }
  };

  const t = texts[language];

  const handleSubmit = () => {
    if (feedback.difficulty && feedback.feeling) {
      onSubmit({ 
        difficulty: feedback.difficulty as 'easy' | 'moderate' | 'hard',
        feeling: feedback.feeling as 'great' | 'okay' | 'tired' | 'exhausted'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 text-tactical-text"
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center glow-border">
            <Star className="w-5 h-5 text-tactical-accent" />
          </div>
          <h1 className="text-2xl font-bold text-tactical-text">{t.workoutFeedback}</h1>
        </div>

        <div className="space-y-6">
          {/* Difficulty */}
          <div className="glass-card-elevated rounded-2xl p-6">
            <h3 className="text-base font-bold text-center mb-4 text-tactical-text">{t.howWasWorkout}</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'easy', label: t.easy, icon: Coffee },
                { key: 'moderate', label: t.moderate, icon: Target },
                { key: 'hard', label: t.hard, icon: Zap }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFeedback(prev => ({ ...prev, difficulty: key as 'easy' | 'moderate' | 'hard' }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 press-scale
                    ${feedback.difficulty === key 
                      ? 'gradient-accent text-tactical-bg border-transparent glow-border' 
                      : 'glass-card text-tactical-text hover:border-tactical-accent/30'}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feeling */}
          <div className="glass-card-elevated rounded-2xl p-6">
            <h3 className="text-base font-bold text-center mb-4 text-tactical-text">{t.howDoYouFeel}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
              {[
                { key: 'great', label: t.great, icon: Star },
                { key: 'okay', label: t.okay, icon: ThumbsUp },
                { key: 'tired', label: t.tired, icon: Target },
                { key: 'exhausted', label: t.exhausted, icon: ZapOff }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFeedback(prev => ({ ...prev, feeling: key as 'great' | 'okay' | 'tired' | 'exhausted' }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 press-scale
                    ${feedback.feeling === key 
                      ? 'gradient-accent text-tactical-bg border-transparent glow-border' 
                      : 'glass-card text-tactical-text hover:border-tactical-accent/30'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!feedback.difficulty || !feedback.feeling}
          className="w-full mt-8 py-4 text-lg"
        >
          <Check className="w-5 h-5 ml-2" />
          {t.submit}
        </Button>
      </div>
    </motion.div>
  );
};
