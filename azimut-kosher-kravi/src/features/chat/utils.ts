import { generateResponse } from './services/openaiService';

// Simple UUID generator for compatibility
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const simulateAIResponse = async (userMessage: string, conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []): Promise<string> => {
  try {
    // Convert conversation history to OpenAI format
    const messages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Get response from OpenAI
    return await generateResponse(messages);
  } catch (error) {
    console.error('Error getting AI response:', error);

    // Fallback to basic response if OpenAI fails
    return 'מצטער, אירעה שגיאה זמנית. אנא נסה שוב מאוחר יותר או פנה לגורמים מקצועיים לקבלת מידע מדויק.';
  }
};