import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Timer, Navigation, Dumbbell, Heart, Zap, Target, Clock, SkipForward, ChevronLeft, MessageSquare, Swords, Trophy } from "lucide-react";
import { WorkoutComponent } from "../../lib/services/workoutComposition";
import { GPSStats } from "../../lib/services/gpsService";
import { Button } from "../ui/button";
import { GPSErrorBoundary } from "./GPSErrorBoundary";

interface ComponentDisplayProps {
  component: WorkoutComponent;
  onFinish: () => void;
  onSkip?: () => void;
  gpsStats?: GPSStats | null;
  language?: 'hebrew' | 'english';
  partName?: string;
  currentIndex?: number;
  totalComponents?: number;
  isLoading?: boolean;
  nextComponent?: WorkoutComponent | null;
  children?: React.ReactNode;
}

// ============ SUB-COMPONENTS ============

/**
 * SVG Countdown Ring — visual progress circle for timed exercises/rest
 */
const CountdownRing: React.FC<{ remaining: number; total: number; size?: number }> = React.memo(({
  remaining, total, size = 180
}) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - (remaining / total);
  const dashOffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(127, 176, 105, 0.1)" strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--color-accent)" strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.9s linear' }}
      />
    </svg>
  );
});

/**
 * Timer Display — counts up from start time (stopwatch mode)
 */
const TimerDisplay: React.FC<{ startTime: number }> = React.memo(({ startTime }) => {
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
});

/**
 * Countdown Timer — counts down with progress ring and vibration
 */
const CountdownTimer: React.FC<{
  duration: number;
  onComplete: () => void;
  showRing?: boolean;
  size?: number;
}> = ({ duration, onComplete, showRing = false, size = 180 }) => {
  const [remaining, setRemaining] = useState(duration);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    completedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      // Vibrate on completion
      try {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      } catch { /* no vibration support */ }
      onCompleteRef.current();
      return;
    }
    if (remaining <= 0) return;

    const timeout = setTimeout(() => {
      setRemaining(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [remaining]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {showRing && <CountdownRing remaining={remaining} total={duration} size={size} />}
      <div className={`text-7xl font-bold font-mono text-tactical-data text-glow-strong ${remaining <= 5 ? 'animate-pulse' : ''}`}>
        {minutes}:{seconds}
      </div>
    </div>
  );
};

/**
 * GPS Stats overlay for cardio exercises
 */
const GPSStatsDisplay: React.FC<{ stats: GPSStats; language: 'hebrew' | 'english' }> = React.memo(({ stats, language }) => {
  const formatDistance = (distance: number) => `${(distance / 1000).toFixed(2)} km`;
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
          <span className="text-xs text-tactical-muted font-semibold uppercase tracking-wider">
            {language === 'hebrew' ? 'מרחק' : 'Distance'}
          </span>
        </div>
        <div className="text-3xl font-bold font-mono text-tactical-data text-glow">
          {formatDistance(stats.totalDistance)}
        </div>
      </div>
      <div className="glass-card-elevated rounded-xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-tactical-accent" />
          <span className="text-xs text-tactical-muted font-semibold uppercase tracking-wider">
            {language === 'hebrew' ? 'קצב ממוצע' : 'Avg Pace'}
          </span>
        </div>
        <div className="text-3xl font-bold font-mono text-tactical-data text-glow">
          {formatPace(stats.averagePace)}
        </div>
      </div>
    </div>
  );
});

/**
 * "Next Up" preview card shown during rest
 */
const NextUpPreview: React.FC<{
  nextComponent: WorkoutComponent;
  language: 'hebrew' | 'english';
}> = React.memo(({ nextComponent, language }) => {
  const Icon = getComponentIcon(nextComponent.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-4 mt-6 w-full"
    >
      <p className="text-xs text-tactical-muted font-semibold uppercase tracking-wider mb-2 text-center">
        {language === 'hebrew' ? 'הבא בתור' : 'Next Up'}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg glass-card-elevated flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-tactical-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-tactical-text text-sm truncate">{nextComponent.name}</h4>
          {nextComponent.description && (
            <p className="text-xs text-tactical-muted truncate">{nextComponent.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

/**
 * Sets Tracker — for exercises with multiple sets
 */
const SetsTracker: React.FC<{
  component: WorkoutComponent;
  onFinish: () => void;
  onSkip?: () => void;
  language: 'hebrew' | 'english';
  isLoading?: boolean;
}> = ({ component, onFinish, onSkip, language, isLoading }) => {
  const totalSets = component.sets || 1;
  const restBetween = component.restAfter || 60;
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [startTime] = useState(Date.now());

  const t = language === 'hebrew' ? {
    set: 'סט',
    of: 'מתוך',
    reps: 'חזרות',
    rest: 'מנוחה בין סטים',
    finishSet: 'סיום סט',
    skipRest: 'דלג על מנוחה',
    finished: 'סיימתי',
  } : {
    set: 'Set',
    of: 'of',
    reps: 'reps',
    rest: 'Rest Between Sets',
    finishSet: 'Finish Set',
    skipRest: 'Skip Rest',
    finished: 'Finished',
  };

  const handleSetFinish = () => {
    if (currentSet < totalSets) {
      setIsResting(true);
    } else {
      onFinish();
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setCurrentSet(prev => prev + 1);
  };

  if (isResting) {
    return (
      <motion.div
        key={`rest-set-${currentSet}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-4">
          <Clock className="w-12 h-12 text-tactical-accent mx-auto mb-3 animate-pulse-glow" />
          <h2 className="text-2xl font-bold text-tactical-text mb-1">{t.rest}</h2>
          <p className="text-tactical-muted text-sm">
            {t.set} {currentSet}/{totalSets} {language === 'hebrew' ? 'הושלם' : 'completed'}
          </p>
        </div>
        <div className="mx-auto flex justify-center mb-6">
          <CountdownTimer duration={restBetween} onComplete={handleRestComplete} showRing size={160} />
        </div>
        <Button
          onClick={handleRestComplete}
          variant="outline"
          className="w-full py-3"
        >
          <SkipForward className="w-4 h-4 ml-2" />
          {t.skipRest}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`set-${currentSet}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md text-center"
    >
      {/* Sets indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: totalSets }, (_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${i + 1 < currentSet 
                ? 'gradient-accent text-tactical-bg' 
                : i + 1 === currentSet 
                  ? 'glow-border-strong border-2 border-tactical-accent text-tactical-accent' 
                  : 'glass-card text-tactical-muted'
              }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-tactical-text mb-1">{component.name}</h2>
      <p className="text-tactical-muted text-lg mb-1">
        {t.set} {currentSet} {t.of} {totalSets}
      </p>
      {component.reps && (
        <p className="text-tactical-data text-2xl font-bold font-mono-data text-glow mb-6">
          {component.reps} {t.reps}
        </p>
      )}

      <TimerDisplay startTime={startTime} />

      {component.instructions && (
        <div className="glass-card rounded-xl p-4 my-6 text-right">
          <p className="text-sm text-tactical-muted whitespace-pre-wrap">{component.instructions}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {onSkip && (
          <Button onClick={onSkip} variant="outline" className="flex-shrink-0 px-4 py-4">
            <SkipForward className="w-5 h-5" />
          </Button>
        )}
        <Button
          onClick={handleSetFinish}
          disabled={isLoading}
          className="flex-1 py-4 text-lg glow-border-strong"
        >
          {currentSet < totalSets ? t.finishSet : t.finished}
        </Button>
      </div>
    </motion.div>
  );
};

// ============ HELPERS ============

const getComponentIcon = (type: string) => {
  switch (type) {
    case 'strength_exercise': return Dumbbell;
    case 'cardio_exercise': return Heart;
    case 'warmup_exercise': return Zap;
    case 'special_exercise': return Target;
    case 'motivation_talk': return MessageSquare;
    case 'rest': return Clock;
    default: return Target;
  }
};

const texts = {
  hebrew: {
    finished: 'סיימתי',
    rest: 'מנוחה',
    reps: 'חזרות',
    seconds: 'שניות',
    duration: 'משך',
    instructions: 'הוראות',
    skip: 'דלג',
    finishRest: 'סיים מנוחה',
    finishExercise: 'סיים תרגיל',
    transitioning: 'מעבר...',
  },
  english: {
    finished: 'Finished',
    rest: 'Rest',
    reps: 'reps',
    seconds: 'seconds',
    duration: 'Duration',
    instructions: 'Instructions',
    skip: 'Skip',
    finishRest: 'Finish Rest',
    finishExercise: 'Complete Exercise',
    transitioning: 'Transitioning...',
  }
} as const;

// ============ MAIN COMPONENT ============

export const ComponentDisplay: React.FC<ComponentDisplayProps> = ({
  component,
  onFinish,
  onSkip,
  gpsStats,
  language = 'hebrew',
  partName,
  currentIndex = 0,
  totalComponents = 1,
  isLoading = false,
  nextComponent,
  children,
}) => {
  const [startTime] = useState(Date.now());
  const Icon = getComponentIcon(component.type);
  const t = texts[language];

  // === Sets-aware exercise (legacy single-exercise format) ===
  if (component.sets && component.sets > 1 && component.type !== 'rest') {
    return (
      <SetsTracker
        component={component}
        onFinish={onFinish}
        onSkip={onSkip}
        language={language}
        isLoading={isLoading}
      />
    );
  }

  // === Motivation Talk (חנתר שיחת) - skippable interstitial ===
  if (component.type === 'motivation_talk') {
    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md text-center flex flex-col items-center"
      >
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full glass-card-elevated flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(127, 176, 105, 0.3), rgba(127, 176, 105, 0.1))' }}>
            <MessageSquare className="w-10 h-10 text-tactical-accent" />
          </div>
          <h2 className="text-2xl font-bold text-tactical-text mb-2">
            {language === 'hebrew' ? 'חנתר שיחת' : 'Motivation Talk'}
          </h2>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6 mb-6 w-full">
          <p className="text-lg text-tactical-text leading-relaxed whitespace-pre-wrap font-medium">
            {component.description || component.instructions}
          </p>
        </div>

        <Button
          onClick={onFinish}
          disabled={isLoading}
          className="w-full py-4 text-lg glow-border-strong"
        >
          {language === 'hebrew' ? 'המשך לשלב הבא' : 'Continue'}
        </Button>
      </motion.div>
    );
  }

  // === Rest component with next-up preview ===
  if (component.type === 'rest') {
    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md text-center flex flex-col items-center"
      >
        <div className="mb-4">
          <div className="w-20 h-20 rounded-full glass-card-elevated flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Clock className="w-10 h-10 text-tactical-accent" />
          </div>
          <h2 className="text-3xl font-bold text-tactical-text mb-2">{t.rest}</h2>
        </div>

        <div className="mx-auto flex justify-center mb-4">
          <CountdownTimer
            duration={component.duration || 60}
            onComplete={onFinish}
            showRing
            size={180}
          />
        </div>

        {/* Next Up Preview */}
        {nextComponent && (
          <NextUpPreview nextComponent={nextComponent} language={language} />
        )}

        <Button
          onClick={onFinish}
          variant="outline"
          className="w-full mt-6 py-4 text-lg"
        >
          <SkipForward className="w-5 h-5 ml-2" />
          {t.finishRest}
        </Button>
      </motion.div>
    );
  }

  // === Timed exercise with countdown (non-GPS) ===
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

        <div className="mb-6">
          <Icon className="w-12 h-12 text-tactical-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-tactical-text mb-2">{component.name}</h2>
          {component.description && (
            <p className="text-tactical-muted text-lg">{component.description}</p>
          )}
        </div>

        <div className="mb-6 mx-auto flex justify-center">
          <CountdownTimer duration={component.duration} onComplete={onFinish} showRing size={180} />
        </div>

        {component.instructions && (
          <div className="glass-card rounded-xl p-4 mb-6 text-right">
            <p className="text-sm text-tactical-muted whitespace-pre-wrap">{component.instructions}</p>
          </div>
        )}

        {children || (
          <div className="flex gap-3">
            {onSkip && (
              <Button onClick={onSkip} variant="outline" className="flex-shrink-0 px-4 py-4">
                <SkipForward className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={onFinish}
              disabled={isLoading}
              className="flex-1 py-4 text-lg"
            >
              {isLoading ? t.transitioning : t.finished}
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // === Default: Stopwatch exercise (strength, GPS cardio, etc.) ===
  return (
    <motion.div
      key={component.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md text-center"
      style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
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
        <GPSErrorBoundary language={language}>
          <GPSStatsDisplay stats={gpsStats} language={language} />
        </GPSErrorBoundary>
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

      {children || (
        <div className="flex gap-3 mt-8">
          {onSkip && (
            <Button onClick={onSkip} variant="outline" className="flex-shrink-0 px-4 py-4">
              <SkipForward className="w-5 h-5" />
            </Button>
          )}
          <Button
            onClick={onFinish}
            disabled={isLoading}
            className="flex-1 py-4 text-lg glow-border-strong"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t.transitioning}
              </div>
            ) : t.finishExercise}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
