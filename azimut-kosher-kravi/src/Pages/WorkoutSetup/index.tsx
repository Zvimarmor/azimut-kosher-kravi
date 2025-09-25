
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { LanguageContext } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Weight, Trees, Thermometer, Clock, Droplets, Check, Square, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@/Entities/User';


const equipmentOptions = [
  { id: 'weight', label: 'משקל' },
  { id: 'sandbag', label: 'שק חול מלא' },
];

const environmentOptions = [
  { id: 'dune', label: 'דיונה' },
  { id: 'track', label: '400מ’ משטח ישר' },
  { id: 'pullup_bar', label: 'מתח' },
  { id: 'dip_station', label: 'מקבילים' },
];

const temperatureOptions = [
  { id: 'hot', label: 'חם' },
  { id: 'mild', label: 'נעים' },
  { id: 'cold', label: 'קר' },
];

const timeOfDayOptions = [
  { id: 'morning', label: 'בוקר' },
  { id: 'noon', label: 'צהריים' },
  { id: 'evening', label: 'ערב' },
];

const rainOptions = [
    { id: 'rain', label: 'גשם' },
    { id: 'no_rain', label: 'לא גשם' },
];

const StyledCheckbox = ({ label, isChecked, onChange }: { label: string; isChecked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border transition-all btn-press card-shadow
      ${isChecked ? 'bg-idf-olive text-light-sand border-idf-olive' : 'bg-white text-dark-olive border-gray-200'}`}
  >
    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${isChecked ? 'border-light-sand' : 'border-gray-400'}`}>
      {isChecked && <Check className="w-4 h-4" />}
    </div>
    <span className="font-semibold">{label}</span>
  </button>
);

const StyledRadio = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border transition-all btn-press card-shadow
        ${isSelected ? 'bg-idf-olive text-light-sand border-idf-olive' : 'bg-white text-dark-olive border-gray-200'}`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isSelected ? 'border-light-sand' : 'border-gray-400'}`}>
        {isSelected && <div className="w-2.5 h-2.5 bg-light-sand rounded-full"></div>}
      </div>
      <span className="font-semibold">{label}</span>
    </button>
);

const Section = ({ title, icon: Icon, children, gridCols = 2 }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode; gridCols?: number }) => (
    <div className="bg-white p-4 rounded-xl card-shadow border border-gray-200">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-idf-olive">
            <Icon className="w-6 h-6" />
            {title}
        </h3>
        <div className={`grid grid-cols-${gridCols} gap-3`}>
            {children}
        </div>
    </div>
);


export default function WorkoutSetup() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [selections, setSelections] = useState({
    equipment: [],
    environment: [],
    temperature: null,
    timeOfDay: null,
    rain: null
  });
  const [rememberSettings, setRememberSettings] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
        const user = await User.me();
        if (user && user.remember_workout_settings && user.workout_settings) {
            setSelections(user.workout_settings);
            setRememberSettings(true);
        }
    };
    loadSettings();
  }, []);

  const handleToggleMulti = (category, value) => {
    setSelections(prev => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };

  const handleSelectSingle = (category, value) => {
    setSelections(prev => ({ ...prev, [category]: value }));
  };

  const handleGenerateWorkout = async () => {
    if (rememberSettings) {
        await User.updateMyUserData({ workout_settings: selections, remember_workout_settings: true });
    } else {
        await User.updateMyUserData({ workout_settings: null, remember_workout_settings: false });
    }

    const params = new URLSearchParams();
    if (selections.equipment.length > 0) params.append('equipment', selections.equipment.join(','));
    if (selections.environment.length > 0) params.append('environment', selections.environment.join(','));
    if (selections.temperature) params.append('temperature', selections.temperature);
    if (selections.timeOfDay) params.append('timeOfDay', selections.timeOfDay);
    if (selections.rain) params.append('rain', selections.rain);
    
    navigate(createPageUrl(`CreateWorkout?${params.toString()}`));
  };
  
  const isSelectionComplete = () => {
      // Equipment and environment are now optional
      return selections.temperature &&
             selections.timeOfDay &&
             selections.rain;
  }

  return (
    <div className="min-h-screen px-6 py-8 text-idf-olive" dir={language === 'hebrew' ? 'rtl' : 'ltr'} style={{'--text-color': '#5C5C0A'}}>
      <div className="max-w-md mx-auto">
        <div className={`flex items-center gap-4 mb-8`}>
          <Link to={createPageUrl("Home")}>
            <button className="p-2 rounded-lg bg-white border border-gray-200 card-shadow btn-press">
              <ArrowLeft className="w-6 h-6 text-dark-olive" />
            </button>
          </Link>
          <div className='text-right'>
            <h1 className="text-2xl font-bold text-dark-olive">הגדרת אימון</h1>
            <p className="text-gray-600 text-sm font-light">סמן את התנאים והציוד הזמינים (אופציונלי)</p>
          </div>
        </div>

        <div className="space-y-4">
            <Section title="ציוד" icon={Weight}>
                {equipmentOptions.map(opt => (
                    <StyledCheckbox key={opt.id} label={opt.label} isChecked={selections.equipment.includes(opt.id)} onChange={() => handleToggleMulti('equipment', opt.id)} />
                ))}
            </Section>

            <Section title="סביבה" icon={Trees}>
                {environmentOptions.map(opt => (
                    <StyledCheckbox key={opt.id} label={opt.label} isChecked={selections.environment.includes(opt.id)} onChange={() => handleToggleMulti('environment', opt.id)} />
                ))}
            </Section>
            
            <Section title="טמפרטורה" icon={Thermometer} gridCols={3}>
                 {temperatureOptions.map(opt => (
                    <StyledRadio key={opt.id} label={opt.label} isSelected={selections.temperature === opt.id} onClick={() => handleSelectSingle('temperature', opt.id)} />
                ))}
            </Section>

            <Section title="זמן ביום" icon={Clock} gridCols={3}>
                {timeOfDayOptions.map(opt => (
                    <StyledRadio key={opt.id} label={opt.label} isSelected={selections.timeOfDay === opt.id} onClick={() => handleSelectSingle('timeOfDay', opt.id)} />
                ))}
            </Section>

            <Section title="גשם" icon={Droplets} gridCols={2}>
                {rainOptions.map(opt => (
                    <StyledRadio key={opt.id} label={opt.label} isSelected={selections.rain === opt.id} onClick={() => handleSelectSingle('rain', opt.id)} />
                ))}
            </Section>

            <div className="bg-white/50 p-3 rounded-xl mt-4">
                 <button onClick={() => setRememberSettings(prev => !prev)} className="flex items-center gap-3 w-full text-right">
                    {rememberSettings ? <CheckSquare className="w-6 h-6 text-idf-olive" /> : <Square className="w-6 h-6 text-idf-olive" />}
                    <span className="font-semibold text-idf-olive">זכור סביבה זו</span>
                </button>
            </div>
        </div>
        
        <div className="mt-6">
            <Button 
                onClick={handleGenerateWorkout} 
                className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow text-lg disabled:opacity-50"
                disabled={!isSelectionComplete()}
            >
                <Zap className="w-5 h-5 ml-2 inline" />
                צור אימון
            </Button>
        </div>

      </div>
    </div>
  );
}
