import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { Pause, Play, X, AlertTriangle } from "lucide-react";

interface CompletedTask {
  name: string;
  duration: number;
  type: string;
  partName: string;
  skipped?: boolean;
}

interface WorkoutFeedbackData {
  difficulty: 'easy' | 'moderate' | 'hard';
  feeling: 'great' | 'okay' | 'tired' | 'exhausted';
}

type WorkoutPhase = 'loading' | 'briefing' | 'active' | 'rest' | 'summary' | 'feedback';

// Simple timer hook
const useTimer = () => {
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    pausedAtRef.current = null;
    totalPausedRef.current = 0;
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (!startTimeRef.current) return 0;
    const now = Date.now();
    // Account for any current pause
    const currentPause = pausedAtRef.current ? (now - pausedAtRef.current) : 0;
    const duration = now - startTimeRef.current - totalPausedRef.current - currentPause;
    startTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedRef.current = 0;
    setIsRunning(false);
    return Math.max(0, duration);
  }, []);

  const pause = useCallback(() => {
    if (isRunning && !pausedAtRef.current) {
      pausedAtRef.current = Date.now();
    }
  }, [isRunning]);

  const resume = useCallback(() => {
    if (pausedAtRef.current) {
      totalPausedRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, []);

  return { start, stop, pause, resume, isRunning, isPaused: !!pausedAtRef.current };
};

export default function CreateWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || 'hebrew';
  // Components that only support hebrew/english fall back to english for Spanish users
  const displayLanguage = (language === 'spanish' ? 'english' : language) as 'hebrew' | 'english';

  // Workout state
  const [composedWorkout, setComposedWorkout] = useState<ComposedWorkout | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [phase, setPhase] = useState<WorkoutPhase>('loading');

  // Tracking state
  const workoutTimer = useTimer();
  const componentTimer = useTimer();
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);

  // Pause / quit state
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // GPS state
  const [gpsStats, setGPSStats] = useState<GPSStats | null>(null);
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [showGPSWarning, setShowGPSWarning] = useState(false);
  const [gpsWarningType, setGPSWarningType] = useState<'unavailable' | 'poor_signal'>('unavailable');
  const [skipGPS, setSkipGPS] = useState(false);

  // Transition debounce
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // ============ COMPUTED VALUES ============

  // Calculate total components across all parts
  const totalComponentsAll = composedWorkout
    ? composedWorkout.parts.reduce((sum, part) => sum + part.components.length, 0)
    : 0;

  // Calculate completed component count (only exercises, not rest entries)
  const completedComponentCount = completedTasks.filter(t => t.type !== 'rest').length;

  // Current absolute component index for progress
  const currentAbsoluteIndex = composedWorkout
    ? composedWorkout.parts.slice(0, currentPartIndex).reduce((sum, part) => sum + part.components.length, 0) + currentComponentIndex
    : 0;

  // Progress fraction (0 to 1)
  const overallProgress = totalComponentsAll > 0 ? currentAbsoluteIndex / totalComponentsAll : 0;

  // ============ INITIALIZE ============

  useEffect(() => {
    const initializeWorkout = async () => {
      setPhase('loading');
      try {
        const urlParams = new URLSearchParams(location.search);
        const workoutId = urlParams.get('workoutId');
        const source = urlParams.get('source');
        const type = urlParams.get('type');

        let workout: ComposedWorkout;
        const sessionId = urlParams.get('sessionId');
        const isPartnerMode = !!sessionId; // Group training → enable partner mode

        if (type === 'short') {
          // Quick workout mode — generate a random short workout
          workout = await WorkoutCompositionService.generateSmartWorkout(isPartnerMode);
        } else if (workoutId && source) {
          // Load specific workout
          if (source === 'strength') {
            const strengthWorkouts = await StrengthExplosive.list();
            const strengthWorkout = strengthWorkouts.find(w => w.id === workoutId);
            if (strengthWorkout) {
              workout = await WorkoutCompositionService.createShortWorkout(strengthWorkout);
            } else {
              workout = await WorkoutCompositionService.generateSmartWorkout(isPartnerMode);
            }
          } else if (source === 'special') {
            const specialWorkouts = await Special.list();
            const specialWorkout = specialWorkouts.find(w => w.id === workoutId);
            if (specialWorkout) {
              workout = await WorkoutCompositionService.createShortWorkout(specialWorkout);
            } else {
              workout = await WorkoutCompositionService.generateSmartWorkout(isPartnerMode);
            }
          } else {
            workout = await WorkoutCompositionService.generateSmartWorkout(isPartnerMode);
          }
        } else {
          // Generate smart workout (replaces old random generation)
          workout = await WorkoutCompositionService.generateSmartWorkout(isPartnerMode);
        }

        setComposedWorkout(workout);
        setPhase('briefing');
      } catch (error) {
        console.error('Error initializing workout:', error);
        navigate(createPageUrl('Home'));
      }
    };

    initializeWorkout();
  }, [location.search, navigate]);

  // ============ GPS ============

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

  // Cleanup transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // ============ WORKOUT CONTROLS ============

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

  // ============ PAUSE / RESUME ============

  const handlePause = () => {
    setIsPaused(true);
    workoutTimer.pause();
    componentTimer.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    workoutTimer.resume();
    componentTimer.resume();
  };

  // ============ QUIT ============

  const handleQuitRequest = () => {
    setShowQuitModal(true);
  };

  const handleQuitConfirm = async () => {
    setShowQuitModal(false);
    stopGPS();

    // Save partial workout
    if (composedWorkout && workoutTimer.isRunning) {
      try {
        const user = await User.me();
        const totalDuration = Math.round(workoutTimer.stop() / 60000);

        const exerciseNames = completedTasks
          .filter((task: CompletedTask) => task.type !== 'rest' && !task.skipped)
          .map((task: CompletedTask) => task.name);

        await WorkoutHistory.create({
          userId: user.email || user.id,
          workout_title: composedWorkout.title + (language === 'hebrew' ? ' (חלקי)' : ' (partial)'),
          duration_completed: totalDuration,
          exercises_completed: exerciseNames,
          completion_date: new Date().toISOString(),
          difficulty: composedWorkout.difficulty === 'elite' ? 'hard' :
            (composedWorkout.difficulty as 'easy' | 'moderate' | 'hard') || 'moderate',
          feeling: 'okay' as const,
          gps_stats: isGPSActive && gpsStats && gpsStats.totalDistance > 0
            ? { distance: gpsStats.totalDistance, pace: gpsStats.averagePace, available: true }
            : { available: false }
        });
      } catch (error) {
        console.error('Error saving partial workout:', error);
      }
    }

    navigate(createPageUrl('Home'));
  };

  const handleQuitCancel = () => {
    setShowQuitModal(false);
  };

  // ============ SKIP EXERCISE ============

  const handleSkip = async () => {
    if (!composedWorkout) return;

    const currentPart = composedWorkout.parts[currentPartIndex];
    const currentComponent = currentPart.components[currentComponentIndex];

    // Record as skipped
    const taskDuration = componentTimer.stop();
    setCompletedTasks(prev => [
      ...prev,
      {
        name: currentComponent.name,
        duration: taskDuration,
        type: currentComponent.type,
        partName: currentPart.name,
        skipped: true
      }
    ]);

    // Advance directly (no rest after skipped exercise)
    await advanceToNextComponent();
  };

  // ============ ADVANCE LOGIC ============

  const handleComponentFinish = async () => {
    if (!composedWorkout) return;

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
      setPhase('rest');
      componentTimer.start();
      return;
    }

    // Move to next component
    await advanceToNextComponent();
  };

  const handleRestFinish = async () => {
    if (!composedWorkout) return;

    const currentPart = composedWorkout.parts[currentPartIndex];

    // Record rest task (stop timer only if running)
    const restDuration = componentTimer.isRunning ? componentTimer.stop() : 0;
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
      const totalDurationMs = workoutTimer.stop();
      const totalDurationMinutes = Math.round(totalDurationMs / 60000);

      // Store duration in milliseconds for accurate summary display
      setWorkoutDuration(totalDurationMs);

      const exerciseNames = completedTasks
        .filter((task: CompletedTask) => task.type !== 'rest' && !task.skipped)
        .map((task: CompletedTask) => task.name);

      const workoutData = {
        userId: user.email || user.id,
        workout_title: composedWorkout.title,
        duration_completed: totalDurationMinutes,
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
    }
  }, [composedWorkout, workoutTimer, completedTasks, isGPSActive, gpsStats]);

  // Debounced advance function
  const advanceToNextComponent = useCallback(async () => {
    if (!composedWorkout || isTransitioning) return;

    try {
      setIsTransitioning(true);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      const currentPart = composedWorkout.parts[currentPartIndex];

      // Small delay to prevent rapid transitions
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
    } finally {
      setIsTransitioning(false);
    }
  }, [composedWorkout, currentPartIndex, currentComponentIndex, isTransitioning, skipGPS, saveWorkoutHistory]);

  // ============ POST-WORKOUT ============

  const handleSummaryConfirm = () => {
    setPhase('feedback');
  };

  const handleFeedbackSubmit = (feedback: WorkoutFeedbackData) => {
    console.log('Workout feedback:', feedback);
    navigate(createPageUrl('Home'));
  };

  // ============ HELPER: Get next component for preview ============

  const getNextComponent = (): WorkoutComponent | null => {
    if (!composedWorkout) return null;
    const currentPart = composedWorkout.parts[currentPartIndex];

    // Next component in same part
    if (currentComponentIndex < currentPart.components.length - 1) {
      return currentPart.components[currentComponentIndex + 1];
    }

    // First component of next part
    if (currentPartIndex < composedWorkout.parts.length - 1) {
      const nextPart = composedWorkout.parts[currentPartIndex + 1];
      return nextPart.components[0] || null;
    }

    return null;
  };

  // ============ RENDER ============

  // Loading state
  if (phase === 'loading' || !composedWorkout) {
    return (
      <LoadingSpinner
        message={language === 'hebrew' ? 'יוצר אימון...' : 'Generating workout...'}
      />
    );
  }

  // Briefing phase
  if (phase === 'briefing') {
    return (
      <WorkoutBriefing
        workout={composedWorkout}
        onStart={handleStartWorkout}
        language={displayLanguage}
      />
    );
  }

  // Summary phase
  if (phase === 'summary') {
    return (
      <WorkoutSummary
        workoutTitle={composedWorkout.title}
        totalDuration={workoutDuration}
        completedTasks={completedTasks}
        onConfirm={handleSummaryConfirm}
        language={displayLanguage}
      />
    );
  }

  // Feedback phase
  if (phase === 'feedback') {
    return (
      <WorkoutFeedback
        onSubmit={handleFeedbackSubmit}
        language={displayLanguage}
      />
    );
  }

  // ============ ACTIVE / REST PHASE ============

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
  const nextComponent = getNextComponent();

  // Texts
  const pauseText = language === 'hebrew' ? 'השהה' : 'Pause';
  const resumeText = language === 'hebrew' ? 'המשך' : 'Resume';
  const quitText = language === 'hebrew' ? 'עזוב אימון' : 'Quit Workout';
  const quitConfirmTitle = language === 'hebrew' ? 'לצאת מהאימון?' : 'Quit Workout?';
  const quitConfirmMsg = language === 'hebrew'
    ? 'ההתקדמות שלך תישמר כאימון חלקי.'
    : 'Your progress will be saved as a partial workout.';
  const quitConfirmYes = language === 'hebrew' ? 'כן, צא' : 'Yes, Quit';
  const quitConfirmNo = language === 'hebrew' ? 'המשך להתאמן' : 'Keep Training';

  return (
    <>
      <div
        className="flex flex-col text-tactical-text"
        style={{ height: 'calc(100vh - 73px)' }}
        dir={language === 'hebrew' ? 'rtl' : 'ltr'}
      >
        {/* ===== TOP BAR: Progress + Controls ===== */}
        <div className="px-4 pt-3 pb-2 glass-header">
          {/* Part segment indicator */}
          <div className="flex items-center justify-center gap-1 mb-2">
            {composedWorkout.parts.map((part, idx) => {
              const partLabels: Record<string, Record<string, string>> = {
                hebrew: { warmup: 'חימום', cardio: 'קרדיו', strength: 'כוח', special: 'מיוחד', sprints: 'ספרינטים', closing: 'סיום', motivation: 'חנתר' },
                english: { warmup: 'Warmup', cardio: 'Cardio', strength: 'Strength', special: 'Special', sprints: 'Sprints', closing: 'Closing', motivation: 'Talk' }
              };
              const isActive = idx === currentPartIndex;
              const isCompleted = idx < currentPartIndex;

              return (
                <React.Fragment key={part.id}>
                  {idx > 0 && (
                    <div className={`w-6 h-px ${isCompleted ? 'bg-tactical-accent' : 'bg-tactical-muted/30'}`} />
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md transition-all duration-300 ${
                      isActive
                        ? 'gradient-accent text-tactical-bg'
                        : isCompleted
                          ? 'text-tactical-accent'
                          : 'text-tactical-muted/50'
                    }`}
                  >
                    {partLabels[language]?.[part.type] || part.type}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="w-full h-1.5 bg-tactical-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-accent rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(overallProgress * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={handleQuitRequest}
              className="p-1.5 rounded-lg text-tactical-muted hover:text-red-400 transition-colors"
              title={quitText}
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs text-tactical-muted font-mono-data">
              {completedComponentCount}/{totalComponentsAll - completedTasks.filter(t => t.type === 'rest').length}
            </span>

            <button
              onClick={isPaused ? handleResume : handlePause}
              className="p-1.5 rounded-lg text-tactical-muted hover:text-tactical-accent transition-colors"
              title={isPaused ? resumeText : pauseText}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ===== PAUSE OVERLAY ===== */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center glass-card-elevated m-4 rounded-2xl"
          >
            <Pause className="w-16 h-16 text-tactical-accent mb-4" />
            <h2 className="text-2xl font-bold text-tactical-text mb-2">
              {language === 'hebrew' ? 'אימון מושהה' : 'Workout Paused'}
            </h2>
            <p className="text-tactical-muted mb-8">
              {language === 'hebrew' ? 'קח נשימה, אתה שולט בקצב' : 'Take a breath, you control the pace'}
            </p>
            <Button onClick={handleResume} className="px-8 py-4 text-lg glow-border-strong">
              <Play className="w-5 h-5 ml-2" />
              {resumeText}
            </Button>
          </motion.div>
        )}

        {/* ===== EXERCISE CONTENT ===== */}
        {!isPaused && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <ComponentDisplay
                key={displayComponent.id}
                component={displayComponent}
                onFinish={phase === 'rest' ? handleRestFinish : handleComponentFinish}
                onSkip={phase !== 'rest' ? handleSkip : undefined}
                gpsStats={isGPSActive ? gpsStats : null}
                language={displayLanguage}
                partName={currentPart.name}
                currentIndex={currentComponentIndex}
                totalComponents={totalComponentsInPart}
                isLoading={isTransitioning}
                nextComponent={phase === 'rest' ? nextComponent : null}
              />
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ===== QUIT CONFIRMATION MODAL ===== */}
      {showQuitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card-elevated rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-tactical-text mb-2">{quitConfirmTitle}</h3>
            <p className="text-tactical-muted mb-6 text-sm">{quitConfirmMsg}</p>
            <div className="flex gap-3">
              <Button
                onClick={handleQuitCancel}
                variant="outline"
                className="flex-1 py-3"
              >
                {quitConfirmNo}
              </Button>
              <Button
                onClick={handleQuitConfirm}
                className="flex-1 py-3 bg-red-500/80 hover:bg-red-500 border-red-500/50"
              >
                {quitConfirmYes}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* GPS Warning Modal */}
      {showGPSWarning && (
        <GPSWarningModal
          language={displayLanguage}
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
