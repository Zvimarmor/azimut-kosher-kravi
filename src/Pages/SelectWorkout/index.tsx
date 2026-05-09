
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { StrengthExplosive } from "../../Entities/StrengthExplosive";
import { Special } from "../../Entities/Special";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowRight, Dumbbell, Target, Search, AlertTriangle } from "lucide-react";
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

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } }
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
    "beginner": "bg-green-500/20 text-green-400 border-green-500/20",
    "intermediate": "bg-amber-500/20 text-amber-400 border-amber-500/20", 
    "advanced": "bg-orange-500/20 text-orange-400 border-orange-500/20",
    "elite": "bg-red-500/20 text-red-400 border-red-500/20"
  };

  const categoryColors = {
    "strength": "bg-blue-500/20 text-blue-400 border-blue-500/20",
    "special": "bg-purple-500/20 text-purple-400 border-purple-500/20"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-tactical-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
        <Card className="glass-card-elevated max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-tactical-text mb-2">{error}</h3>
            <p className="text-tactical-muted mb-4">{"אירעה שגיאה בטעינת האימונים."}</p>
            <Button onClick={loadWorkouts}>
              {"נסה שנית"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 h-full flex flex-col" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-xl glass-card press-scale hover:glow-border transition-all duration-200">
              <ArrowRight className="w-5 h-5 text-tactical-muted" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-tactical-text">
              <Target className="w-6 h-6 text-tactical-accent" />
              {t?.selectWorkoutTitle || "בחר אימון"}
            </h1>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          className="space-y-3 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tactical-muted/50 w-4 h-4" />
            <Input
              placeholder={t?.searchWorkout || "חפש אימון..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {[
              { key: "all", label: t?.allWorkouts || "הכל" },
              { key: "strength", label: t?.categoryStrength || "כוח" },
              { key: "special", label: t?.categorySpecial || "מיוחדים" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Workout List */}
        <div className="flex-1 overflow-y-auto">
          {filteredWorkouts.length === 0 ? (
            <Card className="glass-card-elevated">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-tactical-text mb-2">{t?.noWorkoutsFound || "לא נמצאו אימונים"}</h3>
                <p className="text-tactical-muted">{t?.tryDifferentSearch || "נסה חיפוש אחר או שנה את הקטגוריה."}</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredWorkouts.map((workout) => (
                <motion.div key={workout.id} variants={itemVariants}>
                  <Link to={createPageUrl('CreateWorkout', { workoutId: workout.id, source: workout.source })}>
                    <div className="glass-card hover-lift press-scale transition-all duration-300 p-4 hover:border-tactical-accent/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-tactical-text mb-1">{workout.title}</h4>
                          {workout.instructions && (
                            <p className="text-sm text-tactical-muted line-clamp-2">{workout.instructions}</p>
                          )}
                        </div>
                        <Dumbbell className="w-5 h-5 text-tactical-accent/50 ml-2 flex-shrink-0" />
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
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
