import { ChatTexts } from './types';

export const SYSTEM_PROMPT = `אתה עוזר AI מתמחה בנושאים צבאיים ישראליים. התפקיד שלך הוא לספק מידע מדויק ועובדתי בתחומים הבאים בלבד:
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
    preparing: 'מכין תשובה...',
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