import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";

export default function QuickWorkout() {
  const navigate = useNavigate();
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language ?? 'hebrew';

  useEffect(() => {
    navigate(createPageUrl('CreateWorkout', { type: 'short' }), { replace: true });
  }, [navigate]);

  return (
    <LoadingSpinner
      message={language === 'hebrew' ? 'טוען אימון מהיר...' : 'Loading quick workout...'}
    />
  );
}