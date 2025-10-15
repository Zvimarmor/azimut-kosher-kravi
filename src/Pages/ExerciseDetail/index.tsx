import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../components/shared/LanguageContext';
import { DataService } from '../../lib/services/DataService';
import { Exercise } from '../../Entities/Exercise';
import { ExerciseMediaGallery } from '../../components/exercise/ExerciseMediaGallery';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const languageContext = useContext(LanguageContext);
  const texts = languageContext?.allTexts[languageContext.language];
  const language = languageContext?.language || 'hebrew';

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, [id]);

  const loadExercise = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await DataService.getExerciseById(id);
      setExercise(data);
    } catch (error) {
      console.error('Failed to load exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-neutral)] flex items-center justify-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-neutral)] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">התרגיל לא נמצא</p>
        <Button onClick={() => navigate(-1)}>
          {texts?.back || 'חזור'}
        </Button>
      </div>
    );
  }

  const displayName = language === 'hebrew' ? exercise.name : exercise.nameEnglish;
  const displayDescription = language === 'hebrew' ? exercise.description : exercise.descriptionEnglish;
  const displayFormTips = language === 'hebrew' ? exercise.formTips : exercise.formTipsEnglish;

  return (
    <div className="min-h-screen bg-[var(--color-bg-neutral)]">
      {/* Back Button */}
      <div className="sticky top-0 bg-[var(--color-accent-primary)] p-4 z-10 shadow">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-[var(--color-accent-secondary)]"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {texts?.back || 'חזור'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-dark)] mb-2">
            {displayName}
          </h1>
          <div className="flex gap-2">
            <span className="text-sm px-3 py-1 bg-gray-200 rounded">
              {exercise.category}
            </span>
            <span className="text-sm px-3 py-1 bg-gray-200 rounded">
              {exercise.difficulty}
            </span>
          </div>
        </div>

        {/* Media Gallery */}
        {(exercise.images.length > 0 || exercise.videoUrl) && (
          <div className="mb-6">
            <ExerciseMediaGallery
              images={exercise.images}
              videoUrl={exercise.videoUrl}
              videoType={exercise.videoType}
            />
          </div>
        )}

        {/* Description */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[var(--color-text-dark)] mb-3">
            {texts?.instructions || 'הוראות'}
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {displayDescription}
          </p>
        </div>

        {/* Form Tips */}
        {displayFormTips && displayFormTips.length > 0 && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-[var(--color-text-dark)] mb-3">
              {texts?.formTips || 'טיפים לביצוע נכון'}
            </h2>
            <ul className="space-y-2">
              {displayFormTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[var(--color-accent-primary)] mr-2 font-bold">✓</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-[var(--color-text-dark)] mb-3">
              {texts?.commonMistakes || 'טעויות נפוצות'}
            </h2>
            <ul className="space-y-2">
              {exercise.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2 font-bold">✗</span>
                  <span className="text-gray-700">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Target Muscles */}
        {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-[var(--color-text-dark)] mb-3">
              {texts?.targetMuscles || 'שרירים מעורבים'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {exercise.targetMuscles.map((muscle, index) => (
                <span key={index} className="px-3 py-1 bg-[var(--color-highlight)] text-[var(--color-text-dark)] rounded-full text-sm">
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-[var(--color-text-dark)] mb-3">
              {texts?.equipment || 'ציוד'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {exercise.equipment.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
