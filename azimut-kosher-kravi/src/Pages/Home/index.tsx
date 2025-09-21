import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LanguageContext } from "@/components/LanguageContext";
import { ChevronRight, BookOpen, MessageCircle, Activity, Dumbbell } from "lucide-react";
import { User } from '@/entities/User';

const mainButtons = [
  { title: "צור אימון", subtitle: "אימון ארוך/מותאם אישית", href: createPageUrl("WorkoutSetup"), icon: Activity, isPrimary: true },
  { title: "בחר אימון", subtitle: "בחר אימון קיים", href: createPageUrl("SelectWorkout"), icon: Dumbbell, isPrimary: false },
  { title: "תרבות ומורשת", subtitle: null, href: createPageUrl("Heritage"), icon: BookOpen, isPrimary: false },
  { title: "צ׳אט ייעוץ", subtitle: "צ׳אט מבוסס AI להתייעצות", href: createPageUrl("MilitaryChat"), icon: MessageCircle, isPrimary: false }
];

export default function Home() {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const user = await User.me();
        if (
          (user.push_strength === 0 || !user.push_strength) &&
          (user.pull_strength === 0 || !user.pull_strength) &&
          (user.cardio_endurance === 0 || !user.cardio_endurance)
        ) {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (error) {
        console.log("Onboarding check: user not logged in or error fetching user data.", error);
      }
    };
    checkOnboarding();
  }, [navigate]);

  return (
    <div 
      className="flex flex-col px-6 py-4 h-full overflow-hidden" 
      dir={language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <div className="flex-1 flex flex-col justify-center gap-6 max-w-md mx-auto w-full">
        {/* Primary Action - Create Workout */}
        <div className="mb-4">
          <Link to={mainButtons[0].href} className="block">
            <div className="bg-[var(--color-accent-primary)] text-[var(--color-text-light)] rounded-xl px-6 py-8 card-shadow btn-press transition-all duration-200 flex items-center justify-between">
              <div className="flex-1 text-right">
                <h2 className="text-2xl font-bold mb-2">{mainButtons[0].title}</h2>
                <p className="text-base opacity-90">{mainButtons[0].subtitle}</p>
              </div>
              <div className="flex items-center gap-3 mr-3">
                <Activity className="w-8 h-8 text-[var(--color-text-light)] opacity-90" />
                <ChevronRight className="w-6 h-6 text-[var(--color-text-light)] opacity-70" />
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-3">
          {mainButtons.slice(1).map((button, index) => {
            const IconComponent = button.icon;
            
            return (
              <Link key={index + 1} to={button.href} className="block">
                <div className="bg-white text-[var(--color-text-dark)] border border-gray-200 rounded-xl px-5 py-4 card-shadow btn-press transition-all duration-200 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <h3 className="text-lg font-semibold mb-1">{button.title}</h3>
                    {button.subtitle && (
                      <p className="text-sm text-gray-600">{button.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mr-2">
                    <IconComponent className="w-6 h-6 text-[var(--color-text-dark)] opacity-90" />
                    <ChevronRight className="w-5 h-5 text-[var(--color-text-dark)] opacity-70" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="text-center py-4 flex-shrink-0">
        <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
          {`לזכר אופק בכר ושילה הר-אבן ז״ל\nכל הזכויות שמורות ©`}
        </p>
      </div>
    </div>
  );
}