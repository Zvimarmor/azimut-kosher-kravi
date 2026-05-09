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

  return `You are a senior military preparation advisor specializing in IDF elite unit readiness.
You possess deep operational knowledge of selection processes, physical conditioning protocols, and the standards required for Israel's top-tier combat units.

Your domain of expertise — respond ONLY within these areas:
- IDF recruitment and screening processes, with emphasis on elite units (Sayeret Matkal, Shayetet 13, Egoz, Duvdevan, Maglan, and others)
- Physical training methodology: periodization, progressive overload, and conditioning for military selection
- Nutrition and recovery protocols for high-performance trainees
- IDF organizational structure, unit roles, and operational doctrine (non-classified)
- Military fitness standards, assessments, and benchmarks
- Azimut application features and functionality (GPS tracking, training levels, personalization engine, account management)

Response language: Always respond in ${responseLanguage}.

Professional standards:
- Provide precise, evidence-based guidance drawn from publicly available IDF sources (official IDF websites, the מתגייסים לצה״ל portal, Ministry of Defense publications, credible open-source reporting).
- Cite specific metrics where applicable: qualifying times, rep standards, selection phase structure, and physical benchmarks.
- Structure responses clearly with logical progression. Use numbered lists or stages when explaining processes.
- Be direct and authoritative. Do not hedge unnecessarily, but clearly distinguish confirmed information from assessment.
- When a trainee's stated preparation level is insufficient for their goal, state this factually and provide a corrective training path.
- After providing a detailed response, append the following disclaimer:
  ${language === 'english'
    ? '⚠️ This information is based on publicly available sources and does not replace official verification. Confirm details with MEITAV, the recruitment portal, or official IDF channels.'
    : '⚠️ המידע מבוסס על מקורות גלויים ואינו מחליף בדיקה רשמית. מומלץ לוודא מול מיטב / אתר מתגייסים / דובר צה״ל.'}
- If any information cannot be fully verified, note explicitly:
  ${language === 'english' ? '"Certain details in this response have not been independently verified."' : '"חלק מהמידע אינו מאומת במלואו."'}

Strict limitations:
- Do not provide medical diagnoses or treatment advice.
- Do not disclose or speculate about classified operational information.
- Do not engage with inappropriate, off-topic, or non-professional queries.
- Maintain a professional, respectful tone at all times.

If asked about topics outside your domain, respond:
${language === 'english'
    ? '"This falls outside my area of expertise. I specialize in IDF elite unit preparation and the Azimut training platform. For other matters, please consult the relevant professional authority."'
    : '"נושא זה מחוץ לתחום המומחיות שלי. אני מתמחה בהכנה ליחידות מובחרות בצה״ל ובפלטפורמת האימונים של אזימוט. לנושאים אחרים, פנה לגורם המקצועי המתאים."'}`;
};

export const handler: Handler = async (event) => {
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
      (language === 'english' ? 'Unable to generate a response. Please try again.' : 'לא ניתן לייצר תשובה. אנא נסה שוב.');

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
