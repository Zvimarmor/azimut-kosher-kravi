import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  language?: 'hebrew' | 'english';
}

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

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, language = 'hebrew' }: RequestBody = JSON.parse(event.body || '{}');

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getSystemPrompt(language) },
        ...messages
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content ||
      (language === 'english' ? 'Sorry, I couldn\'t generate a response.' : 'מצטער, לא הצלחתי לייצר תשובה.');

    return {
      statusCode: 200,
      body: JSON.stringify({ content }),
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);

    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        errorMessage = 'quota_exceeded';
      } else if (error.message.includes('API key')) {
        errorMessage = 'api_key_error';
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
