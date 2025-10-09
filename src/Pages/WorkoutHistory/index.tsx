import React, { useState, useEffect, useContext } from "react";
import { WorkoutHistory } from "../../Entities/WorkoutHistory";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Calendar, Timer, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { format } from "date-fns";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { User } from "../../Entities/User";

const handleWorkoutHistory = async (workoutData: Partial<WorkoutHistory>) => {
  try {
    const user = await User.me();
    // Use userId consistently for identifying user's workouts
    const history = await WorkoutHistory.filter({ userId: user.email || user.id });

    // No need to manually manage the history limit as DataService handles it
    await WorkoutHistory.create({
      ...workoutData,
      userId: user.email || user.id // Ensure userId is set correctly
    });
    console.log("Created new workout history entry.");
  } catch (error) {
    console.error("Error managing workout history:", error);
  }
};

export default function WorkoutHistoryPage() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || 'hebrew';

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        // Load user's workouts, using either email or id as userId
        const data = await WorkoutHistory.filter({ userId: user.email || user.id });
        setHistory(data);
      } catch (error) {
        console.error("Error loading workout history:", error);
      }
      setIsLoading(false);
    };
    loadHistory();
  }, []);

  const getStats = () => {
    const totalWorkouts = history.length;
    const totalTime = history.reduce((sum, workout) => sum + (workout.duration_completed || 0), 0);
    const completedWorkouts = history.length; // All workouts are considered completed
    const completionRate = 100; // Since we don't track partial completions anymore
    return { totalWorkouts, totalTime, completionRate };
  };

  const stats = getStats();

  const difficultyColors: Record<string, string> = {
    "easy": "bg-green-100 text-green-800",
    "moderate": "bg-yellow-100 text-yellow-800", 
    "hard": "bg-orange-100 text-orange-800"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full text-[var(--color-text-dark)] overflow-y-auto" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
              <ArrowLeft className="w-6 h-6 text-[var(--color-text-dark)]" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-7 h-7 text-[var(--color-accent-primary)]" />
              {language === 'hebrew' ? 'היסטוריית אימונים' : 'Workout History'}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white card-shadow">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-[var(--color-accent-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--color-text-dark)]">{stats.totalWorkouts}</div>
              <div className="text-xs text-gray-500">{language === 'hebrew' ? 'אימונים' : 'Workouts'}</div>
            </CardContent>
          </Card>
          <Card className="bg-white card-shadow">
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 text-[var(--color-accent-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--color-text-dark)]">{stats.totalTime}</div>
              <div className="text-xs text-gray-500">{language === 'hebrew' ? 'דקות' : 'Minutes'}</div>
            </CardContent>
          </Card>
          <Card className="bg-white card-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-[var(--color-accent-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--color-text-dark)]">{stats.completionRate}%</div>
              <div className="text-xs text-gray-500">{language === 'hebrew' ? 'הצלחה' : 'Success Rate'}</div>
            </CardContent>
          </Card>
        </div>

        {history.length === 0 ? (
          <Card className="bg-white card-shadow">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">{language === 'hebrew' ? 'אין היסטוריית אימונים' : 'No Workout History'}</h3>
              <p className="text-gray-600 mb-6">{language === 'hebrew' ? 'השלם אימון ראשון כדי לראות את ההיסטוריה שלך כאן.' : 'Complete your first workout to see your history here.'}</p>
              <Link to={createPageUrl("Home")}>
                <Button className="bg-[var(--color-accent-primary)] text-[var(--color-text-light)] btn-press">
                  {language === 'hebrew' ? 'חזור לדף הבית' : 'Back to Home Page'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((workout) => (
              <Card key={workout.id} className="bg-white card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--color-text-dark)] mb-1">{workout.workout_title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Timer className="w-4 h-4" />
                        <span>{workout.duration_completed} דקות</span>
                        <span>•</span>
                        <span>{format(new Date(workout.completion_date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${difficultyColors[workout.difficulty]} font-medium text-xs`}>
                      {language === 'hebrew' 
                        ? workout.difficulty === 'easy' ? 'קל'
                          : workout.difficulty === 'moderate' ? 'בינוני'
                          : 'קשה'
                        : workout.difficulty}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 font-medium text-xs">
                      {language === 'hebrew' ? 'הושלם' : 'Completed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}