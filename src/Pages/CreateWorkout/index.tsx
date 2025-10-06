
import React, { useState, useEffect, useContext } from "react";
import { Warmup } from "../../Entities/Warmup";
import { RunningEndurance } from "../../Entities/RunningEndurance";
import { StrengthExplosive } from "../../Entities/StrengthExplosive";
import { Special } from "../../Entities/Special";
import { WorkoutHistory } from "../../Entities/WorkoutHistory";
import { User } from "../../Entities/User";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Timer, Target, Zap, Play, Check, RotateCcw, ZapOff, Clock, ThumbsUp, Star, Coffee, MapPin, Navigation } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { gpsService, type GPSStats } from "../../lib/services/gpsService";
import { GPSPermissionModal } from "../../components/gps/GPSPermissionModal";
import { GPSWarningModal } from "../../components/gps/GPSWarningModal";

const pageTexts = {
  hebrew: {
    missionBrief: "תדריך משימה",
    startMission: "התחל משימה",
    finished: "סיימתי",
    rest: "מנוחה",
    missionAccomplished: "משימה הושלמה!",
    outstandingWork: "עבודה מצוינת, חייל. המשימה תועדה.",
    nextMission: "המשימה הבאה",
    round: "סיבוב",
    of: "מתוך",
    generatingMission: "יוצר משימה...",
    reps: "חזרות",
    seconds: "שניות",
    km: "ק״מ",
    workoutSummary: "סיכום האימון",
    totalDuration: "זמן כולל",
    minutes: "דקות",
    confirm: "אישור",
    workoutFeedback: "משוב על האימון",
    howWasWorkout: "איך היה האימון?",
    howDoYouFeel: "איך אתה מרגיש?",
    easy: "קל",
    moderate: "בינוני",
    hard: "קשה",
    good: "טוב",
    exhausted: "מותש",
    fresh: "רענן",
    submit: "שלח"
  },
  english: {
    missionBrief: "Mission Brief",
    startMission: "Start Mission",
    finished: "Finished",
    rest: "Rest",
    missionAccomplished: "Mission Accomplished!",
    outstandingWork: "Outstanding work, soldier. Mission logged.",
    nextMission: "Next Mission",
    round: "Round",
    of: "of",
    generatingMission: "Generating mission...",
    reps: "reps",
    seconds: "seconds",
    km: "km",
    workoutSummary: "Workout Summary",
    totalDuration: "Total Duration",
    minutes: "minutes",
    confirm: "Confirm",
    workoutFeedback: "Workout Feedback",
    howWasWorkout: "How was the workout?",
    howDoYouFeel: "How do you feel?",
    easy: "Easy",
    moderate: "Moderate", 
    hard: "Hard",
    good: "Good",
    exhausted: "Exhausted",
    fresh: "Fresh",
    submit: "Submit"
  }
};

const TimerDisplay = ({ startTime }) => {
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
    return <div className="text-6xl font-bold font-mono text-dark-olive">{minutes}:{seconds}</div>;
};

const RestDisplay = ({ duration, onComplete }) => {
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

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="text-3xl font-bold text-idf-olive mb-4">{pageTexts.hebrew.rest}</h2>
            <div className="text-6xl font-bold font-mono text-dark-olive">{minutes}:{seconds}</div>
        </motion.div>
    );
};

const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
    return `${seconds}s`;
};

const generateTasksFromWorkout = (workout, userLevel) => {
    const tasks = [];
    const level = Math.max(0, Math.min(10, Math.round(userLevel))); // Ensure level is 0-10

    if (!workout || !workout.exercises) {
        console.warn("Invalid workout object provided to generateTasksFromWorkout:", workout);
        return [];
    }

    // Helper function to get value for user level
    const getValue = (exercise) => {
        if (Array.isArray(exercise.values)) {
            // Mock data format: array of values
            return exercise.values[level] || exercise.values[0] || 1;
        } else if (typeof exercise.values === 'object') {
            // CSV data format: object with string keys
            const value = exercise.values[level.toString()] || exercise.values['0'] || exercise.values[Object.keys(exercise.values)[0]];
            return value !== null && value !== undefined ? value : 1;
        }
        return 1; // Fallback
    };

    // Handle Fartlek/Interval training
    if (workout.title && (workout.title.includes("פארטלק") || workout.title.includes("Fartlek"))) {
        const rounds = parseInt(workout.rounds) || 1;

        for (let round = 0; round < rounds; round++) {
            workout.exercises.forEach((ex, index) => {
                const value = getValue(ex);
                const unit = ex.type === 'rep_based' ? pageTexts.hebrew.reps : pageTexts.hebrew.seconds;

                tasks.push({
                    type: 'active',
                    title: `${ex.name} (${round + 1}/${rounds})`,
                    description: `${value} ${unit}`
                });

                // Add rest between exercises (but not after the last exercise of the last round)
                if (!(round === rounds - 1 && index === workout.exercises.length - 1) && ex.rest_seconds > 0) {
                    tasks.push({ type: 'rest', duration: ex.rest_seconds });
                }
            });
        }
    }
    // Handle Strength training with multiple rounds
    else if (workout.category === "Strength" && parseInt(workout.rounds) > 1) {
        const rounds = parseInt(workout.rounds) || 1;

        for (let round = 0; round < rounds; round++) {
            workout.exercises.forEach((ex, index) => {
                const value = getValue(ex);
                const unit = ex.type === 'rep_based' ? pageTexts.hebrew.reps : pageTexts.hebrew.seconds;

                tasks.push({
                    type: 'active',
                    title: `${ex.name} (${round + 1}/${rounds})`,
                    description: `${value} ${unit}`
                });

                // Add rest between exercises
                if (ex.rest_seconds > 0 && !(round === rounds - 1 && index === workout.exercises.length - 1)) {
                    tasks.push({ type: 'rest', duration: ex.rest_seconds });
                }
            });
        }
    }
    // Handle single exercises or cardio
    else {
        workout.exercises.forEach((ex, index) => {
            const value = getValue(ex);
            const unit = ex.type === 'distance_based' ? pageTexts.hebrew.km :
                        (ex.type === 'time_based' ? pageTexts.hebrew.seconds : pageTexts.hebrew.reps);

            tasks.push({
                type: 'active',
                title: ex.name,
                description: `${value} ${unit}`
            });

            // Add rest if specified and not the last exercise
            if (ex.rest_seconds > 0 && index < workout.exercises.length - 1) {
                tasks.push({ type: 'rest', duration: ex.rest_seconds });
            }
        });
    }

    return tasks;
};

const assembleFullWorkout = async () => {
    // Random pattern selection (50/50 chance)
    const usePatternA = Math.random() < 0.5;
    
    if (usePatternA) {
        // Pattern A: Warmup + Special
        const warmups = await Warmup.list();
        const specials = await Special.list();
        
        if (warmups.length === 0 || specials.length === 0) {
            throw new Error("Not enough workout data available for Pattern A");
        }
        
        const selectedWarmup = warmups[Math.floor(Math.random() * warmups.length)];
        const selectedSpecial = specials[Math.floor(Math.random() * specials.length)];
        
        return [selectedWarmup, selectedSpecial];
    } else {
        // Pattern B: Warmup + Running + Strength
        const warmups = await Warmup.list();
        const runningWorkouts = await RunningEndurance.list();
        const strengthWorkouts = await StrengthExplosive.list();
        
        if (warmups.length === 0 || runningWorkouts.length === 0 || strengthWorkouts.length === 0) {
            throw new Error("Not enough workout data available for Pattern B");
        }
        
        const selectedWarmup = warmups[Math.floor(Math.random() * warmups.length)];
        const selectedRunning = runningWorkouts[Math.floor(Math.random() * runningWorkouts.length)];
        const selectedStrength = strengthWorkouts[Math.floor(Math.random() * strengthWorkouts.length)];
        
        // Randomize order of main parts (running first or strength first)
        const mainParts = [selectedRunning, selectedStrength];
        if (Math.random() < 0.5) {
            mainParts.reverse();
        }
        
        return [selectedWarmup, ...mainParts];
    }
};

const handleWorkoutHistory = async (workoutData: Omit<WorkoutHistory, 'id'>) => {
    try {
        // Create the new history entry
        await WorkoutHistory.create(workoutData);
        console.log('Workout history saved successfully');
    } catch (error) {
        console.error("Error managing workout history:", error);
    }
};

export default function CreateWorkout() {
  const navigate = useNavigate();
  const [currentWorkouts, setCurrentWorkouts] = useState([]);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1); // -1 for pre-workout brief
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [feedback, setFeedback] = useState({ difficulty: null, feeling: null });
  const { language } = useContext(LanguageContext);
  const location = useLocation();

  // GPS tracking states
  const [showGPSPermission, setShowGPSPermission] = useState(false);
  const [showGPSWarning, setShowGPSWarning] = useState(false);
  const [gpsWarningType, setGPSWarningType] = useState<'unavailable' | 'poor_signal'>('unavailable');
  const [gpsStats, setGPSStats] = useState<GPSStats | null>(null);
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [skipGPS, setSkipGPS] = useState(false);

  const currentTexts = pageTexts[language];
  const currentTask = tasks[currentTaskIndex];
  const currentWorkout = currentWorkouts[currentWorkoutIndex];

  // Check if current workout is a running workout
  const isRunningWorkout = (workout: any): workout is RunningEndurance => {
    return workout && 'distance' in workout && workout.category === 'Cardio';
  };

  useEffect(() => {
    const generateWorkoutSequence = async () => {
      setIsLoading(true);
      try {
        // Check URL parameters for specific workout
        const urlParams = new URLSearchParams(location.search);
        const workoutId = urlParams.get('workoutId');
        const source = urlParams.get('source');

        let assembledWorkouts;

        if (workoutId && source) {
          // Load specific workout
          let workout;
          if (source === 'strength') {
            const strengthWorkouts = await StrengthExplosive.list();
            workout = strengthWorkouts.find(w => w.id === workoutId);
          } else if (source === 'special') {
            const specialWorkouts = await Special.list();
            workout = specialWorkouts.find(w => w.id === workoutId);
          }

          if (workout) {
            assembledWorkouts = [workout];
          } else {
            console.warn(`Workout with ID ${workoutId} not found in ${source}`);
            assembledWorkouts = await assembleFullWorkout();
          }
        } else {
          // Generate random workout sequence
          assembledWorkouts = await assembleFullWorkout();
        }

        setCurrentWorkouts(assembledWorkouts);
        setCurrentWorkoutIndex(0);

        const user = await User.me();
        const userLevels = {
          push_strength: user.attributes?.push_strength || 1,
          pull_strength: user.attributes?.pull_strength || 1,
          cardio_endurance: user.attributes?.cardio_endurance || 1,
          running_volume: user.attributes?.running_volume || 1,
          rucking_volume: user.attributes?.rucking_volume || 1,
          weight_work: user.attributes?.weight_work || 1
        };

        if (assembledWorkouts.length > 0) {
          const firstWorkout = assembledWorkouts[0];
          const relevantLevels = firstWorkout.target_attributes.map(attr => userLevels[attr] || 0);
          const avgUserLevel = relevantLevels.length > 0 ? relevantLevels.reduce((a, b) => a + b, 0) / relevantLevels.length : 1;
          const generatedTasks = generateTasksFromWorkout(firstWorkout, avgUserLevel);
          setTasks(generatedTasks);
        }
      } catch (error) {
        console.error("Error assembling workout sequence:", error);
      } finally {
        setIsLoading(false);
      }
    };
    generateWorkoutSequence();
  }, [location.search]);

  // GPS initialization
  const initializeGPS = async () => {
    if (!gpsService.isSupported()) {
      setGPSWarningType('unavailable');
      setShowGPSWarning(true);
      return;
    }

    try {
      const hasPermission = await gpsService.requestPermission();
      if (!hasPermission) {
        setGPSWarningType('unavailable');
        setShowGPSWarning(true);
        return;
      }

      // Get user's measurement system preference
      const user = await User.me();
      const measurementSystem = user.measurement_system || 'metric';

      // Start GPS tracking
      gpsService.startTracking((stats) => {
        setGPSStats(stats);
      }, measurementSystem);

      setIsGPSActive(true);
    } catch (error) {
      console.error('GPS initialization error:', error);
      setGPSWarningType('unavailable');
      setShowGPSWarning(true);
    }
  };

  // Stop GPS tracking
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

  const startWorkout = async () => {
      // Check if this is a running workout and GPS not skipped
      if (isRunningWorkout(currentWorkout) && !skipGPS) {
        await initializeGPS();
      }

      setCurrentTaskIndex(0);
      setTaskStartTime(Date.now());
      setWorkoutStartTime(Date.now());
  };

  const advanceTask = async () => {
      if (currentTaskIndex >= 0) {
          const taskEndTime = Date.now();
          const taskDuration = taskEndTime - taskStartTime;
          setCompletedTasks(prev => [...prev, {
              ...currentTask,
              duration: taskDuration,
              index: currentTaskIndex,
              workoutTitle: currentWorkout?.title
          }]);
      }

      if (currentTaskIndex < tasks.length - 1) {
          setCurrentTaskIndex(prev => prev + 1);
          if(tasks[currentTaskIndex + 1].type === 'active') {
             setTaskStartTime(Date.now());
          }
      } else if (currentWorkoutIndex < currentWorkouts.length - 1) {
          // Stop GPS if leaving a running workout
          if (isRunningWorkout(currentWorkout)) {
            stopGPS();
          }

          const nextWorkoutIndex = currentWorkoutIndex + 1;
          setCurrentWorkoutIndex(nextWorkoutIndex);
          setCurrentTaskIndex(0);

          const nextWorkout = currentWorkouts[nextWorkoutIndex];

          // Start GPS if next workout is running
          if (isRunningWorkout(nextWorkout) && !skipGPS) {
            await initializeGPS();
          }

          const user = await User.me();
          const userLevels = {
            push_strength: user.attributes?.push_strength || 1,
            pull_strength: user.attributes?.pull_strength || 1,
            cardio_endurance: user.attributes?.cardio_endurance || 1,
            running_volume: user.attributes?.running_volume || 1,
            rucking_volume: user.attributes?.rucking_volume || 1,
            weight_work: user.attributes?.weight_work || 1
          };
          const relevantLevels = nextWorkout.target_attributes.map(attr => userLevels[attr] || 0);
          const avgUserLevel = relevantLevels.length > 0 ? relevantLevels.reduce((a, b) => a + b, 0) / relevantLevels.length : 1;
          const generatedTasks = generateTasksFromWorkout(nextWorkout, avgUserLevel);
          setTasks(generatedTasks);
          setTaskStartTime(Date.now());
      }
      else {
          // Stop GPS before completing workout
          stopGPS();
          markWorkoutComplete();
      }
  };

  const markWorkoutComplete = async () => {
    if (!workoutStartTime) return;
    try {
      const user = await User.me();
      const totalWorkoutDuration = Math.round((Date.now() - workoutStartTime) / 60000); // in minutes

      // Collect all exercise names from completed tasks
      const exerciseNames = completedTasks
        .filter(task => task.type === 'active')
        .map(task => task.title);

      await handleWorkoutHistory({
        userId: user.email || user.id,
        workout_title: currentWorkouts.map(w => w.title).join(" + "),
        duration_completed: totalWorkoutDuration,
        difficulty: (currentWorkouts[currentWorkouts.length - 1]?.difficulty?.toLowerCase() || "moderate") as 'easy' | 'moderate' | 'hard',
        feeling: 'okay', // Default, will be updated with feedback
        completion_date: new Date().toISOString(),
        exercises_completed: exerciseNames,
      });
      setIsCompleted(true);
      setShowSummary(true);
    } catch (error) {
      console.error("Error saving workout history:", error);
    }
  };

  const handleSummaryConfirm = () => {
      setShowSummary(false);
      setShowFeedback(true);
  };

  const handleFeedbackSubmit = () => {
      navigate(createPageUrl("Home"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-dark-olive" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-idf-olive border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-medium text-dark-olive">{currentTexts.generatingMission}</p>
        </div>
      </div>
    );
  }

  // Workout Summary Screen
  if (showSummary) {
    const totalWorkoutDuration = workoutStartTime ? Math.round((Date.now() - workoutStartTime) / 1000) : 0; 
    const totalMinutes = Math.floor(totalWorkoutDuration / 60);
    const remainingSeconds = totalWorkoutDuration % 60;
    
    return (
        <div className="p-6 text-dark-olive" dir="rtl">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Clock className="w-8 h-8 text-idf-olive" />
                    <h1 className="text-2xl font-bold">{currentTexts.workoutSummary}</h1>
                </div>
                
                <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100 mb-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-dark-olive mb-2">
                            {currentWorkouts.map(w => w.title).join(" + ")}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-idf-olive">
                            <Timer className="w-5 h-5" />
                            <span>{currentTexts.totalDuration}: {totalMinutes} {currentTexts.minutes} {remainingSeconds} {currentTexts.seconds}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {completedTasks.map((task, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 text-right">
                                    <h4 className="font-semibold text-dark-olive">{task.title}</h4>
                                    {task.workoutTitle && <p className="text-sm text-gray-600">({task.workoutTitle})</p>}
                                    {task.type === 'rest' && <p className="text-sm text-gray-600">{currentTexts.rest}</p>}
                                </div>
                                <div className="text-sm font-mono text-idf-olive">
                                    {formatTime(task.duration)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <Button onClick={handleSummaryConfirm} className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow text-lg">
                    <Check className="w-5 h-5 ml-2" />
                    {currentTexts.confirm}
                </Button>
            </div>
        </div>
    );
  }

  // Workout Feedback Screen
  if (showFeedback) {
    return (
        <div className="p-6 text-dark-olive" dir="rtl">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Star className="w-8 h-8 text-idf-olive" />
                    <h1 className="text-2xl font-bold">{currentTexts.workoutFeedback}</h1>
                </div>
                
                <div className="space-y-8">
                    {/* How was the workout */}
                    <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
                        <h3 className="text-lg font-bold text-center mb-4 text-dark-olive">{currentTexts.howWasWorkout}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: 'easy', label: currentTexts.easy, icon: Coffee },
                                { key: 'moderate', label: currentTexts.moderate, icon: Target },
                                { key: 'hard', label: currentTexts.hard, icon: Zap }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setFeedback(prev => ({ ...prev, difficulty: key }))}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all btn-press card-shadow
                                        ${feedback.difficulty === key ? 'bg-idf-olive text-light-sand border-idf-olive' : 'bg-white text-dark-olive border-gray-200'}`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-semibold">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* How do you feel */}
                    <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100">
                        <h3 className="text-lg font-bold text-center mb-4 text-dark-olive">{currentTexts.howDoYouFeel}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: 'good', label: currentTexts.good, icon: ThumbsUp },
                                { key: 'exhausted', label: currentTexts.exhausted, icon: ZapOff },
                                { key: 'fresh', label: currentTexts.fresh, icon: Star }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setFeedback(prev => ({ ...prev, feeling: key }))}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all btn-press card-shadow
                                        ${feedback.feeling === key ? 'bg-idf-olive text-light-sand border-idf-olive' : 'bg-white text-dark-olive border-gray-200'}`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-semibold">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <Button 
                    onClick={handleFeedbackSubmit} 
                    disabled={!feedback.difficulty || !feedback.feeling}
                    className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow mt-8 text-lg disabled:opacity-50"
                >
                    <Check className="w-5 h-5 ml-2" />
                    {currentTexts.submit}
                </Button>
            </div>
        </div>
    );
  }

  // Briefing Screen
  if (currentTaskIndex === -1 && currentWorkout && currentWorkouts.length > 0) {
    return (
       <div className="p-6 text-dark-olive" dir="rtl">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <Link to={createPageUrl("Home")}>
                    <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
                      <ArrowLeft className="w-6 h-6 text-dark-olive" />
                    </button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold">{currentTexts.missionBrief}</h1>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100 text-center space-y-4">
                     <Target className="w-10 h-10 text-idf-olive mx-auto" />
                     <h2 className="text-xl font-bold text-dark-olive">{currentWorkout.title}</h2>
                     <p className="text-gray-600 whitespace-pre-wrap">{currentWorkout.instructions}</p>
                     <div className="flex justify-center gap-4">
                         <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-dark-olive">{currentWorkout.difficulty}</span>
                         <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-dark-olive">{currentWorkout.category}</span>
                     </div>
                </div>
                 <Button onClick={startWorkout} className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow mt-6 text-lg">
                    <Play className="w-5 h-5 ml-2" />
                    {currentTexts.startMission}
                </Button>
            </div>
       </div>
    )
  }

  // Workout Player Screen
  if (currentTask && currentWorkout) {
    const showGPSStats = isRunningWorkout(currentWorkout) && isGPSActive && gpsStats;

    return (
        <>
          <div className="p-6 flex flex-col items-center justify-center text-dark-olive" style={{ height: 'calc(100vh - 73px)' }} dir="rtl">
             <AnimatePresence mode="wait">
              {currentTask.type === 'active' ? (
                   <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md text-center">
                      <h3 className="text-lg font-semibold text-gray-500 mb-2">{currentWorkout.title} ({currentWorkoutIndex + 1}/{currentWorkouts.length})</h3>
                      <h2 className="text-3xl font-bold text-idf-olive mb-2">{currentTask.title}</h2>
                      <p className="text-gray-600 text-lg whitespace-pre-wrap mb-8">{currentTask.description}</p>

                      <TimerDisplay startTime={taskStartTime} />

                      {/* GPS Stats Display */}
                      {showGPSStats && (
                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 card-shadow">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Navigation className="w-4 h-4 text-idf-olive" />
                              <span className="text-xs text-gray-500">{language === 'hebrew' ? 'מרחק' : 'Distance'}</span>
                            </div>
                            <div className="text-2xl font-bold text-dark-olive">
                              {gpsService.formatDistance(gpsStats.totalDistance)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 card-shadow">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Timer className="w-4 h-4 text-idf-olive" />
                              <span className="text-xs text-gray-500">{language === 'hebrew' ? 'קצב ממוצע' : 'Avg Pace'}</span>
                            </div>
                            <div className="text-2xl font-bold text-dark-olive">
                              {gpsService.formatPace(gpsStats.averagePace)}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button onClick={advanceTask} className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow mt-12 text-lg">
                          <Check className="w-5 h-5 ml-2" />
                          {currentTexts.finished}
                      </Button>
                   </motion.div>
              ) : (
                  <motion.div key="rest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <RestDisplay duration={currentTask.duration} onComplete={advanceTask} />
                  </motion.div>
              )}
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

  return null;
}
