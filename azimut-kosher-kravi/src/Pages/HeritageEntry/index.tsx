import React, { useState, useEffect, useContext } from "react";
import { HeritageStory } from "@/Entities/HeritageStory";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, RotateCcw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { LanguageContext } from "@/components/shared/LanguageContext";
import FormattedContent from "@/features/heritage/components/FormattedContent";

export default function HeritageEntry() {
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useContext(LanguageContext);
  const location = useLocation();

  const getCategoryFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category');
  };

  const fetchRandomStory = async () => {
    setIsLoading(true);
    try {
      const category = getCategoryFromURL();
      let stories;
      if (category && category !== 'all') {
        stories = await HeritageStory.filter({ category: category });
      } else {
        stories = await HeritageStory.list();
      }

      if (stories.length > 0) {
        const randomIndex = Math.floor(Math.random() * stories.length);
        setStory(stories[randomIndex]);
      } else {
        setStory(null);
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      setStory(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRandomStory();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-dark-olive" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="w-16 h-16 border-4 border-idf-olive border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-dark-olive" dir="rtl">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 73px - 3rem)' }}>
        <div className="flex items-center justify-between mb-4">
          <Link to={createPageUrl("heritage")}>
            <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
              <ArrowLeft className="w-6 h-6 text-dark-olive" />
            </button>
          </Link>
          <BookOpen className="w-8 h-8 text-idf-olive" />
        </div>

        {story ? (
          <div className="bg-idf-olive rounded-xl card-shadow flex-grow flex flex-col overflow-hidden">
             <div className="p-6 border-b border-light-sand/20">
              <h2 className="text-2xl font-bold text-light-sand">{story.title}</h2>
              {story.author && <p className="text-sm text-light-sand/70 mt-1">{story.author}</p>}
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
              <FormattedContent content={story.content} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl card-shadow flex-grow flex items-center justify-center p-6">
            <p className="text-center text-gray-500">לא נמצאו סיפורים בקטגוריה זו.</p>
          </div>
        )}
        
        <div className="mt-4">
            <Button onClick={fetchRandomStory} className="w-full bg-idf-olive text-light-sand btn-press">
                <RotateCcw className="w-4 h-4 ml-2" />
                טען סיפור אחר
            </Button>
        </div>
      </div>
    </div>
  );
}