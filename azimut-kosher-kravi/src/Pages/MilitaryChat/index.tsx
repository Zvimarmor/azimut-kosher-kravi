
import React, { useState, useEffect, useRef, useContext } from 'react';
import { LanguageContext } from '@/components/LanguageContext';
import { Send, Plus, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const SYSTEM_PROMPT = `אתה עוזר AI מתמחה בנושאים צבאיים ישראליים. התפקיד שלך הוא לספק מידע מדויק ועובדתי בתחומים הבאים בלבד:
- תהליכי גיוס לצה"ל
- תוכניות אימונים צבאיות
- תזונה לחיילים ומתאמנים
- יחידות צה"ל השונות
- כושר גופני צבאי

הגבלות קפדניות:
- ענה רק בעברית
- אל תדון בנושאים רפואיים
- אל תחשוף מידע מסווג
- אל תענה על שאלות לא הולמות
- הזהר את המשתמש שהמידע עלול להיות שגוי ויש לוודא אותו

אם נשאל על נושא שאינו בתחום שלך, ענה: "אני יכול לעזור רק בנושאים צבאיים כגון גיוס, אימונים, תזונה ויחידות צה"ל. לשאלות אחרות פנה לגורמים מקצועיים."`;

const INSTRUCTIONS_MESSAGE = `הוראות שימוש:
• יש לשלוח לצ'אט רק שאלות בנושאים צבאיים כמו מיונים, אימונים, תזונה, יחידות בצה"ל וכו'.
• אין להתייעץ עם הצ'אט לגבי נושאים רפואיים, מידע מסווג או נושאים שאינם ראויים.
• יש להשתמש בשפה מכובדת וראויה.
• המידע שניתן על ידי הצ'אט יכול להיות שגוי, בבקשה תבדקו את המידע הניתן.`;

const DAILY_QUOTA = 10;

export default function MilitaryChat() {
  const { language } = useContext(LanguageContext);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyQuota, setDailyQuota] = useState(DAILY_QUOTA);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load sessions and quota from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('militaryChat_sessions');
    const savedQuota = localStorage.getItem('militaryChat_quota');
    const lastQuotaReset = localStorage.getItem('militaryChat_quotaReset');

    const today = new Date().toDateString();

    if (lastQuotaReset !== today) {
      // Reset quota for new day
      setDailyQuota(DAILY_QUOTA);
      localStorage.setItem('militaryChat_quota', DAILY_QUOTA.toString());
      localStorage.setItem('militaryChat_quotaReset', today);
    } else if (savedQuota) {
      setDailyQuota(parseInt(savedQuota));
    }

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      if (parsedSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(parsedSessions[0].id);
      }
    } else {
      // Create initial session
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('militaryChat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'שיחה חדשה',
      messages: [{
        id: crypto.randomUUID(),
        type: 'system',
        content: INSTRUCTIONS_MESSAGE,
        timestamp: new Date()
      }],
      createdAt: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const getCurrentSession = () => {
    return sessions.find(s => s.id === activeSessionId);
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, title }
          : session
      )
    );
  };

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock responses based on keywords
    const message = userMessage.toLowerCase();

    if (message.includes('גולני') || message.includes('חטיבת גולני')) {
      return 'חטיבת גולני היא אחת מחטיבות הרגלים המובחרות בצה"ל. הגיוס לגולני מתבצע בעיקר דרך "יום מיון 02" והמועמדים עוברים מבחני כושר ונפש מאתגרים. החטיבה ידועה בסמל האריה הצהוב ובמוטו "בזרוע ובגבורה".';
    }

    if (message.includes('רפואים') || message.includes('יחידת רפואים')) {
      return 'יחידת הרפואים (יר"פ) היא יחידה רפואית מובחרת בצה"ל. הגיוס מתבצע דרך "יום מיון 97" והדורש כישורים רפואיים בסיסיים, כושר גופני גבוה ויכולת עבודה תחת לחץ. היחידה עוסקת בטיפול רפואי בשטח ובפינוי פצועים.';
    }

    if (message.includes('כושר') || message.includes('אימון')) {
      return 'אימוני הכושר בצה"ל מתבססים על עקרונות של הדרגתיות ועמידות. מומלץ להתחיל הכנה 3-6 חודשים לפני הגיוס, להתמקד בריצה, שכיבות סמיכה, מתח ונשיאת משאות. חשוב לשמור על תזונה מאוזנת ולהימנע מפציעות.';
    }

    if (message.includes('תזונה')) {
      return 'תזונה נכונה לחיילים כוללת: ארוחות קבועות עשירות בחלבון (עוף, דג, קטניות), פחמימות מורכבות (אורז מלא, פסטה מלאה), ירקות ופירות רבים. חשוב לשתות הרבה מים ולהימנע ממזון מעובד. בפעילות אינטנסיבית יש להגביר את כמות הקלוריות.';
    }

    if (message.includes('מיון') || message.includes('גיוס')) {
      return 'תהליך הגיוס לצה"ל כולל מספר שלבים: יום הגיוס הראשוני, מבחני פרופיל רפואי ונפש, ומבחני התאמה ליחידות שונות. חשוב להגיע במצב גופני טוב, עם כל המסמכים הנדרשים, ולהיות כנים בכל השאלות הרפואיות והאישיות.';
    }

    // Default response for unrecognized topics
    return 'אני יכול לעזור רק בנושאים צבאיים כגון גיוס, אימונים, תזונה ויחידות צה"ל. לשאלות אחרות פנה לגורמים מקצועיים מתאימים.';
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || dailyQuota <= 0) return;

    const currentSession = getCurrentSession();
    if (!currentSession) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setSessions(prev =>
      prev.map(session =>
        session.id === activeSessionId
          ? {
              ...session,
              messages: [...session.messages, userMessage]
            }
          : session
      )
    );

    // Update session title if this is the first real message
    if (currentSession.messages.length === 1) {
      updateSessionTitle(activeSessionId!, inputMessage.trim());
    }

    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(inputMessage);

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: [...session.messages, aiMessage]
              }
            : session
        )
      );

      // Update quota
      const newQuota = dailyQuota - 1;
      setDailyQuota(newQuota);
      localStorage.setItem('militaryChat_quota', newQuota.toString());

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'error',
        content: 'אירעה שגיאה בקבלת התשובה. אנא נסה שוב.',
        timestamp: new Date()
      };

      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: [...session.messages, errorMessage]
              }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const currentSession = getCurrentSession();

  return (
    <div className="flex h-full bg-[var(--color-bg-neutral)]" dir="rtl">
      {/* Chat History Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] text-[var(--color-text-light)] px-4 py-3 rounded-lg hover:bg-[var(--color-accent-secondary)] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>שיחה חדשה</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  session.id === activeSessionId
                    ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-light)]'
                    : 'bg-gray-50 hover:bg-gray-100 text-[var(--color-text-dark)]'
                }`}
              >
                <div className="font-medium text-sm truncate">{session.title}</div>
                <div className="text-xs opacity-75 mt-1">
                  {session.createdAt.toLocaleDateString('he-IL')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header with Quota */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-[var(--color-text-dark)]">היסטוריה</div>
            <div className="text-sm text-gray-600 mt-1">
              נשארו לך {dailyQuota} שאלות
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-light)]'
                    : message.type === 'ai'
                    ? 'bg-white border border-gray-200 text-[var(--color-text-dark)]'
                    : message.type === 'system'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 text-center italic'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message.type === 'system' && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">הוראות שימוש</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-right">{message.content}</div>
                <div className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString('he-IL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-end">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-[70%]">
                <div className="flex items-center gap-2 text-[var(--color-text-dark)]">
                  <div className="animate-spin w-4 h-4 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full"></div>
                  <span>מכין תשובה...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {dailyQuota <= 0 ? (
            <div className="text-center py-4">
              <div className="text-red-600 font-medium">סיימת את מכסת השאלות היומית</div>
              <div className="text-sm text-gray-600 mt-1">חזור מחר לשאלות נוספות</div>
            </div>
          ) : (
            <div className="flex gap-3 items-end">
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex-shrink-0 bg-[var(--color-accent-primary)] text-[var(--color-text-light)] p-3 rounded-full hover:bg-[var(--color-accent-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="כתוב את שאלתך כאן..."
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 text-right resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent min-h-[44px] max-h-[120px]"
                style={{ height: '44px' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
