
import React, { useState, useEffect, useContext } from "react";
import { StrengthExplosive } from "../../Entities/StrengthExplosive";
import { Special } from "../../Entities/Special";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Dumbbell, Target, Search, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { Input } from "../../components/ui/input";

type WorkoutType = {
  id: string;
  title: string;
  instructions?: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "elite";
  source: "strength" | "special";
  category?: string;
};

export default function SelectWorkout() {
  const [workouts, setWorkouts] = useState<WorkoutType[]>([]);
  const [filteredWorkouts, setFiltereredWorkouts] = useState<WorkoutType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = context?.allTexts[language];

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    const filterWorkouts = () => {
      let filtered = workouts;
      
      if (searchTerm) {
        filtered = filtered.filter(workout => 
          (workout.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (workout.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory !== "all") {
        filtered = filtered.filter(workout => workout.source === selectedCategory);
      }
      
      setFiltereredWorkouts(filtered);
    };

    filterWorkouts();
  }, [workouts, searchTerm, selectedCategory]);

  const loadWorkouts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [strengthWorkouts, specialWorkouts] = await Promise.all([
        StrengthExplosive.list().catch(err => {
          console.error('Failed to load strength workouts:', err);
          throw new Error('Failed to load strength workouts');
        }),
        Special.list().catch(err => {
          console.error('Failed to load special workouts:', err);
          throw new Error('Failed to load special workouts');
        })
      ]);

      // Check if we got any workouts at all
      if (!strengthWorkouts?.length && !specialWorkouts?.length) {
        throw new Error('No workout data available. The required files may be missing or corrupted.');
      }

      const allWorkouts: WorkoutType[] = [
        ...strengthWorkouts.map(w => ({
          id: w.id || '',
          title: w.title,
          instructions: w.instructions,
          difficulty: w.difficulty || 'Beginner',
          source: 'strength' as const,
          category: w.category
        })),
        ...specialWorkouts.map(w => ({
          id: w.id || '',
          title: w.title,
          instructions: w.instructions,
          difficulty: w.difficulty || 'Beginner',
          source: 'special' as const,
          category: w.category
        }))
      ];

      setWorkouts(allWorkouts);
      setFiltereredWorkouts(allWorkouts);
    } catch (error: unknown) {
      console.error("Error loading workouts:", error);
      setError(error instanceof Error ? error.message : 'Failed to load workouts. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyColors: Record<WorkoutType['difficulty'], string> = {
    "beginner": "bg-green-100 text-green-800",
    "intermediate": "bg-yellow-100 text-yellow-800", 
    "advanced": "bg-orange-100 text-orange-800",
    "elite": "bg-red-100 text-red-800"
  };

  const categoryColors = {
    "strength": "bg-blue-100 text-blue-800",
    "special": "bg-purple-100 text-purple-800"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
        <Card className="bg-white card-shadow max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">{error}</h3>
            <p className="text-gray-600 mb-4">{"אירעה שגיאה בטעינת האימונים."}</p>
            <Button onClick={loadWorkouts}>
              {"נסה שנית"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
              <ArrowLeft className="w-6 h-6 text-[var(--color-text-dark)]" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--color-text-dark)]">
              <Target className="w-7 h-7 text-[var(--color-accent-primary)]" />
              {t?.selectWorkoutTitle || "בחר אימון"}
            </h1>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t?.searchWorkout || "חפש אימון..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-[var(--color-accent-primary)]" : ""}
            >
              {t?.allWorkouts || "הכל"}
            </Button>
            <Button
              variant={selectedCategory === "strength" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("strength")}
              className={selectedCategory === "strength" ? "bg-[var(--color-accent-primary)]" : ""}
            >
              {t?.categoryStrength || "כוח"}
            </Button>
            <Button
              variant={selectedCategory === "special" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("special")}
              className={selectedCategory === "special" ? "bg-[var(--color-accent-primary)]" : ""}
            >
              {t?.categorySpecial || "מיוחדים"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredWorkouts.length === 0 ? (
            <Card className="bg-white card-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">{t?.noWorkoutsFound || "לא נמצאו אימונים"}</h3>
                <p className="text-gray-600">{t?.tryDifferentSearch || "נסה חיפוש אחר או שנה את הקטגוריה."}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => (
                <Link key={workout.id} to={createPageUrl('CreateWorkout', { workoutId: workout.id, source: workout.source })}>
                  <Card className="bg-white card-shadow btn-press transition-all hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--color-text-dark)] mb-1">{workout.title}</h4>
                          {workout.instructions && (
                            <p className="text-sm text-gray-600 line-clamp-2">{workout.instructions}</p>
                          )}
                        </div>
                        <Dumbbell className="w-5 h-5 text-[var(--color-accent-primary)] ml-2 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${difficultyColors[workout.difficulty]} font-medium text-xs`}>
                          {workout.difficulty}
                        </Badge>
                        <Badge className={`${categoryColors[workout.source]} font-medium text-xs`}>
                          {workout.source === 'strength' ? (t?.categoryStrength || 'כוח') : (t?.categorySpecial || 'מיוחד')}
                        </Badge>
                        {workout.category && (
                          <Badge variant="outline" className="font-medium text-xs">
                            {workout.category}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
