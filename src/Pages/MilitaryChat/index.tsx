import React, { useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LanguageContext } from '../../components/shared/LanguageContext';
import { Send, Plus, AlertTriangle, History, X, MoreVertical, Edit2, Trash2, LogIn } from 'lucide-react';
import { useChat } from '../../features/chat/hooks/useChat';
import { CHAT_TEXTS } from '../../features/chat/constants';
import { renderMarkdown } from '../../features/chat/utils/markdownRenderer';
import { useAuth } from '../../features/auth/useAuth';
import { LoginModal } from '../../features/auth/components/LoginModal';

export default function MilitaryChat() {
  const context = useContext(LanguageContext);
  const language = context?.language || 'hebrew';
  const t = CHAT_TEXTS[language];
  const allTexts = context?.allTexts[language];
  const { currentUser, chatQuotaRemaining } = useAuth();

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
  } = useChat(language);

  const [inputMessage, setInputMessage] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Session list renderer (shared between desktop sidebar and mobile drawer)
  const renderSessionList = (onSessionClick?: () => void) => (
    <>
      {sessions.map((session) => (
        <div key={session.id} className="relative mb-1.5">
          {editingSession === session.id ? (
            <div className="p-3 glass-card rounded-xl">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="w-full p-2 text-sm glass-input rounded-lg text-right text-tactical-text"
                placeholder={t.editName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditedTitle();
                  if (e.key === 'Escape') cancelEditingTitle();
                }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button onClick={saveEditedTitle} className="px-3 py-1 bg-tactical-accent text-tactical-bg text-xs rounded-lg font-semibold">
                  שמור
                </button>
                <button onClick={cancelEditingTitle} className="px-3 py-1 bg-tactical-surface text-tactical-muted text-xs rounded-lg">
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                setActiveSessionId(session.id);
                onSessionClick?.();
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 relative ${
                session.id === activeSessionId
                  ? 'glass-card-elevated border-tactical-accent/20 glow-border'
                  : 'hover:bg-tactical-accent/5 text-tactical-text'
              }`}
            >
              <div className="font-medium text-sm truncate pr-8 text-tactical-text">{session.title}</div>
              <div className="text-xs text-tactical-muted mt-1">
                {new Date(session.createdAt).toLocaleDateString('he-IL')}
              </div>

              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={(e) => handleDropdownToggle(session.id, e)}
                  className="p-1 rounded-lg hover:bg-tactical-accent/10 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-tactical-muted" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {sessions.length === 0 && (
        <div className="p-4 text-center text-tactical-muted">
          <div className="text-sm">{t.noChats}</div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex" style={{ height: 'calc(100vh - 57px)' }} dir="rtl">
      {/* Desktop Sidebar */}
      <div className="w-80 glass-sidebar flex flex-col hidden md:flex relative z-0">
        <div className="p-4 border-b border-tactical-accent/10">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 gradient-accent text-tactical-bg px-4 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(127,176,105,0.3)] transition-all duration-200 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>{t.newChat}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-visible p-2 relative">
          {renderSessionList()}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass-header border-b border-tactical-accent/10 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHistorySidebar(true)}
              className="p-2 rounded-xl glass-card hover:glow-border transition-all duration-200 md:hidden"
            >
              <History className="w-5 h-5 text-tactical-muted" />
            </button>

            <div className="text-center flex-1">
              <div className="text-lg font-bold text-tactical-text">{t.militaryChat}</div>
              <div className="text-sm text-tactical-muted mt-0.5 font-mono-data">
                {t.questionsLeft} <span className="text-tactical-accent font-semibold">{dailyQuota}</span> {t.questionsToday}
              </div>
            </div>

            <div className="w-9"></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'gradient-accent-subtle text-tactical-text'
                    : message.type === 'ai'
                    ? 'glass-card-elevated text-tactical-text'
                    : message.type === 'system'
                    ? 'glass-card border-tactical-accent/20 text-tactical-muted text-center italic'
                    : 'bg-red-500/20 text-red-300 border border-red-500/20'
                }`}
              >
                {message.type === 'system' && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-tactical-accent" />
                    <span className="font-semibold text-tactical-accent text-sm">הוראות שימוש</span>
                  </div>
                )}
                {message.type === 'ai' ? (
                  <div className="prose-tactical">{renderMarkdown(message.content)}</div>
                ) : (
                  <div className="whitespace-pre-wrap text-right">{message.content}</div>
                )}
                <div className="text-xs text-tactical-muted/50 mt-2 font-mono-data">
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
              <div className="glass-card rounded-2xl px-4 py-3 max-w-[75%]">
                <div className="flex items-center gap-2 text-tactical-muted">
                  <div className="animate-spin w-4 h-4 border-2 border-tactical-accent border-t-transparent rounded-full"></div>
                  <span className="text-sm">{t.preparing}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass-header border-t border-tactical-accent/10 p-4">
          {dailyQuota <= 0 ? (
            <div className="text-center py-4">
              <div className="text-red-400 font-medium">{t.quotaFinished}</div>
              <div className="text-sm text-tactical-muted mt-1">{t.comeBackTomorrow}</div>
            </div>
          ) : isLoggedIn ? (
            <div className="flex gap-3 items-end">
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex-shrink-0 gradient-accent text-tactical-bg p-3 rounded-full hover:shadow-[0_0_20px_rgba(127,176,105,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t.typeQuestion}
                className="flex-1 glass-input rounded-2xl px-4 py-3 text-right resize-none min-h-[44px] max-h-[120px] text-tactical-text placeholder:text-tactical-muted/50"
                style={{ height: '44px' }}
              />
            </div>
          ) : (
            <div className="glass-card-elevated rounded-2xl p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-tactical-text mb-2">
                {language === 'hebrew' ? 'נדרש חשבון משתמש' : 'Login Required'}
              </h3>
              <p className="text-tactical-muted mb-4 text-sm">
                {language === 'hebrew'
                  ? 'נדרשת התחברות לחשבון על מנת לגשת ליועץ ההכנה הצבאית.'
                  : 'Authentication is required to access the Military Preparation Advisor.'}
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full gradient-accent text-tactical-bg px-4 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(127,176,105,0.3)] transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
              >
                <LogIn className="w-5 h-5" />
                <span>{language === 'hebrew' ? 'התחבר / הירשם' : 'Login / Sign Up'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile History Drawer */}
      {showHistorySidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHistorySidebar(false)}
          ></div>

          <div className="absolute right-0 top-0 h-full w-80 glass-sidebar shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-tactical-accent/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-tactical-text">{t.chatHistory}</h3>
                <button
                  onClick={() => setShowHistorySidebar(false)}
                  className="p-1 rounded-lg hover:bg-tactical-accent/10 transition-colors"
                >
                  <X className="w-5 h-5 text-tactical-muted" />
                </button>
              </div>

              <div className="p-4 border-b border-tactical-accent/10">
                <button
                  onClick={() => {
                    createNewSession();
                    setShowHistorySidebar(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 gradient-accent text-tactical-bg px-4 py-3 rounded-xl font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t.newChat}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 relative">
                {renderSessionList(() => setShowHistorySidebar(false))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portal Dropdown */}
      {activeDropdown && dropdownPosition && createPortal(
        <div
          className="fixed glass-card-elevated rounded-xl shadow-2xl min-w-32 z-[9999]"
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
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-tactical-text hover:bg-tactical-accent/10 rounded-t-xl"
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
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl"
          >
            <Trash2 className="w-4 h-4" />
            {t.deleteChat}
          </button>
        </div>,
        document.body
      )}

      {/* Delete Confirmation */}
      {deletingSession && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelDeleteSession}></div>

          <div className="relative glass-card-elevated rounded-2xl p-6 mx-4 max-w-sm w-full" dir={language === 'hebrew' ? 'rtl' : 'ltr'}>
            <h3 className="text-lg font-bold text-tactical-text mb-4">
              {t.deleteChatConfirmTitle}
            </h3>
            <p className="text-tactical-text mb-2">
              {t.deleteChatConfirmMessage} <span className="font-medium text-tactical-accent">
                {sessions.find(s => s.id === deletingSession)?.title}
              </span>.
            </p>
            <p className="text-sm text-tactical-muted mb-6">
              {t.deleteChatConfirmSettings}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteSession}
                className="px-4 py-2 text-tactical-text glass-card rounded-xl hover:bg-tactical-accent/10 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDeleteSession}
                className="px-4 py-2 text-white bg-red-600/80 rounded-xl hover:bg-red-600 transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          language={language}
        />
      )}
    </div>
  );
}