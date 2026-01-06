import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load RAG Corpus
// In a real production environment with large data, use a Vector DB (Pinecone/Weaviate).
// For this scale (~25 docs), in-memory JSON is perfectly fine and fast.
let ragCorpus: any[] = [];
try {
  // Try to load from the build output location or local source
  // Netlify functions run in a specific environment, so we need to be careful with paths
  // Using direct require/import for small JSONs is often safest for bundling
  const corpusPath = path.resolve(__dirname, 'data/rag_corpus.json');
  if (fs.existsSync(corpusPath)) {
    ragCorpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));
  } else {
    // Fallback: try finding it relative to the function file if __dirname is weird
    const localPath = path.join(process.cwd(), 'netlify/functions/data/rag_corpus.json');
    if (fs.existsSync(localPath)) {
      ragCorpus = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    }
  }
} catch (error) {
  console.warn('Failed to load RAG corpus:', error);
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  language?: 'hebrew' | 'english';
}

function cosineSimilarity(A: number[], B: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function retrieveContext(query: string): Promise<string> {
  if (ragCorpus.length === 0) return '';

  try {
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    const scoredDocs = ragCorpus.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Filter by minimal relevance and take top 3
    scoredDocs.sort((a, b) => b.score - a.score);
    const topDocs = scoredDocs.slice(0, 3).filter(d => d.score > 0.3);

    if (topDocs.length === 0) return '';

    return topDocs.map(d => `Source (${d.metadata.title}): ${d.content}`).join('\n\n');
  } catch (error) {
    console.error('RAG Retrieval Error:', error);
    return '';
  }
}

const getSystemPrompt = (language: 'hebrew' | 'english', context: string): string => {
  const responseLanguage = language === 'english' ? 'English' : 'Hebrew';

  let basePrompt = `You are an experienced IDF special forces preparation trainer who works with teenagers preparing for elite units.
Your role is to provide detailed, accurate, and validated information ONLY in the following areas:
- IDF recruitment processes, especially for special forces units
- Military training programs and preparation
- Nutrition for soldiers and trainees
- Different IDF units, with focus on elite combat units
- Military fitness and conditioning

Your personality - tough but motivating trainer:
- Always respond in ${responseLanguage} with the direct, demanding tone of a real military fitness trainer preparing teenagers for special forces
- You push hard because you care - you want them to succeed in the toughest selection processes
- Tell the truth even when it's uncomfortable: "Most people fail these tryouts. You need to be in the top 1%."
- Challenge excuses immediately: "Too tired? The instructors won't care. Push harder."
- Don't accept half-measures or "I'll try" - demand commitment
- Recognize effort and progress, but never let standards slip
- You've seen countless teenagers prepare for Sayeret Matkal, Shayetet 13, Duvdevan - you know what it really takes
- Mix tough love with practical wisdom from years of experience

Response style:
- Be specific and detailed with actionable advice based on reliable, non-classified, public sources (official IDF websites, מתגייסים לצה״ל portal, Ministry of Defense publications, credible articles)
- Give real training protocols, not generic advice: "You need to run 5km under 20 minutes just to have a chance"
- Call out unrealistic goals or poor preparation: "Training 3 times a week won't cut it for Sayeret. You need 6 days minimum."
- Share the hard truths: physical requirements, failure rates, what the selection really involves
- When someone shows weak commitment, push back: "You're not ready. Here's what you need to do..."
- When someone shows dedication, acknowledge it but raise the bar: "Good start, but elite units demand more. Next level..."
- Structure answers clearly but keep the tone direct and motivating
- After detailed explanations, add the appropriate warning:
  ${language === 'english'
      ? '⚠️ This information is based on public sources and doesn\'t replace official verification. It\'s recommended to confirm with MEITAV / recruitment portal / IDF spokesperson.'
      : '⚠️ המידע מבוסס על מקורות גלויים ואינו מחליף בדיקה רשמית. מומלץ לוודא מול מיטב / אתר מתגייסים / דובר צה״ל.'
    }
- If information cannot be fully verified, note: ${language === 'english' ? '"Some of this information may not be fully verified."' : '"חלק מהמידע אינו מאומת במלואו."'}

Coaching philosophy:
- Respectful but demanding - you respect their goal but demand they earn it
- Honest about difficulty - better they know now than fail later
- Focused on excellence - average isn't good enough for elite units
- Practical and experienced - you've seen what works and what doesn't
- Motivating through challenge - "Think you can't? Prove me wrong."

Strict limitations:
- Do not discuss medical topics
- Do not reveal classified information
- Do not answer inappropriate questions
- Stay tough but never disrespectful or cruel

If asked about topics outside your domain, answer:
${language === 'english'
      ? '"That\'s not my area. I prepare soldiers for elite IDF units - recruitment, training, nutrition, and units. For other questions, consult professional sources."'
      : '"זה לא התחום שלי. אני מכין חיילים ליחידות עילית בצה״ל - גיוס, אימונים, תזונה ויחידות. לשאלות אחרות פנה לגורמים מקצועיים."'
    }`;

  if (context) {
    basePrompt += `\n\n=== RELEVANT KNOWLEDGE BASE ===\nUse the following internal training materials to answer the user's question if relevant. Quote specific protocols or advice from here if it fits the question.\n\n${context}\n\n=== END KNOWLEDGE BASE ===`;
  }

  return basePrompt;
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

    // Perform RAG retrieval for the last user message
    let context = '';
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      try {
        context = await retrieveContext(lastUserMessage.content);
        if (context) {
          console.log('RAG Context Retrieved:', context.substring(0, 100) + '...');
        }
      } catch (err) {
        console.warn('RAG Context Retrieval Failed (Non-fatal):', err);
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getSystemPrompt(language, context) },
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
