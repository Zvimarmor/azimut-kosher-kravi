
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../lib/utils';
import { LanguageContext } from '../../components/shared/LanguageContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Zap, Dumbbell, Trees, Thermometer, Clock, Droplets, Check, Square, CheckSquare, Users, Copy, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../Entities/User';
import * as groupTrainingService from '../../lib/services/groupTrainingService';
import { GroupSession } from '../../Entities/GroupSession';


// Equipment options will be created inside the component

// Environment options will be created inside the component

// Temperature options will be created inside the component

// Time of day options will be created inside the component

// Rain options will be created inside the component

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

const Section = ({ title, icon: Icon, children, gridCols = 2 }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode; gridCols?: number }) => {
    const gridClass = gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-1';

    return (
        <div className="bg-white p-4 rounded-xl card-shadow border border-gray-200">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-idf-olive">
                <Icon className="w-6 h-6" />
                {title}
            </h3>
            <div className={`grid ${gridClass} gap-3`}>
                {children}
            </div>
        </div>
    );
};


export default function WorkoutSetup() {
  const navigate = useNavigate();
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = context?.allTexts[language];

  const equipmentOptions = [
    { id: 'weight', label: t?.weight || 'משקל' },
    { id: 'sandbag', label: t?.sandbag || 'שק חול מלא' },
  ];

  const environmentOptions = [
    { id: 'dune', label: t?.dune || 'דיונה' },
    { id: 'track', label: t?.track || '400מ׳ משטח ישר' },
    { id: 'pullup_bar', label: t?.pullupBar || 'מתח' },
    { id: 'dip_station', label: t?.dipStation || 'מקבילים' },
  ];

  const temperatureOptions = [
    { id: 'hot', label: t?.hot || 'חם' },
    { id: 'mild', label: t?.mild || 'נעים' },
    { id: 'cold', label: t?.cold || 'קר' },
  ];

  const timeOfDayOptions = [
    { id: 'morning', label: t?.morning || 'בוקר' },
    { id: 'noon', label: t?.noon || 'צהריים' },
    { id: 'evening', label: t?.evening || 'ערב' },
  ];

  const rainOptions = [
    { id: 'rain', label: t?.rainYes || 'גשם' },
    { id: 'no_rain', label: t?.rainNo || 'לא גשם' },
  ];

  const [selections, setSelections] = useState({
    equipment: [] as string[],
    environment: [] as string[],
    temperature: null as string | null,
    timeOfDay: null as string | null,
    rain: null as string | null
  });
  const [rememberSettings, setRememberSettings] = useState(false);

  // Group training state
  const [groupSession, setGroupSession] = useState<GroupSession | null>(null);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showJoinSessionModal, setShowJoinSessionModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
        try {
            const savedSettings = localStorage.getItem('workoutSetup_settings');
            const rememberFlag = localStorage.getItem('workoutSetup_remember');

            if (rememberFlag === 'true' && savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSelections(parsed);
                setRememberSettings(true);
            }
        } catch (error) {
            console.error('Error loading workout settings:', error);
        }
    };
    loadSettings();
  }, []);

  const handleToggleMulti = (category: 'equipment' | 'environment', value: string) => {
    setSelections(prev => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };

  const handleSelectSingle = (category: 'temperature' | 'timeOfDay' | 'rain', value: string) => {
    setSelections(prev => ({ ...prev, [category]: value }));
  };

  // Group training handlers
  const handleCreateSession = () => {
    try {
      const userId = crypto.randomUUID();
      const userName = 'משתמש';

      const session = groupTrainingService.createSession(
        userId,
        userName,
        'אימון משותף'
      );

      setGroupSession(session);
      setShowCreateSessionModal(true);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('שגיאה ביצירת אימון משותף');
    }
  };

  const handleJoinSession = () => {
    setShowJoinSessionModal(true);
    setJoinError('');
  };

  const handleJoinSessionSubmit = () => {
    try {
      const userId = crypto.randomUUID();
      const userName = 'משתמש';

      const session = groupTrainingService.joinSession(joinCode.toUpperCase(), userId, userName);
      setGroupSession(session);
      setShowJoinSessionModal(false);
      setJoinCode('');

      // Navigate to workout with session
      navigate(createPageUrl('CreateWorkout', { sessionId: session.id }));
    } catch (error: any) {
      setJoinError(error.message || 'שגיאה בהצטרפות לאימון');
    }
  };

  const handleCopyCode = () => {
    if (groupSession) {
      navigator.clipboard.writeText(groupSession.code);
      alert(t?.codeCopied || 'הקוד הועתק!');
    }
  };

  const handleStartGroupWorkout = () => {
    if (groupSession) {
      navigate(createPageUrl('CreateWorkout', { sessionId: groupSession.id }));
    }
  };

  const handleGenerateWorkout = async () => {
    try {
        if (rememberSettings) {
            localStorage.setItem('workoutSetup_settings', JSON.stringify(selections));
            localStorage.setItem('workoutSetup_remember', 'true');
        } else {
            localStorage.removeItem('workoutSetup_settings');
            localStorage.removeItem('workoutSetup_remember');
        }
    } catch (error) {
        console.error('Error saving workout settings:', error);
    }

    const params = {
      equipment: selections.equipment.length > 0 ? selections.equipment.join(',') : undefined,
      environment: selections.environment.length > 0 ? selections.environment.join(',') : undefined,
      temperature: selections.temperature,
      timeOfDay: selections.timeOfDay,
      rain: selections.rain
    };

    navigate(createPageUrl('CreateWorkout', params));
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
            <h1 className="text-2xl font-bold text-dark-olive">{t?.workoutSetup || "הגדרת אימון"}</h1>
            <p className="text-gray-600 text-sm font-light">{t?.workoutSetupDesc || "סמן את התנאים והציוד הזמינים (אופציונלי)"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title={t?.equipment || "ציוד"} icon={Dumbbell} gridCols={2}>
                {equipmentOptions.map(opt => (
                    <StyledCheckbox key={opt.id} label={opt.label} isChecked={selections.equipment.includes(opt.id)} onChange={() => handleToggleMulti('equipment', opt.id)} />
                ))}
            </Section>

            <Section title={t?.environment || "סביבה"} icon={Trees} gridCols={2}>
                {environmentOptions.map(opt => (
                    <StyledCheckbox key={opt.id} label={opt.label} isChecked={selections.environment.includes(opt.id)} onChange={() => handleToggleMulti('environment', opt.id)} />
                ))}
            </Section>

            <Section title={t?.temperature || "טמפרטורה"} icon={Thermometer} gridCols={3}>
                 {temperatureOptions.map(opt => (
                    <StyledRadio key={opt.id} label={opt.label} isSelected={selections.temperature === opt.id} onClick={() => handleSelectSingle('temperature', opt.id)} />
                ))}
            </Section>

            <Section title={t?.timeOfDay || "זמן ביום"} icon={Clock} gridCols={3}>
                {timeOfDayOptions.map(opt => (
                    <StyledRadio key={opt.id} label={opt.label} isSelected={selections.timeOfDay === opt.id} onClick={() => handleSelectSingle('timeOfDay', opt.id)} />
                ))}
            </Section>
        </div>

        <div className="mt-4">
            <Section title={t?.rain || "גשם"} icon={Droplets} gridCols={2}>
                {rainOptions.map(opt => (
                    <StyledRadio key={opt.id} label={opt.label} isSelected={selections.rain === opt.id} onClick={() => handleSelectSingle('rain', opt.id)} />
                ))}
            </Section>
        </div>

        <div className="bg-white/50 p-3 rounded-xl mt-4">
             <button onClick={() => setRememberSettings(prev => !prev)} className="flex items-center gap-3 w-full text-right">
                {rememberSettings ? <CheckSquare className="w-6 h-6 text-idf-olive" /> : <Square className="w-6 h-6 text-idf-olive" />}
                <span className="font-semibold text-idf-olive">{t?.rememberEnvironment || "זכור סביבה זו"}</span>
            </button>
        </div>

        {/* Group Training Section */}
        <div className="mt-6 bg-white p-4 rounded-xl card-shadow border border-gray-200">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-idf-olive">
            <Users className="w-6 h-6" />
            {t?.groupTraining || 'אימון קבוצתי'}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* Create Session Button */}
            <Button
              onClick={handleCreateSession}
              className="w-full bg-[var(--color-accent-secondary)] hover:bg-[var(--color-accent-primary)] text-white font-semibold py-3 rounded-lg btn-press"
            >
              <Users className="w-5 h-5 ml-2 inline" />
              {t?.createSession || 'צור אימון משותף'}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">{t?.or || 'או'}</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Join Session Button */}
            <Button
              onClick={handleJoinSession}
              variant="outline"
              className="w-full border-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold py-3 rounded-lg btn-press"
            >
              {t?.joinWorkout || 'הצטרף לאימון'}
            </Button>
          </div>
        </div>

        <div className="mt-6">
            <Button
                onClick={handleGenerateWorkout}
                className="w-full bg-idf-olive text-light-sand font-bold py-4 rounded-xl btn-press card-shadow text-lg disabled:opacity-50"
                disabled={!isSelectionComplete()}
            >
                <Zap className="w-5 h-5 ml-2 inline" />
                {t?.createWorkout || "צור אימון"}
            </Button>
        </div>

      </div>

      {/* Create Session Modal */}
      {showCreateSessionModal && groupSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full card-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-idf-olive">{t?.sessionCode || 'קוד הצטרפות'}</h2>
              <button
                onClick={() => setShowCreateSessionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                {t?.maxParticipants || 'עד 4 משתתפים'}
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-4xl font-bold text-idf-olive tracking-widest">
                  {groupSession.code}
                </p>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="w-full mb-2"
              >
                <Copy className="w-4 h-4 ml-2" />
                {t?.copyCode || 'העתק קוד'}
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {t?.participants || 'משתתפים'}: {groupSession.participants.length}/4
              </p>
              <div className="space-y-2">
                {groupSession.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{participant.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStartGroupWorkout}
              className="w-full bg-idf-olive text-light-sand font-bold py-3"
            >
              {t?.continue || 'המשך'}
            </Button>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full card-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-idf-olive">{t?.joinWorkout || 'הצטרף לאימון'}</h2>
              <button
                onClick={() => {
                  setShowJoinSessionModal(false);
                  setJoinCode('');
                  setJoinError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t?.enterSessionCode || 'הזן קוד הצטרפות'}
              </label>
              <Input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC12345"
                maxLength={8}
                className="w-full text-center text-2xl tracking-widest uppercase"
              />
              {joinError && (
                <p className="text-red-500 text-sm mt-2">{joinError}</p>
              )}
            </div>

            <Button
              onClick={handleJoinSessionSubmit}
              disabled={joinCode.length !== 8}
              className="w-full bg-idf-olive text-light-sand font-bold py-3 disabled:opacity-50"
            >
              {t?.joinWorkout || 'הצטרף'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
