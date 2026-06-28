import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeritageStory, type HeritageStoryData } from "../../Entities/HeritageStory";
import { Button } from "../../components/ui/button";
import { ArrowRight, BookOpen, RotateCcw, Swords, Heart, Shield, Tag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import FormattedContent from "../../features/heritage/components/FormattedContent";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  PastBattles: Swords,
  FallenSoldiers: Heart,
  MilitaryConcepts: Shield,
  PhilosophyAndJudaism: BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  PastBattles: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  FallenSoldiers: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  MilitaryConcepts: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  PhilosophyAndJudaism: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  hebrew: {
    PastBattles: 'קרבות העבר',
    FallenSoldiers: 'חללי צה״ל',
    MilitaryConcepts: 'מושגים צבאיים',
    PhilosophyAndJudaism: 'פילוסופיה ויהדות',
  },
  english: {
    PastBattles: "Israel's Battles",
    FallenSoldiers: 'Fallen Soldiers',
    MilitaryConcepts: 'Military Concepts',
    PhilosophyAndJudaism: 'Philosophy & Judaism',
  },
  spanish: {
    PastBattles: 'Batallas históricas',
    FallenSoldiers: 'Soldados caídos',
    MilitaryConcepts: 'Conceptos militares',
    PhilosophyAndJudaism: 'Filosofía y Judaísmo',
  },
};

export default function HeritageEntry() {
  const [story, setStory] = useState<HeritageStoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storyKey, setStoryKey] = useState(0);
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = context?.allTexts[language];
  const location = useLocation();

  const isRTL = language === 'hebrew';

  const getCategoryFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category');
  }, [location.search]);

  const fetchRandomStory = useCallback(async () => {
    setIsLoading(true);
    try {
      const category = getCategoryFromURL();
      let stories: HeritageStoryData[];
      if (category && category !== 'all') {
        stories = await HeritageStory.filter({ category });
      } else {
        stories = await HeritageStory.list();
      }

      if (stories.length > 0) {
        const randomIndex = Math.floor(Math.random() * stories.length);
        setStory(stories[randomIndex]);
        setStoryKey(prev => prev + 1);
      } else {
        setStory(null);
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      setStory(null);
    }
    setIsLoading(false);
  }, [getCategoryFromURL]);

  useEffect(() => {
    fetchRandomStory();
  }, [location.search]);

  if (isLoading) {
    return <LoadingSpinner message={language === 'hebrew' ? 'טוען...' : language === 'spanish' ? 'Cargando...' : 'Loading...'} />;
  }

  const categoryKey = story?.category || 'PhilosophyAndJudaism';
  const CategoryIcon = CATEGORY_ICONS[categoryKey] || BookOpen;
  const categoryColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.PhilosophyAndJudaism;
  const categoryLabel = CATEGORY_LABELS[language === 'spanish' ? 'spanish' : language === 'english' ? 'english' : 'hebrew']?.[categoryKey] || categoryKey;

  const loadNextLabel = language === 'hebrew' ? 'טען סיפור אחר' : language === 'spanish' ? 'Cargar otra historia' : 'Load Another Story';
  const noStoriesLabel = language === 'hebrew' ? 'לא נמצאו סיפורים בקטגוריה זו.' : language === 'spanish' ? 'No se encontraron historias en esta categoría.' : 'No stories found in this category.';

  return (
    <div
      className="flex flex-col text-tactical-text"
      style={{ height: 'calc(100vh - 57px)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top bar */}
      <div className="px-5 pt-4 pb-3 glass-header flex items-center justify-between flex-shrink-0">
        <Link to={createPageUrl("Heritage")}>
          <button className="p-2 rounded-xl glass-card press-scale hover:glow-border transition-all duration-200">
            <ArrowRight className="w-5 h-5 text-tactical-muted" />
          </button>
        </Link>

        {story && (
          <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${categoryColor}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            {categoryLabel}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col px-5 py-4 gap-4">
        <AnimatePresence mode="wait">
          {story ? (
            <motion.div
              key={storyKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Story Card */}
              <div className="glass-card-elevated rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden relative">
                {/* Subtle accent bar */}
                <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 rounded-l-2xl opacity-60`}
                  style={{ background: 'linear-gradient(to bottom, var(--color-accent), transparent)' }}
                />

                {/* Story header */}
                <div className="px-6 pt-6 pb-4 border-b border-tactical-accent/10">
                  <h2 className={`text-xl font-bold text-tactical-text leading-snug ${isRTL ? 'text-right' : 'text-left'}`}>
                    {story.title}
                  </h2>
                  {story.author && (
                    <p className={`text-sm text-tactical-muted mt-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {story.author}
                      {story.dateWritten && (
                        <span className="mr-2 opacity-60"> · {story.dateWritten}</span>
                      )}
                    </p>
                  )}
                  {story.tags && story.tags.length > 0 && (
                    <div className={`flex flex-wrap gap-1.5 mt-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      {story.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full glass-card text-tactical-muted">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Story body */}
                <div className={`flex-1 overflow-y-auto px-6 py-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <FormattedContent content={story.content} isRTL={isRTL} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="glass-card rounded-2xl p-8 text-center max-w-sm">
                <BookOpen className="w-12 h-12 text-tactical-muted mx-auto mb-4 opacity-40" />
                <p className="text-tactical-muted">{noStoriesLabel}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load another button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0"
        >
          <Button
            onClick={fetchRandomStory}
            className="w-full py-4 text-base glow-border"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {loadNextLabel}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
