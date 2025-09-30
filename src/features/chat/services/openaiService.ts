export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateResponse = async (
  messages: ChatMessage[],
  language: 'hebrew' | 'english' = 'hebrew'
): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, language }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.error === 'quota_exceeded') {
        return language === 'english'
          ? 'Error: OpenAI daily quota has been reached. Try again tomorrow.'
          : 'שגיאה: המכסה היומית של OpenAI הסתיימה. נסה שוב מחר.';
      }

      if (errorData.error === 'api_key_error') {
        return language === 'english'
          ? 'Error: OpenAI API key not configured properly. Please contact the system developer.'
          : 'שגיאה: מפתח API של OpenAI לא הוגדר כראוי. אנא פנה למפתח המערכת.';
      }

      throw new Error('Failed to get response from server');
    }

    const data = await response.json();
    return data.content || (language === 'english' ? 'Sorry, I couldn\'t generate a response.' : 'מצטער, לא הצלחתי לייצר תשובה.');
  } catch (error) {
    console.error('Chat API Error:', error);

    return language === 'english'
      ? 'Sorry, there was an error communicating with the server. Please try again later.'
      : 'מצטער, אירעה שגיאה בתקשורת עם השרת. נסה שוב מאוחר יותר.';
  }
};