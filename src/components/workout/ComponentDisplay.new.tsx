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
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * Timer Display Component
 */
const TimerDisplay = React.memo<{ startTime: number }>(({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Use callback form to avoid closure issues with startTime
      setElapsed(() => Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Memoize time calculations
  const { minutes, seconds } = React.useMemo(() => {
    const totalSeconds = Math.floor(elapsed / 1000);
    return {
      minutes: String(Math.floor(totalSeconds / 60)).padStart(2, '0'),
      seconds: String(totalSeconds % 60).padStart(2, '0')
    };
  }, [elapsed]);

  return (
    <div className="text-6xl font-bold font-mono text-dark-olive">
      {minutes}:{seconds}
    </div>
  );
});

/**
 * Countdown Timer Component
 */
const CountdownTimer = React.memo<{ duration: number; onComplete: () => void }>(
  ({ duration, onComplete }) => {
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

    // Memoize time formatting
    const { minutes, seconds } = React.useMemo(() => ({
      minutes: String(Math.floor(remaining / 60)).padStart(2, '0'),
      seconds: String(remaining % 60).padStart(2, '0')
    }), [remaining]);

    return (
      <div className="text-6xl font-bold font-mono text-dark-olive">
        {minutes}:{seconds}
      </div>
    );
  }
);

/**
 * GPS Stats Display Component
 */
const GPSStatsDisplay = React.memo<{ stats: GPSStats; language: 'hebrew' | 'english' }>(
  ({ stats, language }) => {
    // Memoize formatting functions
    const formatters = React.useMemo(() => ({
      formatDistance: (distance: number) => `${(distance / 1000).toFixed(2)} km`,
      formatPace: (pace: number) => {
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}:${String(seconds).padStart(2, '0')}/km`;
      }
    }), []);

    // Memoize formatted values
    const formattedValues = React.useMemo(() => ({
      distance: formatters.formatDistance(stats.totalDistance),
      pace: formatters.formatPace(stats.averagePace)
    }), [stats.totalDistance, stats.averagePace, formatters]);

    return (
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 card-shadow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-idf-olive" />
            <span className="text-xs text-gray-500">{language === 'hebrew' ? 'מרחק' : 'Distance'}</span>
          </div>
          <div className="text-2xl font-bold text-dark-olive">
            {formattedValues.distance}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 card-shadow">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-idf-olive" />
            <span className="text-xs text-gray-500">{language === 'hebrew' ? 'קצב ממוצע' : 'Avg Pace'}</span>
          </div>
          <div className="text-2xl font-bold text-dark-olive">
            {formattedValues.pace}
          </div>
        </div>
      </div>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) =>
    prevProps.language === nextProps.language &&
    prevProps.stats.totalDistance === nextProps.stats.totalDistance &&
    prevProps.stats.averagePace === nextProps.stats.averagePace
);

/**
 * Component Icon Map
 */
const iconMap = new Map([
  ['strength_exercise', Dumbbell],
  ['cardio_exercise', Heart],
  ['warmup_exercise', Zap],
  ['special_exercise', Target],
  ['rest', Clock]
]);

const getComponentIcon = React.useCallback((type: string) => {
  return iconMap.get(type) || Target;
}, []);

// Memoized texts object
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
} as const;

/**
 * Main Component Display
 */
export const ComponentDisplay = React.memo<ComponentDisplayProps>(
  function ComponentDisplay({
    component,
    onFinish,
    gpsStats,
    language = 'hebrew',
    partName,
    currentIndex = 0,
    totalComponents = 1,
    isLoading = false,
    children
  }) {
    const [startTime] = useState(Date.now());
    const Icon = React.useMemo(() => getComponentIcon(component.type), [component.type]);
    const t = texts[language];

    // Memoize the button content
    const buttonContent = React.useMemo(() => {
      if (isLoading) {
        return (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            {language === 'hebrew' ? 'מעבר...' : 'Transitioning...'}
          </div>
        );
      }
      return component.type === 'rest' ? 
        (language === 'hebrew' ? 'סיים מנוחה' : 'Finish Rest') :
        (language === 'hebrew' ? 'סיים תרגיל' : 'Complete Exercise');
    }, [isLoading, language, component.type]);

    // Handle rest component with auto-advance
    if (component.type === 'rest') {
      return (
        <motion.div
          key={component.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-8">
            <Clock className="w-16 h-16 text-idf-olive mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-idf-olive mb-2">{t.rest}</h2>
            <p className="text-gray-600">{component.name}</p>
          </div>

          <CountdownTimer duration={component.duration || 60} onComplete={onFinish} />

          <Button
            onClick={onFinish}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl btn-press card-shadow mt-12 text-lg"
          >
            {t.finished}
          </Button>
        </motion.div>
      );
    }

    // Handle timed exercise with countdown
    if (component.duration && !component.requiresGPS) {
      return (
        <motion.div
          key={component.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md text-center"
        >
          {/* Header with part name and progress */}
          {partName && (
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              {partName} ({currentIndex + 1}/{totalComponents})
            </h3>
          )}

          {/* Exercise title and icon */}
          <div className="mb-6">
            <Icon className="w-12 h-12 text-idf-olive mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-idf-olive mb-2">{component.name}</h2>
            {component.description && (
              <p className="text-gray-600 text-lg">{component.description}</p>
            )}
          </div>

          {/* Countdown timer */}
          <div className="mb-8">
            <CountdownTimer duration={component.duration} onComplete={onFinish} />
          </div>

          {/* Instructions */}
          {component.instructions && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-right">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{component.instructions}</p>
            </div>
          )}

          <Button
            onClick={onFinish}
            className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow text-lg"
          >
            {t.finished}
          </Button>
        </motion.div>
      );
    }

    // Handle standard exercise with stopwatch
    return (
      <motion.div
        key={component.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md text-center"
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        {/* Header with part name and progress */}
        {partName && (
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            {partName} ({currentIndex + 1}/{totalComponents})
          </h3>
        )}

        {/* Exercise title and icon */}
        <div className="mb-6">
          <Icon className="w-12 h-12 text-idf-olive mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-idf-olive mb-2">{component.name}</h2>
          {component.description && (
            <p className="text-gray-600 text-lg whitespace-pre-wrap">{component.description}</p>
          )}
        </div>

        {/* Timer */}
        <TimerDisplay startTime={startTime} />

        {/* GPS Stats for cardio */}
        {component.requiresGPS && gpsStats && (
          <GPSStatsDisplay stats={gpsStats} language={language} />
        )}

        {/* Instructions */}
        {component.instructions && (
          <div className="bg-gray-50 rounded-lg p-4 my-8 text-right">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{component.instructions}</p>
          </div>
        )}

        {/* Tips */}
        {component.tips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4 text-right">
            <p className="text-sm text-blue-800">{component.tips}</p>
          </div>
        )}

        {children || (
          <Button
            onClick={onFinish}
            disabled={isLoading}
            className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow mt-8 text-lg disabled:opacity-50"
          >
            {buttonContent}
          </Button>
        )}
      </motion.div>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps): boolean => {
    if (!prevProps || !nextProps) return false;

    const gpsStatsEqual = (!prevProps.gpsStats && !nextProps.gpsStats) ||
      (prevProps.gpsStats && nextProps.gpsStats &&
        prevProps.gpsStats.totalDistance === nextProps.gpsStats.totalDistance &&
        prevProps.gpsStats.averagePace === nextProps.gpsStats.averagePace);

    return Boolean(
      prevProps.component.id === nextProps.component.id &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.language === nextProps.language &&
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.totalComponents === nextProps.totalComponents &&
      gpsStatsEqual
    );
  }
);
