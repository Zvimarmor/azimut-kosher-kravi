import React from 'react';
import { Exercise } from '../../Entities/Exercise';
import { Card } from '../ui/card';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden bg-white"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-200 overflow-hidden">
        {exercise.thumbnailUrl ? (
          <img
            src={exercise.thumbnailUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">💪</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)] mb-2">
          {exercise.name}
        </h3>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded ${difficultyColors[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {exercise.category}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {exercise.description}
        </p>
      </div>
    </Card>
  );
}
