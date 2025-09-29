import { useState, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { generateUUID, simulateAIResponse } from '../utils';
import { INSTRUCTIONS_MESSAGE, DAILY_QUOTA } from '../constants';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [dailyQuota, setDailyQuota] = useState(DAILY_QUOTA);
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions and quota from localStorage
  useEffect(() => {
    try {
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
        // Create initial session
        createNewSession();
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      if (sessions.length > 0) {
        localStorage.setItem('militaryChat_sessions', JSON.stringify(sessions));
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [sessions]);

  const createNewSession = () => {
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

  const sendMessage = async (inputMessage: string) => {
    if (!inputMessage.trim() || isLoading || dailyQuota <= 0) return;

    const currentSession = getCurrentSession();
    if (!currentSession) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateUUID(),
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

    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = currentSession.messages
        .filter(msg => msg.type === 'user' || msg.type === 'ai')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      const aiResponse = await simulateAIResponse(inputMessage, conversationHistory);

      const aiMessage: ChatMessage = {
        id: generateUUID(),
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
        id: generateUUID(),
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

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const updateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, ...updates }
          : session
      )
    );
  };

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
  };
};