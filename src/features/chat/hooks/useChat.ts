import { useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { generateUUID, simulateAIResponse } from '../utils';
import { INSTRUCTIONS_MESSAGE, DAILY_QUOTA } from '../constants';
import { useAuth } from '../../auth/useAuth';

export const useChat = (language: 'hebrew' | 'english' = 'hebrew') => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [dailyQuota, setDailyQuota] = useState(DAILY_QUOTA);
  const [isLoading, setIsLoading] = useState(false);

  // Stable key builder — memoized so effects/callbacks get a stable reference
  const getUserKey = useCallback((suffix: string) => {
    const userId = currentUser?.uid || 'anonymous';
    return `militaryChat_${userId}_${suffix}`;
  }, [currentUser?.uid]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateUUID(),
      title: 'שיחה חדשה',
      messages: [{
        id: generateUUID(),
        type: 'system',
        content: INSTRUCTIONS_MESSAGE,
        timestamp: new Date()
      }],
      createdAt: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  // Load sessions and quota from localStorage
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(getUserKey('sessions'));
      const savedQuota = localStorage.getItem(getUserKey('quota'));
      const lastQuotaReset = localStorage.getItem(getUserKey('quotaReset'));

      const today = new Date().toDateString();

      if (lastQuotaReset !== today) {
        setDailyQuota(DAILY_QUOTA);
        localStorage.setItem(getUserKey('quota'), DAILY_QUOTA.toString());
        localStorage.setItem(getUserKey('quotaReset'), today);
      } else if (savedQuota) {
        setDailyQuota(parseInt(savedQuota));
      }

      if (savedSessions) {
        try {
          const parsedSessions = JSON.parse(savedSessions);
          setSessions(parsedSessions);
          if (parsedSessions.length > 0 && !activeSessionId) {
            setActiveSessionId(parsedSessions[0].id);
          }
        } catch (e) {
          console.error('Error parsing saved sessions:', e);
          createNewSession();
        }
      } else {
        createNewSession();
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      createNewSession();
    }
  // activeSessionId intentionally omitted — only re-run when user or key builder changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, getUserKey, createNewSession]);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    try {
      if (sessions.length > 0 && currentUser) {
        localStorage.setItem(getUserKey('sessions'), JSON.stringify(sessions));
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [sessions, currentUser, getUserKey]);

  const getCurrentSession = useCallback((): ChatSession | undefined => {
    return sessions.find(s => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const updateSessionTitle = useCallback((sessionId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, title }
          : session
      )
    );
  }, []);

  const sendMessage = useCallback(async (inputMessage: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to send messages');
    }

    if (!inputMessage.trim() || isLoading || dailyQuota <= 0) return;

    const currentSession = getCurrentSession();
    if (!currentSession) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setSessions(prev =>
      prev.map(session =>
        session.id === activeSessionId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );

    if (currentSession.messages.length === 1) {
      updateSessionTitle(activeSessionId!, inputMessage.trim());
    }

    setIsLoading(true);

    try {
      const conversationHistory = currentSession.messages
        .filter(msg => msg.type === 'user' || msg.type === 'ai')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      const aiResponse = await simulateAIResponse(inputMessage, conversationHistory, language);

      const aiMessage: ChatMessage = {
        id: generateUUID(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, aiMessage] }
            : session
        )
      );

      const newQuota = dailyQuota - 1;
      setDailyQuota(newQuota);
      localStorage.setItem(getUserKey('quota'), newQuota.toString());

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateUUID(),
        type: 'error',
        content: language === 'english'
          ? 'An error occurred while getting the response. Please try again.'
          : 'אירעה שגיאה בקבלת התשובה. אנא נסה שוב.',
        timestamp: new Date()
      };

      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isLoading, dailyQuota, activeSessionId, getCurrentSession, updateSessionTitle, getUserKey, language]);

  const deleteSession = useCallback((sessionId: string) => {
    // Compute remaining before clearing, then update active if needed
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          createNewSession();
        }
      }
      return remaining;
    });
  }, [activeSessionId, createNewSession]);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, ...updates }
          : session
      )
    );
  }, []);

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    dailyQuota,
    isLoading,
    createNewSession,
    getCurrentSession,
    sendMessage,
    deleteSession,
    updateSession,
    isLoggedIn: !!currentUser,
  };
};
