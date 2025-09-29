import React, { useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LanguageContext } from '../../components/shared/LanguageContext';
import { Send, Plus, AlertTriangle, History, X, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useChat } from '../../features/chat/hooks/useChat';
import { CHAT_TEXTS } from '../../features/chat/constants';
import { renderMarkdown } from '../../features/chat/utils/markdownRenderer';
import { useAuth } from '../../features/auth/AuthContext';

export default function MilitaryChat() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = CHAT_TEXTS[language];
  const allTexts = context?.allTexts[language];
  const { login } = useAuth();

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    dailyQuota,
    isLoading,
    createNewSession,
    getCurrentSession,
    sendMessage: handleSendMessage,
    deleteSession,
    updateSession,
    isLoggedIn,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);

  const showDeleteConfirmation = (sessionId: string) => {
    setDeletingSession(sessionId);
    setActiveDropdown(null);
  };

  const confirmDeleteSession = () => {
    if (deletingSession) {
      deleteSession(deletingSession);
      setDeletingSession(null);
    }
  };

  const cancelDeleteSession = () => {
    setDeletingSession(null);
  };

  const handleDropdownToggle = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (activeDropdown === sessionId) {
      setActiveDropdown(null);
      setDropdownPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      x: rect.left + rect.width + 8,
      y: rect.top + rect.height / 2
    });
    setActiveDropdown(sessionId);
  };

  const startEditingTitle = (sessionId: string, currentTitle: string) => {
    setEditingSession(sessionId);
    setEditingTitle(currentTitle);
    setActiveDropdown(null);
  };

  const saveEditedTitle = () => {
    if (editingSession && editingTitle.trim()) {
      updateSession(editingSession, { title: editingTitle.trim() });
    }
    setEditingSession(null);
    setEditingTitle('');
  };

  const cancelEditingTitle = () => {
    setEditingSession(null);
    setEditingTitle('');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || dailyQuota <= 0) return;

    await handleSendMessage(inputMessage);
    setInputMessage('');
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setDropdownPosition(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const currentSession = getCurrentSession();

  return (
    <div className="flex bg-[var(--color-bg-neutral)]" style={{ height: 'calc(100vh - 73px)' }} dir="rtl">
      {/* Chat History Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col hidden md:flex relative z-0">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] text-[var(--color-text-light)] px-4 py-3 rounded-lg hover:bg-[var(--color-accent-secondary)] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t.newChat}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-visible">
          <div className="p-2 relative">
            {sessions.map((session) => (
              <div key={session.id} className="relative mb-2">
                {editingSession === session.id ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg text-right"
                      placeholder={t.editName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditedTitle();
                        if (e.key === 'Escape') cancelEditingTitle();
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEditedTitle}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg"
                      >
                        שמור
                      </button>
                      <button
                        onClick={cancelEditingTitle}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveSessionId(session.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                      session.id === activeSessionId
                        ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-light)]'
                        : 'bg-gray-50 hover:bg-gray-100 text-[var(--color-text-dark)]'
                    }`}
                  >
                    <div className="font-medium text-sm truncate pr-8">{session.title}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(session.createdAt).toLocaleDateString('he-IL')}
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <button
                        onClick={(e) => handleDropdownToggle(session.id, e)}
                        className={`p-1 rounded-lg hover:bg-gray-200 transition-colors ${
                          session.id === activeSessionId ? 'hover:bg-white/20' : ''
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header with Quota */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHistorySidebar(true)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors md:hidden"
            >
              <History className="w-5 h-5 text-[var(--color-text-dark)]" />
            </button>

            <div className="text-center flex-1">
              <div className="text-lg font-bold text-[var(--color-text-dark)]">{t.militaryChat}</div>
              <div className="text-sm text-gray-600 mt-1">
                {t.questionsLeft} {dailyQuota} {t.questionsToday}
              </div>
            </div>

            <div className="w-9"></div> {/* Spacer for centering */}
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
                {message.type === 'ai' ? (
                  renderMarkdown(message.content)
                ) : (
                  <div className="whitespace-pre-wrap text-right">{message.content}</div>
                )}
                <div className="text-xs opacity-75 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString('he-IL', {
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
                  <span>{t.preparing}</span>
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
              <div className="text-red-600 font-medium">{t.quotaFinished}</div>
              <div className="text-sm text-gray-600 mt-1">{t.comeBackTomorrow}</div>
            </div>
          ) : isLoggedIn ? (
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
                onKeyDown={handleKeyPress}
                placeholder={t.typeQuestion}
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 text-right resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:border-transparent min-h-[44px] max-h-[120px]"
                style={{ height: '44px' }}
              />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {allTexts?.loginRequired || 'נדרש חשבון משתמש'}
              </h3>
              <p className="text-gray-600 mb-4">
                {allTexts?.loginRequiredMessage || 'על מנת לשאול שאלות בצ\'אט הצבאי, יש להתחבר תחילה לחשבון המשתמש שלך.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => login('google')}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  {allTexts?.loginWithGoogle || 'התחבר עם Google'}
                </button>
                <button
                  onClick={() => login('facebook')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  {allTexts?.loginWithFacebook || 'התחבר עם Facebook'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile History Sidebar */}
      {showHistorySidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowHistorySidebar(false)}
          ></div>

          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text-dark)]">{t.chatHistory}</h3>
                <button
                  onClick={() => setShowHistorySidebar(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--color-text-dark)]" />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    createNewSession();
                    setShowHistorySidebar(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] text-[var(--color-text-light)] px-4 py-3 rounded-lg hover:bg-[var(--color-accent-secondary)] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t.newChat}</span>
                </button>
              </div>

              {/* Chat Sessions List */}
              <div className="flex-1 overflow-y-auto p-2 relative">
                {sessions.map((session) => (
                  <div key={session.id} className="relative mb-2">
                    {editingSession === session.id ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-lg text-right"
                          placeholder={t.editName}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditedTitle();
                            if (e.key === 'Escape') cancelEditingTitle();
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={saveEditedTitle}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg"
                          >
                            שמור
                          </button>
                          <button
                            onClick={cancelEditingTitle}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded-lg"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setShowHistorySidebar(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                          session.id === activeSessionId
                            ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-light)]'
                            : 'bg-gray-50 hover:bg-gray-100 text-[var(--color-text-dark)]'
                        }`}
                      >
                        <div className="font-medium text-sm truncate pr-8">{session.title}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {new Date(session.createdAt).toLocaleDateString('he-IL')}
                        </div>

                        {/* Three dots menu */}
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                          <button
                            onClick={(e) => handleDropdownToggle(session.id, e)}
                            className={`p-1 rounded-lg hover:bg-gray-200 transition-colors ${
                              session.id === activeSessionId ? 'hover:bg-white/20' : ''
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="text-sm">{t.noChats}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portal-based Dropdown Menu */}
      {activeDropdown && dropdownPosition && createPortal(
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-32 z-[9999]"
          style={{
            left: `${dropdownPosition.x}px`,
            top: `${dropdownPosition.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditingTitle(activeDropdown, sessions.find(s => s.id === activeDropdown)?.title || '');
              setActiveDropdown(null);
              setDropdownPosition(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-dark)] hover:bg-gray-100 rounded-t-lg"
          >
            <Edit2 className="w-4 h-4" />
            {t.editName}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showDeleteConfirmation(activeDropdown);
              setActiveDropdown(null);
              setDropdownPosition(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
          >
            <Trash2 className="w-4 h-4" />
            {t.deleteChat}
          </button>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={cancelDeleteSession}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
            <h3 className="text-lg font-bold text-[var(--color-text-dark)] mb-4">
              {t.deleteChatConfirmTitle}
            </h3>

            <p className="text-[var(--color-text-dark)] mb-2">
              {t.deleteChatConfirmMessage} <span className="font-medium">
                {sessions.find(s => s.id === deletingSession)?.title}
              </span>.
            </p>

            <p className="text-sm text-gray-600 mb-6">
              {t.deleteChatConfirmSettings}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteSession}
                className="px-4 py-2 text-[var(--color-text-dark)] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDeleteSession}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}