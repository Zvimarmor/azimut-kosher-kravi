import React, { useState, useEffect, useContext } from "react";
import { StrengthExplosive } from "../../Entities/StrengthExplosive";
import { WorkoutHistory } from "../../Entities/WorkoutHistory";
import { User } from "../../Entities/User";
import { Button } from "../../components/ui/button";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";

const pageTexts = {
  hebrew: {
    title: "אימון מהיר",
    subtitle: "תדריך משימה",
    message: "אימון מהיר ויעיל עם תרגילי כוח וחוזק",
    backHome: "חזרה למסך הבית",
    missionBrief: "תדריך משימה",
    startMission: "התחל משימה",
    finished: "סיום",
    rest: "מנוחה",
    missionAccomplished: "המשימה הושלמה בהצלחה!",
    outstandingWork: "עבודה מצוינת!",
    minutes: "דקות",
    seconds: "שניות",
    difficulty: "רמת קושי",
    feeling: "איך הרגשת?",
    easy: "קל",
    moderate: "בינוני",
    hard: "קשה",
    great: "מצוין",
    good: "טוב",
    okay: "בסדר",
    tired: "עייף",
    submit: "שלח"
  },
  english: {
    title: "Quick Workout",
    subtitle: "Mission Brief",
    message: "Quick and effective strength training workout",
    backHome: "Back to Home",
    missionBrief: "Mission Brief",
    startMission: "Start Mission",
    finished: "Finished",
    rest: "Rest",
    missionAccomplished: "Mission Accomplished!",
    outstandingWork: "Outstanding work!",
    minutes: "minutes",
    seconds: "seconds",
    difficulty: "Difficulty",
    feeling: "How did you feel?",
    easy: "Easy",
    moderate: "Moderate",
    hard: "Hard",
    great: "Great",
    good: "Good",
    okay: "Okay",
    tired: "Tired",
    submit: "Submit"
  }
};

export default function QuickWorkout() {
  const languageContext = useContext(LanguageContext);
  const language = (languageContext as any)?.language || 'hebrew';
  const currentTexts = pageTexts[language as keyof typeof pageTexts];
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [exercises] = useState<StrengthExplosive[]>([
    {
      title: "לחיצות",
      target_attributes: ['push_strength'],
      sets: 3,
      reps: 15,
      rest_between_sets: 60,
      instructions: "תרגיל לחיזוק שרירי החזה והכתפיים",
      difficulty: 'beginner'
    },
    {
      title: "סקוואטים",
      target_attributes: ['weight_work'],
      sets: 3,
      reps: 20,
      rest_between_sets: 60,
      instructions: "תרגיל לחיזוק שרירי הרגליים",
      difficulty: 'beginner'
    }
  ]);
  const [feedback, setFeedback] = useState<{ difficulty: string | null, feeling: string | null }>({ difficulty: null, feeling: null });

  useEffect(() => {
    // Initialize mock user - in real app this would come from auth
    User.me().then(user => {
      setCurrentUser(user);
    }).catch(() => {
      // If no user found, create a mock one - in a real app this would be handled by auth
      const mockUser = {
        id: '1',
        name: "חייל דוגמה",
        fitness_level: 'intermediate' as const,
        preferred_language: 'hebrew' as const,
        attributes: {
          push_strength: 5,
          pull_strength: 5,
          cardio_endurance: 5,
          running_volume: 5,
          rucking_volume: 5,
          weight_work: 5
        },
        created_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        unit: "גדוד 101",
        rank: "רב סמל"
      };
      setCurrentUser(mockUser);
    });
  }, []);

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setWorkoutTime(Date.now());
  };

  const handleFinishWorkout = async () => {
    if (!currentUser) return;

    const duration = Math.floor((Date.now() - workoutTime) / 60000); // minutes
    setIsWorkoutCompleted(true);

    // Create workout history entry
    try {
      await WorkoutHistory.create({
        userId: currentUser.id,
        workout_title: currentTexts.title,
        duration_completed: duration,
        difficulty: (feedback.difficulty as 'easy' | 'moderate' | 'hard') || 'moderate',
        feeling: (feedback.feeling as 'great' | 'good' | 'okay' | 'tired') || 'okay',
        exercises_completed: exercises.map(ex => ex.title),
        completion_date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving workout:', error);
    }

    alert(`${currentTexts.missionAccomplished} ${currentTexts.outstandingWork}`);
  };

  const goHome = () => {
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">טוען...</p>
      </div>
    );
  }

  if (isWorkoutCompleted) {
    return (
      <div className="p-6 h-full text-[var(--color-text-dark)]" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4">{currentTexts.missionAccomplished}</h1>
          <p className="text-lg text-center mb-8">{currentTexts.outstandingWork}</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">{currentTexts.difficulty}</h3>
              <div className="flex gap-2 justify-center">
                {['easy', 'moderate', 'hard'].map((level) => (
                  <Button
                    key={level}
                    variant={feedback.difficulty === level ? 'default' : 'outline'}
                    onClick={() => setFeedback(prev => ({ ...prev, difficulty: level }))}
                    className="flex-1"
                  >
                    {currentTexts[level as keyof typeof currentTexts]}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">{currentTexts.feeling}</h3>
              <div className="flex gap-2 justify-center">
                {['great', 'good', 'okay', 'tired'].map((feeling) => (
                  <Button
                    key={feeling}
                    variant={feedback.feeling === feeling ? 'default' : 'outline'}
                    onClick={() => setFeedback(prev => ({ ...prev, feeling }))}
                    className="flex-1"
                  >
                    {currentTexts[feeling as keyof typeof currentTexts]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={goHome} className="w-full mt-8">
            {currentTexts.backHome}
          </Button>
        </div>
      </div>
    );
  }

  if (isWorkoutStarted) {
    return (
      <div className="p-6 h-full text-[var(--color-text-dark)]" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">{currentTexts.title}</h1>

          <div className="space-y-4 mb-8">
            {exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-xl p-4 card-shadow">
                <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
                <p className="text-gray-600 mb-2">
                  {exercise.sets} סטים × {exercise.reps} חזרות
                </p>
                <p className="text-sm text-gray-500">
                  {exercise.instructions}
                </p>
              </div>
            ))}
          </div>

          <Button onClick={handleFinishWorkout} className="w-full">
            {currentTexts.finished}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full text-[var(--color-text-dark)]" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">{currentTexts.title}</h1>
        <h2 className="text-lg text-gray-600 mb-4">{currentTexts.missionBrief}</h2>
        <p className="text-gray-700 mb-8 leading-relaxed">{currentTexts.message}</p>

        <div className="space-y-4">
          <Button onClick={handleStartWorkout} className="w-full bg-[var(--color-accent-primary)] text-[var(--color-text-light)]">
            {currentTexts.startMission}
          </Button>

          <Button variant="outline" onClick={goHome} className="w-full">
            {currentTexts.backHome}
          </Button>
        </div>
      </div>
    </div>
  );
}