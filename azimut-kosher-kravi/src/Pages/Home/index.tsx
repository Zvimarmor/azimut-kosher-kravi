import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../../lib/utils";
import { LanguageContext } from "../../components/shared/LanguageContext";
import { ChevronRight, BookOpen, MessageCircle, Activity, Dumbbell } from "lucide-react";
import { User } from '../../Entities/User';

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
          (user.attributes.push_strength === 0 || !user.attributes.push_strength) &&
          (user.attributes.pull_strength === 0 || !user.attributes.pull_strength) &&
          (user.attributes.cardio_endurance === 0 || !user.attributes.cardio_endurance)
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
        <div className="mb-8">
          <Link to={mainButtons[0].href} className="block">
            <div className="bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-[var(--color-text-light)] rounded-2xl px-8 py-12 card-shadow btn-press transition-all duration-200 flex items-center justify-between hover:shadow-lg">
              <div className="flex-1 text-right">
                <h2 className="text-3xl font-bold mb-3">{mainButtons[0].title}</h2>
                <p className="text-lg opacity-95">{mainButtons[0].subtitle}</p>
              </div>
              <div className="flex items-center gap-4 mr-4">
                <Activity className="w-12 h-12 text-[var(--color-text-light)] opacity-95" />
                <ChevronRight className="w-8 h-8 text-[var(--color-text-light)] opacity-80" />
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-4">
          {mainButtons.slice(1).map((button, index) => {
            const IconComponent = button.icon;

            return (
              <Link key={index + 1} to={button.href} className="block">
                <div className="bg-white text-[var(--color-text-dark)] border border-gray-200 rounded-xl px-6 py-5 card-shadow btn-press transition-all duration-200 flex items-center justify-between hover:border-[var(--color-accent-primary)] hover:shadow-md">
                  <div className="flex-1 text-right">
                    <h3 className="text-lg font-semibold mb-1">{button.title}</h3>
                    {button.subtitle && (
                      <p className="text-sm text-gray-600">{button.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mr-3">
                    <IconComponent className="w-7 h-7 text-[var(--color-accent-primary)] opacity-90" />
                    <ChevronRight className="w-6 h-6 text-[var(--color-text-dark)] opacity-70" />
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