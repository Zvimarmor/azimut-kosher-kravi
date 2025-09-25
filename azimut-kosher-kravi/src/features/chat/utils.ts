import { SYSTEM_PROMPT } from './constants';

// Simple UUID generator for compatibility
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const simulateAIResponse = async (userMessage: string): Promise<string> => {
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