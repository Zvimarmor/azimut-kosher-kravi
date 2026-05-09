import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Navigation, Dumbbell, Heart, Zap, Target, Clock } from "lucide-react";
import { WorkoutComponent } from "../../lib/services/workoutComposition";
import { GPSStats } from "../../lib/services/gpsService";
import { Button } from "../ui/button";

interface ComponentDisplayProps {
  component: WorkoutComponent;
  onFinish: () => void;
  gpsStats?: GPSStats | null;
  language?: 'hebrew' | 'english';
  partName?: string;
  currentIndex?: number;
  totalComponents?: number;
}

const TimerDisplay: React.FC<{ startTime: number }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return (
    <div className="text-7xl font-bold font-mono text-tactical-data text-glow-strong">
      {minutes}:{seconds}
    </div>
  );
};

const CountdownTimer: React.FC<{ duration: number; onComplete: () => void }> = ({ duration, onComplete }) => {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timeout = setTimeout(() => {
      setRemaining(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [remaining, onComplete]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  const progress = 1 - (remaining / duration);

  return (
    <div className="relative">
      <div className="text-7xl font-bold font-mono text-tactical-data text-glow-strong">
        {minutes}:{seconds}
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-tactical-surface rounded-full mt-4 overflow-hidden">
        <motion.div
          className="h-full gradient-accent rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

const GPSStatsDisplay: React.FC<{ stats: GPSStats; language: 'hebrew' | 'english' }> = ({ stats, language }) => {
  const formatDistance = (distance: number) => {
    return `${(distance / 1000).toFixed(2)} km`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}/km`;
  };

  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      <div className="glass-card-elevated rounded-xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-tactical-accent" />
          <span className="text-xs text-tactical-muted font-semibold uppercase tracking-wider">{language === 'hebrew' ? 'מרחק' : 'Distance'}</span>
        </div>
        <div className="text-3xl font-bold font-mono text-tactical-data text-glow">
          {formatDistance(stats.totalDistance)}
        </div>
      </div>
      <div className="glass-card-elevated rounded-xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-tactical-accent" />
          <span className="text-xs text-tactical-muted font-semibold uppercase tracking-wider">{language === 'hebrew' ? 'קצב ממוצע' : 'Avg Pace'}</span>
        </div>
        <div className="text-3xl font-bold font-mono text-tactical-data text-glow">
          {formatPace(stats.averagePace)}
        </div>
      </div>
    </div>
  );
};

const getComponentIcon = (type: string) => {
  switch (type) {
    case 'strength_exercise':
      return Dumbbell;
    case 'cardio_exercise':
      return Heart;
    case 'warmup_exercise':
      return Zap;
    case 'special_exercise':
      return Target;
    case 'rest':
      return Clock;
    default:
      return Target;
  }
};

export const ComponentDisplay: React.FC<ComponentDisplayProps> = ({
  component,
  onFinish,
  gpsStats,
  language = 'hebrew',
  partName,
  currentIndex = 0,
  totalComponents = 1
}) => {
  const [startTime] = useState(Date.now());
  const Icon = getComponentIcon(component.type);

  const texts = {
    hebrew: {
      finished: 'סיימתי',
      rest: 'מנוחה',
      reps: 'חזרות',
      seconds: 'שניות',
      duration: 'משך',
      instructions: 'הוראות'
    },
    english: {
      finished: 'Finished',
      rest: 'Rest',
      reps: 'reps',
      seconds: 'seconds',
      duration: 'Duration',
      instructions: 'Instructions'
    }
  };

  const t = texts[language];

  if (component.type === 'rest') {
    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full glass-card-elevated flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Clock className="w-10 h-10 text-tactical-accent" />
          </div>
          <h2 className="text-3xl font-bold text-tactical-text mb-2">{t.rest}</h2>
          <p className="text-tactical-muted">{component.name}</p>
        </div>

        <CountdownTimer duration={component.duration || 60} onComplete={onFinish} />

        <Button
          onClick={onFinish}
          className="w-full mt-12 py-4 text-lg"
          variant="outline"
        >
          {t.finished}
        </Button>
      </motion.div>
    );
  }

  if (component.duration && !component.requiresGPS) {
    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md text-center"
      >
        {partName && (
          <h3 className="text-sm font-semibold text-tactical-muted mb-3 uppercase tracking-wider font-mono-data">
            {partName} <span className="text-tactical-accent">{currentIndex + 1}/{totalComponents}</span>
          </h3>
        )}

        <div className="mb-8">
          <Icon className="w-12 h-12 text-tactical-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-tactical-text mb-2">{component.name}</h2>
          {component.description && (
            <p className="text-tactical-muted text-lg">{component.description}</p>
          )}
        </div>

        <div className="mb-8">
          <CountdownTimer duration={component.duration} onComplete={onFinish} />
        </div>

        {component.instructions && (
          <div className="glass-card rounded-xl p-4 mb-8 text-right">
            <p className="text-sm text-tactical-muted whitespace-pre-wrap">{component.instructions}</p>
          </div>
        )}

        <Button
          onClick={onFinish}
          className="w-full py-4 text-lg"
        >
          {t.finished}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={component.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md text-center"
    >
      {partName && (
        <h3 className="text-sm font-semibold text-tactical-muted mb-3 uppercase tracking-wider font-mono-data">
          {partName} <span className="text-tactical-accent">{currentIndex + 1}/{totalComponents}</span>
        </h3>
      )}

      <div className="mb-8">
        <Icon className="w-12 h-12 text-tactical-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-tactical-text mb-2">{component.name}</h2>
        {component.description && (
          <p className="text-tactical-muted text-lg whitespace-pre-wrap">{component.description}</p>
        )}
      </div>

      <TimerDisplay startTime={startTime} />

      {component.requiresGPS && gpsStats && (
        <GPSStatsDisplay stats={gpsStats} language={language} />
      )}

      {component.instructions && (
        <div className="glass-card rounded-xl p-4 my-8 text-right">
          <p className="text-sm text-tactical-muted whitespace-pre-wrap">{component.instructions}</p>
        </div>
      )}

      {component.tips && (
        <div className="glass-card border-tactical-accent/20 rounded-xl p-4 my-4 text-right">
          <p className="text-sm text-tactical-accent/80">{component.tips}</p>
        </div>
      )}

      <Button
        onClick={onFinish}
        className="w-full mt-8 py-4 text-lg"
      >
        {t.finished}
      </Button>
    </motion.div>
  );
};
