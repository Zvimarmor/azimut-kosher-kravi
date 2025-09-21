
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertTriangle, History, Plus } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";

const INSTRUCTIONS_MESSAGE = `הוראות שימוש:
* יש לשלוח לצ׳אט רק שאלות בנושאים צבאיים כמו מיונים, אימונים,תזונה, יחידות בצה״ל וכו׳. אין להתייעץ עם הצ׳אט לגבי נושאים רפואיים, מידע מסווג או נושאים שאינם ראויים. שאלות כאלו לא יענו ויובילו להרחקת המשתמש.
* יש להשתמש בשפה מכובדת וראויה. כל השאלות עוברות בקרה אנושית של אנשי המערכת.
* המידע שניתן על ידי הצ׳אט יכול להיות שגוי, בבקשה תבדקו כל דבר חשוב יותר מפעם אחת ותוודאו את המידע הניתן.`;

const SYSTEM_PROMPT = `You are an advisor for military-related topics such as IDF recruitment processes, training programs, nutrition for trainees, and IDF units. You must only answer questions in these topics, in Hebrew. Always answer in Hebrew. Answer accurately and factually without making up data. If you do not know the answer, respond with: "אין לי אפשרות לענות על השאלה כרגע. סליחה". If the received question is not under the allowed topics, respond with: "סליחה, השאלה שנשאלה לא בנושאים עליהם אני צריך לענות. סליחה."`;

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const Q_COUNT_KEY = 'tactical_fit_q_count';
const Q_TIMESTAMP_KEY = 'tactical_fit_q_timestamp';
const CONVERSATIONS_KEY = 'tactical_fit_conversations';
const ACTIVE_CONVO_ID_KEY = 'tactical_fit_active_convo_id';

export default function MilitaryChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(10);
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Question limit logic
    const today = new Date().toDateString();
    const lastStoredDate = sessionStorage.getItem(Q_TIMESTAMP_KEY);

    if (lastStoredDate === today) {
      const storedCount = sessionStorage.getItem(Q_COUNT_KEY);
      setQuestionsRemaining(storedCount ? parseInt(storedCount, 10) : 10);
    } else {
      sessionStorage.setItem(Q_COUNT_KEY, '10');
      sessionStorage.setItem(Q_TIMESTAMP_KEY, today);
      setQuestionsRemaining(10);
    }

    // Conversation history loading logic
    const storedConversations = sessionStorage.getItem(CONVERSATIONS_KEY);
    const storedActiveId = sessionStorage.getItem(ACTIVE_CONVO_ID_KEY);

    if (storedConversations && storedActiveId) {
      try {
        const parsedConversations = JSON.parse(storedConversations);
        setConversations(parsedConversations);
        // Set active conversation ID only if it exists in the parsed conversations
        if (parsedConversations.some(convo => convo.id === storedActiveId)) {
          setActiveConversationId(storedActiveId);
        } else {
          // If stored active ID is invalid/missing, start a new chat
          startNewChat();
        }
      } catch (error) {
        console.error("Failed to parse stored conversations, starting new chat:", error);
        startNewChat();
      }
    } else {
      // If no stored conversations or active ID, start a new chat
      startNewChat();
    }
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    // Persist conversations to session storage whenever they change
    // Only save if there are conversations and an active one is selected.
    if (conversations.length > 0 && activeConversationId) {
      try {
        sessionStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        sessionStorage.setItem(ACTIVE_CONVO_ID_KEY, activeConversationId);
      } catch (error) {
        console.error("Failed to save conversations to session storage:", error);
      }
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const startNewChat = () => {
    const newId = generateId();
    const newConversation = {
      id: newId,
      messages: [{ id: generateId(), type: "system", content: INSTRUCTIONS_MESSAGE }]
    };
    // Add new conversation to the beginning and limit to 15
    setConversations(prev => [newConversation, ...prev].slice(0, 15));
    setActiveConversationId(newId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || questionsRemaining <= 0) return;

    const userMessage = { id: generateId(), type: "user", content: inputValue.trim() };
    setInputValue("");

    const updatedConversations = conversations.map(convo =>
      convo.id === activeConversationId ? { ...convo, messages: [...convo.messages, userMessage] } : convo
    );
    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      const response = await InvokeLLM({ prompt: `${SYSTEM_PROMPT}\n\nUser question: "${userMessage.content}"` });
      const aiMessage = { id: generateId(), type: "ai", content: response };

      setConversations(prev => prev.map(convo =>
        convo.id === activeConversationId ? { ...convo, messages: [...convo.messages, aiMessage] } : convo
      ));

      const newCount = questionsRemaining - 1;
      setQuestionsRemaining(newCount);
      sessionStorage.setItem(Q_COUNT_KEY, newCount.toString());

    } catch (error) {
      console.error("Error invoking LLM:", error);
      const errorMessage = { id: generateId(), type: "error", content: "שגיאת תקשורת, אנא נסה שוב." };
      setConversations(prev => prev.map(convo =>
        convo.id === activeConversationId ? { ...convo, messages: [...convo.messages, errorMessage] } : convo
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveConversation = () => conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex flex-row-reverse w-full text-dark-olive" style={{ height: 'calc(100vh - 73px)' }}>
      {/* History Bar */}
      <aside className="w-1/4 max-w-[280px] bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-center flex items-center justify-center gap-2 text-dark-olive">
            <History className="w-5 h-5" />
            היסטוריה
          </h2>
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {conversations.map(convo => {
              const firstUserMessage = convo.messages.find(m => m.type === 'user');
              return (
                <button
                  key={convo.id}
                  className={`w-full text-right p-3 rounded-lg text-sm transition-all btn-press ${
                    activeConversationId === convo.id
                      ? 'bg-idf-olive text-light-sand card-shadow'
                      : 'bg-white text-dark-olive hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => setActiveConversationId(convo.id)}
                >
                  <p className="truncate text-right">
                    {firstUserMessage ? firstUserMessage.content : "צ'אט חדש"}
                  </p>
                </button>
              )
            })}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={startNewChat}
            className="w-full bg-idf-olive text-light-sand font-medium py-3 rounded-lg btn-press card-shadow flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            צ'אט חדש
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        <header className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-right">
            <p className="font-semibold text-dark-olive">
              נשארו לך <span className="font-bold text-idf-olive">{questionsRemaining}</span> שאלות
            </p>
          </div>
        </header>

        <div ref={chatAreaRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {getActiveConversation()?.messages.map(message => (
            <div key={message.id} dir="rtl" className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-4 rounded-xl ${
                message.type === 'user' ? 'bg-idf-olive text-light-sand rounded-tr-sm' :
                message.type === 'ai' ? 'bg-gray-100 text-dark-olive rounded-tl-sm' :
                message.type === 'system' ? 'bg-amber-50 text-amber-800 border border-amber-200 text-sm' :
                'bg-red-50 text-red-800 border border-red-200'
              } card-shadow`}>
                {message.type === 'system' && <AlertTriangle className="inline-block w-4 h-4 ml-2 text-amber-600" />}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
           {isLoading && (
              <div dir="rtl" className="flex justify-end">
                <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-2 card-shadow">
                   <div className="w-2 h-2 rounded-full bg-idf-olive animate-bounce" style={{ animationDelay: '0ms' }} />
                   <div className="w-2 h-2 rounded-full bg-idf-olive animate-bounce" style={{ animationDelay: '150ms' }} />
                   <div className="w-2 h-2 rounded-full bg-idf-olive animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
        </div>

        <footer className="p-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-idf-olive text-light-sand px-6 py-3 rounded-lg font-medium btn-press card-shadow disabled:opacity-50 disabled:cursor-not-allowed self-stretch flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
            <Textarea
              ref={textareaRef}
              dir="rtl"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="כתוב את שאלתך כאן..."
              className="flex-1 bg-white border-gray-300 text-dark-olive py-3 px-4 rounded-lg focus:border-idf-olive focus:ring-1 focus:ring-idf-olive resize-none overflow-y-hidden"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </form>
        </footer>
      </main>
    </div>
  );
}
