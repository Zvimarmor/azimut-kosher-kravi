import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../constants';

const getSystemPrompt = (language: 'hebrew' | 'english'): string => {
  const responseLanguage = language === 'english' ? 'English' : 'Hebrew';

  return `You are a friendly and conversational AI assistant specialized in Israeli military topics.
Your role is to provide detailed, accurate, and validated information ONLY in the following areas:
- IDF recruitment processes
- Military training programs
- Nutrition for soldiers and trainees
- Different IDF units
- Military fitness

Response requirements:
- Always respond in ${responseLanguage} in a conversational, friendly tone (like talking to a knowledgeable friend)
- Provide detailed answers based on reliable, non-classified, public sources (official IDF websites, מתגייסים לצה״ל portal, Ministry of Defense publications, credible articles)
- Structure answers clearly with maximum useful detail
- Be conversational but informative - avoid overly formal language
- After detailed explanations, add the appropriate warning:
  ${language === 'english'
    ? '⚠️ This information is based on public sources and doesn\'t replace official verification. It\'s recommended to confirm with MEITAV / recruitment portal / IDF spokesperson.'
    : '⚠️ המידע מבוסס על מקורות גלויים ואינו מחליף בדיקה רשמית. מומלץ לוודא מול מיטב / אתר מתגייסים / דובר צה״ל.'
  }
- If information cannot be fully verified, note: ${language === 'english' ? '"Some of this information may not be fully verified."' : '"חלק מהמידע אינו מאומת במלואו."'}

Strict limitations:
- Do not discuss medical topics
- Do not reveal classified information
- Do not answer inappropriate questions

If asked about topics outside your domain, answer:
${language === 'english'
  ? '"I can only help with military topics like recruitment, training, nutrition, and IDF units. For other questions, please consult professional sources."'
  : '"אני יכול לעזור רק בנושאים צבאיים כגון גיוס, אימונים, תזונה ויחידות צה״ל. לשאלות אחרות פנה לגורמים מקצועיים."'
}`;
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateResponse = async (
  messages: ChatMessage[],
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective than gpt-3.5-turbo with better quality
      messages: [
        { role: 'system', content: getSystemPrompt(language) },
        ...messages
      ],
      max_tokens: 2000, // Increased to allow for full detailed responses as requested in system prompt
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || (language === 'english' ? 'Sorry, I couldn\'t generate a response.' : 'מצטער, לא הצלחתי לייצר תשובה.');
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return language === 'english'
          ? 'Error: OpenAI API key not configured properly. Please contact the system developer.'
          : 'שגיאה: מפתח API של OpenAI לא הוגדר כראוי. אנא פנה למפתח המערכת.';
      }
      if (error.message.includes('quota')) {
        return language === 'english'
          ? 'Error: OpenAI daily quota has been reached. Try again tomorrow.'
          : 'שגיאה: המכסה היומית של OpenAI הסתיימה. נסה שוב מחר.';
      }
    }

    return language === 'english'
      ? 'Sorry, there was an error communicating with the server. Please try again later.'
      : 'מצטער, אירעה שגיאה בתקשורת עם השרת. נסה שוב מאוחר יותר.';
  }
};