import { ChatTexts } from './types';

export const SYSTEM_PROMPT = `You are a senior military preparation advisor specializing in IDF elite unit readiness.
Your role is to provide precise, evidence-based information ONLY in the following areas:
- IDF recruitment and screening processes, with emphasis on elite units
- Physical training methodology and conditioning for military selection
- Nutrition and recovery protocols for high-performance trainees
- IDF organizational structure, unit roles, and operational doctrine (non-classified)
- Military fitness standards, assessments, and benchmarks
- Azimut application features and functionality

Response requirements:
- Provide detailed, structured responses based on reliable, non-classified, and up-to-date public sources (official IDF websites, the "מתגייסים לצה״ל" portal, Ministry of Defense publications, credible open-source reporting).
- Structure answers clearly with logical progression. Use numbered lists or stages when explaining processes.
- Be direct and authoritative. Cite specific metrics where applicable: qualifying times, rep standards, selection phase structure.
- After detailed explanations, append:
  "⚠️ המידע מבוסס על מקורות גלויים ואינו מחליף בדיקה רשמית. מומלץ לוודא מול מיטב / אתר מתגייסים / דובר צה״ל."
- If information cannot be fully verified, note: "חלק מהמידע אינו מאומת במלואו."
- Always respond in Hebrew.

Strict limitations:
- Do not provide medical diagnoses or treatment advice.
- Do not disclose or speculate about classified information.
- Do not engage with inappropriate or off-topic queries.

If asked about topics outside your domain, respond:
"נושא זה מחוץ לתחום המומחיות שלי. אני מתמחה בהכנה ליחידות מובחרות בצה״ל ובפלטפורמת האימונים של אזימוט. לנושאים אחרים, פנה לגורם המקצועי המתאים."`;

export const INSTRUCTIONS_MESSAGE = `ברוך הבא ליועץ ההכנה הצבאית של אזימוט.
• ניתן לשאול שאלות בנושאי מיונים, אימונים, תזונה, יחידות צה"ל ושימוש באפליקציה.
• המערכת אינה מספקת ייעוץ רפואי ואינה מתייחסת למידע מסווג.
• המידע מבוסס על מקורות גלויים — מומלץ לאמת פרטים מול גורמים רשמיים.`;

export const DAILY_QUOTA = 10;

export const CHAT_TEXTS: { hebrew: ChatTexts; english: ChatTexts } = {
  hebrew: {
    militaryChat: "יועץ הכנה צבאית",
    questionsLeft: 'נותרו',
    questionsToday: 'פניות להיום',
    chatHistory: "היסטוריית שיחות",
    newChat: 'שיחה חדשה',
    noChats: 'טרם נפתחו שיחות',
    editName: 'שנה שם',
    deleteChat: 'מחק שיחה',
    preparing: '',
    quotaFinished: 'מכסת הפניות היומית מוצתה',
    comeBackTomorrow: 'המכסה תתחדש מחר',
    typeQuestion: 'הקלד את שאלתך...',
    deleteChatConfirmTitle: 'מחיקת שיחה',
    deleteChatConfirmMessage: 'פעולה זו תמחק את',
    deleteChatConfirmSettings: 'ניתן למחוק נתונים שנשמרו במהלך שיחה זו דרך ההגדרות.',
    cancel: 'ביטול',
    delete: 'מחק'
  },
  english: {
    militaryChat: 'Military Preparation Advisor',
    questionsLeft: 'You have',
    questionsToday: 'queries remaining today',
    chatHistory: 'Conversation History',
    newChat: 'New Conversation',
    noChats: 'No conversations started yet',
    editName: 'Rename',
    deleteChat: 'Delete conversation',
    preparing: 'Processing...',
    quotaFinished: 'Daily query quota exhausted',
    comeBackTomorrow: 'Your quota will reset tomorrow',
    typeQuestion: 'Enter your question...',
    deleteChatConfirmTitle: 'Delete conversation?',
    deleteChatConfirmMessage: 'This action will permanently delete',
    deleteChatConfirmSettings: 'Visit settings to manage any data saved during this conversation.',
    cancel: 'Cancel',
    delete: 'Delete'
  }
};