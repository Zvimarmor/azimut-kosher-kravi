
import React, { useState, useEffect, useContext } from "react";
import { StrengthExplosive } from "@/Entities/StrengthExplosive";
import { Special } from "@/Entities/Special";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Target, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { LanguageContext } from "@/components/shared/LanguageContext";
import { Input } from "@/components/ui/input";

export default function SelectWorkout() {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    const filterWorkouts = () => { // Moved filterWorkouts inside useEffect
      let filtered = workouts;
      
      if (searchTerm) {
        filtered = filtered.filter(workout => 
          workout.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workout.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory !== "all") {
        filtered = filtered.filter(workout => workout.source === selectedCategory);
      }
      
      setFilteredWorkouts(filtered);
    };

    filterWorkouts();
  }, [workouts, searchTerm, selectedCategory]);

  const loadWorkouts = async () => {
    try {
      const [strengthWorkouts, specialWorkouts] = await Promise.all([
        StrengthExplosive.list(),
        Special.list()
      ]);
      
      const allWorkouts = [
        ...strengthWorkouts.map(w => ({ ...w, source: 'strength' })),
        ...specialWorkouts.map(w => ({ ...w, source: 'special' }))
      ];
      
      setWorkouts(allWorkouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
    }
    setIsLoading(false);
  };

  const difficultyColors = {
    "Beginner": "bg-green-100 text-green-800",
    "Intermediate": "bg-yellow-100 text-yellow-800", 
    "Advanced": "bg-orange-100 text-orange-800",
    "Elite": "bg-red-100 text-red-800"
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
              בחר אימון
            </h1>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="חפש אימון..."
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
              הכל
            </Button>
            <Button
              variant={selectedCategory === "strength" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("strength")}
              className={selectedCategory === "strength" ? "bg-[var(--color-accent-primary)]" : ""}
            >
              כוח
            </Button>
            <Button
              variant={selectedCategory === "special" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("special")}
              className={selectedCategory === "special" ? "bg-[var(--color-accent-primary)]" : ""}
            >
              מיוחדים
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredWorkouts.length === 0 ? (
            <Card className="bg-white card-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">לא נמצאו אימונים</h3>
                <p className="text-gray-600">נסה חיפוש אחר או שנה את הקטגוריה.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => (
                <Link key={workout.id} to={createPageUrl(`CreateWorkout?workoutId=${workout.id}&source=${workout.source}`)}>
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
                          {workout.source === 'strength' ? 'כוח' : 'מיוחד'}
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
