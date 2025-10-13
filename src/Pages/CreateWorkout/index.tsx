import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { User } from "../../Entities/User";
import { WorkoutHistory } from "../../Entities/WorkoutHistory";
import { StrengthExplosive } from "../../Entities/StrengthExplosive";
import { Special } from "../../Entities/Special";
import {
  WorkoutCompositionService,
  ComposedWorkout,
  WorkoutComponent,
  WorkoutPart
} from "../../lib/services/workoutComposition";
import { gpsService, type GPSStats } from "../../lib/services/gpsService";
import { ComponentDisplay } from "../../components/workout/ComponentDisplay";
import { WorkoutBriefing } from "../../components/workout/WorkoutBriefing";
import { WorkoutSummary, WorkoutFeedback } from "../../components/workout/WorkoutSummary";
import { GPSWarningModal } from "../../components/gps/GPSWarningModal";
import { createPageUrl } from "../../lib/utils";
import { Button } from "../../components/ui/button";

interface CompletedTask {
  name: string;
  duration: number;
  type: string;
  partName: string;
}

interface WorkoutFeedbackData {
  difficulty: 'easy' | 'moderate' | 'hard';
  feeling: 'great' | 'okay' | 'tired' | 'exhausted';
}

type WorkoutPhase = 'loading' | 'briefing' | 'active' | 'rest' | 'summary' | 'feedback';

// Simple timer hook
const useTimer = () => {
  const startTimeRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (!startTimeRef.current) return 0;
    const duration = Date.now() - startTimeRef.current;
    startTimeRef.current = null;
    setIsRunning(false);
    return duration;
  }, []);

  return { start, stop, isRunning };
};

export default function CreateWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || 'hebrew';

  // Workout state
  const [composedWorkout, setComposedWorkout] = useState<ComposedWorkout | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [phase, setPhase] = useState<WorkoutPhase>('loading');

  // Tracking state
  const workoutTimer = useTimer();
  const componentTimer = useTimer();
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);

  // GPS state
  const [gpsStats, setGPSStats] = useState<GPSStats | null>(null);
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [showGPSWarning, setShowGPSWarning] = useState(false);
  const [gpsWarningType, setGPSWarningType] = useState<'unavailable' | 'poor_signal'>('unavailable');
  const [skipGPS, setSkipGPS] = useState(false);

  // Initialize workout
  useEffect(() => {
    const initializeWorkout = async () => {
      setPhase('loading');
      try {
        const urlParams = new URLSearchParams(location.search);
        const workoutId = urlParams.get('workoutId');
        const source = urlParams.get('source');

        let workout: ComposedWorkout;

        if (workoutId && source) {
          // Load specific workout
          if (source === 'strength') {
            const strengthWorkouts = await StrengthExplosive.list();
            const strengthWorkout = strengthWorkouts.find(w => w.id === workoutId);
            if (strengthWorkout) {
              workout = await WorkoutCompositionService.createShortWorkout(strengthWorkout);
            } else {
              workout = await WorkoutCompositionService.generateRandomWorkout();
            }
          } else if (source === 'special') {
            const specialWorkouts = await Special.list();
            const specialWorkout = specialWorkouts.find(w => w.id === workoutId);
            if (specialWorkout) {
              workout = await WorkoutCompositionService.createShortWorkout(specialWorkout);
            } else {
              workout = await WorkoutCompositionService.generateRandomWorkout();
            }
          } else {
            workout = await WorkoutCompositionService.generateRandomWorkout();
          }
        } else {
          // Generate random workout
          workout = await WorkoutCompositionService.generateRandomWorkout();
        }

        setComposedWorkout(workout);
        setPhase('briefing');
      } catch (error) {
        console.error('Error initializing workout:', error);
        // Fallback to home on error
        navigate(createPageUrl('Home'));
      }
    };

    initializeWorkout();
  }, [location.search, navigate]);

  // GPS initialization
  const initializeGPS = async () => {
    console.log('[GPS] Initializing GPS...');

    if (!gpsService.isSupported()) {
      console.log('[GPS] GPS not supported');
      setGPSWarningType('unavailable');
      setShowGPSWarning(true);
      return false;
    }

    try {
      const hasPermission = await gpsService.requestPermission();
      if (!hasPermission) {
        console.log('[GPS] Permission denied');
        setGPSWarningType('unavailable');
        setShowGPSWarning(true);
        return false;
      }

      const user = await User.me();
      const measurementSystem = user.measurement_system || 'metric';

      console.log('[GPS] Starting GPS tracking with', measurementSystem);
      gpsService.startTracking((stats) => {
        console.log('[GPS] Stats updated:', stats);
        setGPSStats(stats);
      }, measurementSystem);

      setIsGPSActive(true);
      console.log('[GPS] GPS active');
      return true;
    } catch (error) {
      console.error('[GPS] Initialization error:', error);
      setGPSWarningType('unavailable');
      setShowGPSWarning(true);
      return false;
    }
  };

  const stopGPS = () => {
    if (isGPSActive) {
      const finalStats = gpsService.stopTracking();
      setGPSStats(finalStats);
      setIsGPSActive(false);
    }
  };

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      stopGPS();
    };
  }, []);

  // Start workout
  const handleStartWorkout = async () => {
    if (!composedWorkout) return;

    workoutTimer.start();
    setCurrentPartIndex(0);
    setCurrentComponentIndex(0);

    // Check if first part requires GPS
    const firstPart = composedWorkout.parts[0];
    if (firstPart.requiresGPS && !skipGPS) {
      await initializeGPS();
    }

    setPhase('active');
    componentTimer.start();
  };

  // Advance to next component or part
  const handleComponentFinish = async () => {
    if (!composedWorkout || !componentTimer.isRunning) return;

    const currentPart = composedWorkout.parts[currentPartIndex];
    const currentComponent = currentPart.components[currentComponentIndex];

    // Record completed task
    const taskDuration = componentTimer.stop();
    setCompletedTasks(prev => [
      ...prev,
      {
        name: currentComponent.name,
        duration: taskDuration,
        type: currentComponent.type,
        partName: currentPart.name
      }
    ]);

    // Check if there's a rest period after this component
    if (currentComponent.restAfter && currentComponent.restAfter > 0) {
      // Add rest component
      setPhase('rest');
      componentTimer.start();
      return;
    }

    // Move to next component
    await advanceToNextComponent();
  };

  // Advance after rest
  const handleRestFinish = async () => {
    if (!composedWorkout || !componentTimer.isRunning) return;

    const currentPart = composedWorkout.parts[currentPartIndex];
    const currentComponent = currentPart.components[currentComponentIndex];

    // Record rest task
    const restDuration = componentTimer.stop();
    setCompletedTasks(prev => [
      ...prev,
      {
        name: 'מנוחה',
        duration: restDuration,
        type: 'rest',
        partName: currentPart.name
      }
    ]);

    // Move to next component
    await advanceToNextComponent();
  };

  // Save workout history
  const saveWorkoutHistory = useCallback(async () => {
    if (!composedWorkout || !workoutTimer.isRunning) return;

    try {
      const user = await User.me();
      const totalDuration = Math.round(workoutTimer.stop() / 60000); // Convert to minutes

      const exerciseNames = completedTasks
        .filter((task: CompletedTask) => task.type !== 'rest')
        .map((task: CompletedTask) => task.name);

      const workoutData = {
        userId: user.email || user.id,
        workout_title: composedWorkout.title,
        duration_completed: totalDuration,
        exercises_completed: exerciseNames,
        completion_date: new Date().toISOString(),
        difficulty: composedWorkout.difficulty === 'elite' ? 'hard' : 
          (composedWorkout.difficulty as 'easy' | 'moderate' | 'hard') || 'moderate',
        feeling: 'okay' as const,
        gps_stats: isGPSActive && gpsStats && gpsStats.totalDistance > 0 
          ? {
              distance: gpsStats.totalDistance,
              pace: gpsStats.averagePace,
              available: true
            }
          : { available: false }
      };

      await WorkoutHistory.create(workoutData);
    } catch (error) {
      console.error('Error saving workout history:', error);
      // Could show an error message to the user here
    }
  }, [composedWorkout, workoutTimer, completedTasks, isGPSActive, gpsStats]);

  // Advance to next component or part
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Debounced advance function
  const advanceToNextComponent = useCallback(async () => {
    if (!composedWorkout || isTransitioning) return;

    try {
      setIsTransitioning(true);

      // Clear any existing transition timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      const currentPart = composedWorkout.parts[currentPartIndex];

      // Add a small delay to prevent rapid transitions
      await new Promise(resolve => {
        transitionTimeoutRef.current = setTimeout(resolve, 300);
      });

      // Check if there are more components in current part
      if (currentComponentIndex < currentPart.components.length - 1) {
        setCurrentComponentIndex(prev => prev + 1);
        setPhase('active');
        componentTimer.start();
        return;
      }

      // Check if there are more parts
      if (currentPartIndex < composedWorkout.parts.length - 1) {
        // Stop GPS if leaving a GPS part
        if (currentPart.requiresGPS) {
          stopGPS();
        }

        // Move to next part
        const nextPartIndex = currentPartIndex + 1;
        const nextPart = composedWorkout.parts[nextPartIndex];

        setCurrentPartIndex(nextPartIndex);
        setCurrentComponentIndex(0);

        // Start GPS if next part requires it
        if (nextPart.requiresGPS && !skipGPS) {
          await initializeGPS();
        }

        setPhase('active');
        componentTimer.start();
        return;
      }

      // Workout complete
      stopGPS();
      await saveWorkoutHistory();
      setPhase('summary');
    } catch (error) {
      console.error('Error advancing to next component:', error);
      // Could show an error modal here
    } finally {
      setIsTransitioning(false);
    }
  }, [composedWorkout, currentPartIndex, currentComponentIndex, isTransitioning, skipGPS, initializeGPS, stopGPS, saveWorkoutHistory]);

  // Handle summary confirmation
  const handleSummaryConfirm = () => {
    setPhase('feedback');
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (feedback: WorkoutFeedbackData) => {
    console.log('Workout feedback:', feedback);
    navigate(createPageUrl('Home'));
  };

  // Loading state
  if (phase === 'loading' || !composedWorkout) {
    return (
      <div className="flex items-center justify-center text-dark-olive" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-idf-olive border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-medium text-dark-olive">
            {language === 'hebrew' ? 'יוצר אימון...' : 'Generating workout...'}
          </p>
        </div>
      </div>
    );
  }

  // Briefing phase
  if (phase === 'briefing') {
    return (
      <WorkoutBriefing
        workout={composedWorkout}
        onStart={handleStartWorkout}
        language={language}
      />
    );
  }

  // Summary phase
  if (phase === 'summary' && workoutTimer.isRunning) {
    const totalDuration = Math.round(workoutTimer.stop() / 1000);

    return (
      <WorkoutSummary
        workoutTitle={composedWorkout.title}
        totalDuration={totalDuration}
        completedTasks={completedTasks}
        onConfirm={handleSummaryConfirm}
        language={language}
      />
    );
  }

  // Feedback phase
  if (phase === 'feedback') {
    return (
      <WorkoutFeedback
        onSubmit={handleFeedbackSubmit}
        language={language}
      />
    );
  }

  // Active or rest phase
  const currentPart = composedWorkout.parts[currentPartIndex];
  const currentComponent = currentPart.components[currentComponentIndex];

  // Create rest component if in rest phase
  const displayComponent: WorkoutComponent = phase === 'rest' && currentComponent.restAfter
    ? {
        id: `rest-${currentPartIndex}-${currentComponentIndex}`,
        type: 'rest',
        name: language === 'hebrew' ? 'מנוחה' : 'Rest',
        duration: currentComponent.restAfter
      }
    : currentComponent;

  const totalComponentsInPart = currentPart.components.length;

  return (
    <>
      <div
        className="p-6 flex flex-col items-center justify-center text-dark-olive"
        style={{ height: 'calc(100vh - 73px)' }}
        dir={language === 'hebrew' ? 'rtl' : 'ltr'}
      >
        <AnimatePresence mode="wait">
          <ComponentDisplay
            key={displayComponent.id}
            component={displayComponent}
            onFinish={phase === 'rest' ? handleRestFinish : handleComponentFinish}
            gpsStats={isGPSActive ? gpsStats : null}
            language={language}
            partName={currentPart.name}
            currentIndex={currentComponentIndex}
            totalComponents={totalComponentsInPart}
            isLoading={isTransitioning}
          >
            <Button
              onClick={phase === 'rest' ? handleRestFinish : handleComponentFinish}
              disabled={isTransitioning}
              className="w-full mt-4"
            >
              {isTransitioning ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {language === 'hebrew' ? 'מעבר...' : 'Transitioning...'}
                </div>
              ) : phase === 'rest' ? (
                language === 'hebrew' ? 'סיים מנוחה' : 'Finish Rest'
              ) : (
                language === 'hebrew' ? 'סיים תרגיל' : 'Complete Exercise'
              )}
            </Button>
          </ComponentDisplay>
        </AnimatePresence>
      </div>

      {/* GPS Warning Modal */}
      {showGPSWarning && (
        <GPSWarningModal
          language={language}
          warningType={gpsWarningType}
          onContinueWithoutGPS={() => {
            setShowGPSWarning(false);
            setSkipGPS(true);
          }}
          onWaitForGPS={() => {
            setShowGPSWarning(false);
            initializeGPS();
          }}
        />
      )}
    </>
  );
}
