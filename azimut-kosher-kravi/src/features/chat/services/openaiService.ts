import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../constants';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateResponse = async (
  messages: ChatMessage[]
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective than gpt-3.5-turbo with better quality
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 2000, // Increased to allow for full detailed responses as requested in system prompt
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'מצטער, לא הצלחתי לייצר תשובה.';
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'שגיאה: מפתח API של OpenAI לא הוגדר כראוי. אנא פנה למפתח המערכת.';
      }
      if (error.message.includes('quota')) {
        return 'שגיאה: המכסה היומית של OpenAI הסתיימה. נסה שוב מחר.';
      }
    }

    return 'מצטער, אירעה שגיאה בתקשורת עם השרת. נסה שוב מאוחר יותר.';
  }
};