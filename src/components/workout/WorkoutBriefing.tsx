import React from "react";
import { motion } from "framer-motion";
import { Target, Clock, Zap, Play, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ComposedWorkout, WorkoutPart } from "../../lib/services/workoutComposition";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { createPageUrl } from "../../lib/utils";

interface WorkoutBriefingProps {
  workout: ComposedWorkout;
  onStart: () => void;
  language?: 'hebrew' | 'english';
}

export const WorkoutBriefing: React.FC<WorkoutBriefingProps> = ({
  workout,
  onStart,
  language = 'hebrew'
}) => {
  const texts = {
    hebrew: {
      missionBrief: 'תדריך משימה',
      startMission: 'התחל משימה',
      estimatedDuration: 'זמן משוער',
      minutes: 'דקות',
      parts: 'חלקים',
      components: 'תרגילים',
      difficulty: 'רמת קושי',
      overview: 'סקירה כללית'
    },
    english: {
      missionBrief: 'Mission Brief',
      startMission: 'Start Mission',
      estimatedDuration: 'Estimated Duration',
      minutes: 'minutes',
      parts: 'Parts',
      components: 'Exercises',
      difficulty: 'Difficulty',
      overview: 'Overview'
    }
  };

  const t = texts[language];

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-orange-100 text-orange-800',
    elite: 'bg-red-100 text-red-800'
  };

  const partTypeColors = {
    warmup: 'bg-blue-100 text-blue-800',
    cardio: 'bg-red-100 text-red-800',
    strength: 'bg-purple-100 text-purple-800',
    special: 'bg-amber-100 text-amber-800'
  };

  const partTypeLabels = {
    hebrew: {
      warmup: 'חימום',
      cardio: 'קרדיו',
      strength: 'כוח',
      special: 'מיוחד'
    },
    english: {
      warmup: 'Warmup',
      cardio: 'Cardio',
      strength: 'Strength',
      special: 'Special'
    }
  };

  const totalComponents = workout.parts.reduce((sum, part) => sum + part.components.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 text-dark-olive"
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
              <ArrowLeft className="w-6 h-6 text-dark-olive" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t.missionBrief}</h1>
          </div>
        </div>

        {/* Main Brief Card */}
        <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100 mb-6">
          <Target className="w-10 h-10 text-idf-olive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-olive text-center mb-3">{workout.title}</h2>

          {workout.description && (
            <p className="text-gray-600 whitespace-pre-wrap text-center mb-4">{workout.description}</p>
          )}

          {/* Stats Row */}
          <div className="flex justify-center gap-4 mb-4">
            <Badge className={difficultyColors[workout.difficulty]}>
              {workout.difficulty}
            </Badge>
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{workout.estimatedDuration} {t.minutes}</span>
            </div>
          </div>
        </div>

        {/* Parts Overview */}
        <div className="bg-white rounded-xl p-6 card-shadow border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-dark-olive mb-4 text-center">{t.overview}</h3>

          <div className="space-y-3">
            {workout.parts.map((part, index) => (
              <div key={part.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-idf-olive">{index + 1}.</span>
                    <span className="font-semibold text-dark-olive">{part.name}</span>
                  </div>
                  <Badge className={partTypeColors[part.type]}>
                    {partTypeLabels[language][part.type]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{part.components.length} {t.components}</span>
                  {part.requiresGPS && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      GPS
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm font-semibold">
            <span className="text-gray-600">סה"כ:</span>
            <span className="text-dark-olive">{totalComponents} {t.components}</span>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={onStart}
          className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow text-lg"
        >
          <Play className="w-5 h-5 ml-2" />
          {t.startMission}
        </Button>
      </div>
    </motion.div>
  );
};
