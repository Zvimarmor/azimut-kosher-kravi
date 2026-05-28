import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";

export default function QuickWorkout() {
  const navigate = useNavigate();
  const languageContext = useContext(LanguageContext);
  const language = (languageContext as any)?.language || 'hebrew';

  useEffect(() => {
    // Redirect immediately to the CreateWorkout page in 'short' mode
    navigate(createPageUrl('CreateWorkout', { type: 'short' }), { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center text-tactical-text" style={{ height: 'calc(100vh - 73px)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-tactical-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-medium text-tactical-text">
          {language === 'hebrew' ? 'טוען אימון מהיר...' : 'Loading quick workout...'}
        </p>
      </div>
    </div>
  );
}