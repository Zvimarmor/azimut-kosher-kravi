import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/shared/LanguageContext';
import { DataService } from '../../lib/services/DataService';
import { Exercise } from '../../Entities/Exercise';
import { ExerciseCard } from '../../components/exercise/ExerciseCard';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { createPageUrl } from '../../lib/utils';

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const languageContext = useContext(LanguageContext);
  const texts = languageContext?.allTexts[languageContext.language];

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, exercises]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await DataService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.nameEnglish.toLowerCase().includes(query)
      );
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise-detail/${exerciseId}`);
  };

  const categories = [
    { value: 'all', label: texts?.allCategories || 'הכל' },
    { value: 'warmup', label: 'חימום' },
    { value: 'strength', label: texts?.strength || 'כוח' },
    { value: 'cardio', label: 'אירובי' },
    { value: 'special', label: texts?.special || 'מיוחד' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-neutral)] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-dark)] mb-4">
            {texts?.exerciseLibrary || 'הסבר תרגילים'}
          </h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={texts?.searchExercises || 'חפש תרגיל...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-[var(--color-accent-primary)] text-white'
                    : 'bg-white text-[var(--color-text-dark)] hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">טוען...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{texts?.noWorkoutsFound || 'לא נמצאו תרגילים'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => handleExerciseClick(exercise.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
