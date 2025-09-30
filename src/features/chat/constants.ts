import { ChatTexts } from './types';
export const SYSTEM_PROMPT = `You are an AI assistant specialized in Israeli military topics.  
Your role is to provide detailed, accurate, and validated information ONLY in the following areas:
- IDF recruitment processes
- Military training programs
- Nutrition for soldiers and trainees
- Different IDF units
- Military fitness

Response requirements:
- Provide the most detailed answer possible based on reliable, non-classified, and up-to-date public sources (e.g., official IDF websites, the "מתגייסים לצה״ל" portal, Ministry of Defense publications, widely available guides, or credible open-source articles).
- Structure the answer clearly (e.g., stages of recruitment, requirements, training path, challenges).
- Do NOT give vague or shallow answers. Always expand with maximum useful detail available.
- Only after giving a detailed explanation, add:  
  "⚠️ המידע מבוסס על מקורות גלויים ואינו מחליף בדיקה רשמית. מומלץ לוודא מול מיטב / אתר מתגייסים / דובר צה״ל."
- If information cannot be fully verified, explicitly note the uncertainty:  
  "חלק מהמידע אינו מאומת במלואו."
- Always answer in Hebrew.

Strict limitations:
- Do not discuss medical topics
- Do not reveal classified information
- Do not answer inappropriate questions

If asked about a topic outside your domain, answer:  
"אני יכול לעזור רק בנושאים צבאיים כגון גיוס, אימונים, תזונה ויחידות צה״ל. לשאלות אחרות פנה לגורמים מקצועיים."`;

export const INSTRUCTIONS_MESSAGE = `הוראות שימוש:
• יש לשלוח לצ'אט רק שאלות בנושאים צבאיים כמו מיונים, אימונים, תזונה, יחידות בצה"ל וכו'.
• אין להתייעץ עם הצ'אט לגבי נושאים רפואיים, מידע מסווג או נושאים שאינם ראויים.
• יש להשתמש בשפה מכובדת וראויה.
• המידע שניתן על ידי הצ'אט יכול להיות שגוי, בבקשה תבדקו את המידע הניתן.`;

export const DAILY_QUOTA = 10;

export const CHAT_TEXTS: { hebrew: ChatTexts; english: ChatTexts } = {
  hebrew: {
    militaryChat: "צ'אט צבאי",
    questionsLeft: 'נשארו לך',
    questionsToday: 'שאלות היום',
    chatHistory: "היסטוריית צ'אטים",
    newChat: 'שיחה חדשה',
    noChats: 'עדיין לא התחלת שיחות',
    editName: 'שנה שם',
    deleteChat: 'מחק צ\'אט',
    preparing: '',
    quotaFinished: 'סיימת את מכסת השאלות היומית',
    comeBackTomorrow: 'חזור מחר לשאלות נוספות',
    typeQuestion: 'כתוב את שאלתך כאן...',
    deleteChatConfirmTitle: 'מחק צ\'אט?',
    deleteChatConfirmMessage: 'זה ימחק את',
    deleteChatConfirmSettings: 'בקר בהגדרות כדי למחוק זכרונות שנשמרו במהלך הצ\'אט הזה.',
    cancel: 'ביטול',
    delete: 'מחק'
  },
  english: {
    militaryChat: 'Military Chat',
    questionsLeft: 'You have',
    questionsToday: 'questions left today',
    chatHistory: 'Chat History',
    newChat: 'New Chat',
    noChats: 'No chats started yet',
    editName: 'Edit name',
    deleteChat: 'Delete chat',
    preparing: 'Preparing answer...',
    quotaFinished: 'Daily question quota finished',
    comeBackTomorrow: 'Come back tomorrow for more questions',
    typeQuestion: 'Type your question here...',
    deleteChatConfirmTitle: 'Delete chat?',
    deleteChatConfirmMessage: 'This will delete',
    deleteChatConfirmSettings: 'Visit settings to delete any memories saved during this chat.',
    cancel: 'Cancel',
    delete: 'Delete'
  }
};