import React, { useState, useEffect, useContext } from "react";
import { WorkoutHistory } from "@/Entities/WorkoutHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Timer, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { LanguageContext } from "@/components/shared/LanguageContext";
import { User } from "@/Entities/User";

const handleWorkoutHistory = async (workoutData) => {
    try {
        const user = await User.me();
        // Fetch all history entries for the user, sorted by creation date (oldest first)
        // We fetch up to 100 to ensure we can accurately determine the oldest if the limit is slightly exceeded.
        const history = await WorkoutHistory.filter({ created_by: user.email }, 'created_date', 100);

        // If history count is 25 or more, delete the oldest entry to make space for the new one.
        // This ensures we maintain a maximum of 25 entries after adding a new one.
        if (history.length >= 25) {
            const oldestWorkout = history[0]; // The first element is the oldest because of 'created_date' sort
            await WorkoutHistory.delete(oldestWorkout.id);
            console.log("Deleted oldest workout history entry:", oldestWorkout.id);
        }

        // Create the new history entry
        await WorkoutHistory.create(workoutData);
        console.log("Created new workout history entry.");
    } catch (error) {
        console.error("Error managing workout history:", error);
    }
};

export default function WorkoutHistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        // Load only user's own workouts, sorted by most recent first, capped at 25.
        const data = await WorkoutHistory.filter({ created_by: user.email }, "-created_date", 25);
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
    const completedWorkouts = history.filter(w => w.completion_status === "Completed").length;
    const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;
    return { totalWorkouts, totalTime, completionRate };
  };

  const stats = getStats();

  const difficultyColors = {
    "Beginner": "bg-green-100 text-green-800",
    "Intermediate": "bg-yellow-100 text-yellow-800", 
    "Advanced": "bg-orange-100 text-orange-800",
    "Elite": "bg-red-100 text-red-800"
  };

  const statusColors = {
    "Completed": "bg-blue-100 text-blue-800",
    "Partial": "bg-gray-100 text-gray-800",
    "Skipped": "bg-pink-100 text-pink-800"
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
              היסטוריית אימונים
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white card-shadow">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-[var(--color-accent-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--color-text-dark)]">{stats.totalWorkouts}</div>
              <div className="text-xs text-gray-500">אימונים</div>
            </CardContent>
          </Card>
          <Card className="bg-white card-shadow">
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 text-[var(--color-accent-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--color-text-dark)]">{stats.totalTime}</div>
              <div className="text-xs text-gray-500">דקות</div>
            </CardContent>
          </Card>
          <Card className="bg-white card-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-[var(--color-accent-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--color-text-dark)]">{stats.completionRate}%</div>
              <div className="text-xs text-gray-500">הצלחה</div>
            </CardContent>
          </Card>
        </div>

        {history.length === 0 ? (
          <Card className="bg-white card-shadow">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">אין היסטוריה</h3>
              <p className="text-gray-600 mb-6">השלם אימון כדי להתחיל.</p>
              <Link to={createPageUrl("Home")}>
                <Button className="bg-[var(--color-accent-primary)] text-[var(--color-text-light)] btn-press">
                  התחל אימון ראשון
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
                        <span>{format(new Date(workout.created_date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${difficultyColors[workout.difficulty]} font-medium text-xs`}>
                      {workout.difficulty}
                    </Badge>
                    <Badge className={`${statusColors[workout.completion_status]} font-medium text-xs`}>
                      {workout.completion_status}
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