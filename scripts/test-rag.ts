
import dotenv from 'dotenv';
dotenv.config();

// Mock Netlify Event
const createEvent = (message: string, language: 'hebrew' | 'english' = 'english') => ({
    body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        language,
    }),
    httpMethod: 'POST',
    headers: {},
    isBase64Encoded: false,
    multiValueHeaders: {},
    path: '/.netlify/functions/chat',
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    rawQuery: '',
    rawUrl: '',
    requestContext: {} as any,
    resource: '',
});

async function runTest() {
    const { handler } = await import('../netlify/functions/chat');

    const testCases = [
        { query: "How can I start to train?", lang: 'english' },
        { query: "Can the app count my km?", lang: 'english' },
        { query: "How can I know my level?", lang: 'english' },
        { query: "are the training takes into accout my level?", lang: 'english' },
        // Hebrew tests
        { query: "איך אני מתחיל להתאמן?", lang: 'hebrew' },
        { query: "האם האפליקציה בודקת מרחק?", lang: 'hebrew' },
        { query: "מה זה אימון מיוחד?", lang: 'hebrew' }, // What is special training?
        { query: "איך עובד ה-GPS?", lang: 'hebrew' }, // How does the GPS work?
        { query: "למי האפליקציה מיועדת?", lang: 'hebrew' }, // Who is the app for?
    ];

    for (const test of testCases) {
        console.log(`\n--- Testing: "${test.query}" (${test.lang}) ---`);
        const event = createEvent(test.query, test.lang as any);

        try {
            // @ts-ignore
            const response = await handler(event, {} as any);

            if (response && response.body) {
                const body = JSON.parse(response.body);
                console.log('Response:', body.content.substring(0, 150) + '...');

                // Simple validation check (keyword presence)
                if (body.content.length > 50) {
                    console.log('✅ Response generated.');
                } else {
                    console.log('⚠️ Response seems short.');
                }
            } else {
                console.error('No response body');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

runTest();
