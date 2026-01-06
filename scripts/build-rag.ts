
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('Error: VITE_OPENAI_API_KEY is not set in .env');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Paths
const DATA_DIR = path.join(process.cwd(), 'public/data');
const HERITAGE_FILE = path.join(process.cwd(), 'heritage_import.csv');
const OUTPUT_FILE = path.join(process.cwd(), 'netlify/functions/data/rag_corpus.json');

// Interface for RAG Document
interface RAGDocument {
    id: string;
    content: string;
    metadata: Record<string, any>;
    embedding: number[];
}

// Helper to clean text
function cleanText(text: string): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

// Helper to generate embedding
async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return [];
    }
}

async function processFile(filePath: string, type: string): Promise<RAGDocument[]> {
    console.log(`Processing ${filePath}...`);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
    });

    const documents: RAGDocument[] = [];

    for (const record of records) {
        let textToEmbed = '';
        let metadata: Record<string, any> = { type, source: path.basename(filePath) };

        if (type === 'heritage') {
            textToEmbed = `Title: ${record.title}\nContent: ${record.content}`;
            metadata = { ...metadata, title: record.title, category: record.category };
        } else if (type === 'knowledge') {
            // AppKnowledge.csv columns: Topic, Question, Answer
            textToEmbed = `Topic: ${record.Topic}\nQuestion: ${record.Question}\nAnswer: ${record.Answer}`;
            metadata = { ...metadata, title: record.Topic, question: record.Question };
        } else {
            // Workout/Exercise CSVs
            const keys = Object.keys(record);
            const title = record.Name || record.name || record.Title || record.title || 'Unknown';
            const description = record.Description || record.description || record.Content || record.content || '';

            textToEmbed = `${type} - ${title}: ${description}`;

            for (const key of keys) {
                if (!['Name', 'name', 'Title', 'title', 'Description', 'description', 'Content', 'content'].includes(key)) {
                    if (record[key]) {
                        textToEmbed += `\n${key}: ${record[key]}`;
                    }
                }
            }
            metadata = { ...metadata, title };
        }

        textToEmbed = cleanText(textToEmbed);

        if (textToEmbed.length < 10) continue;

        const embedding = await generateEmbedding(textToEmbed);

        if (embedding.length > 0) {
            documents.push({
                id: crypto.randomUUID(),
                content: textToEmbed,
                metadata,
                embedding,
            });
            process.stdout.write('.');
        }
    }
    console.log(`\nProcessed ${documents.length} documents from ${filePath}`);
    return documents;
}

async function main() {
    console.log('Starting RAG corpus build...');

    const allDocuments: RAGDocument[] = [];

    // Process Workout CSVs
    const csvFiles = [
        'Warmup.csv',
        'StrengthExplosive.csv',
        'RunningEndurance.csv',
        'Special.csv',
    ];

    for (const file of csvFiles) {
        const docs = await processFile(path.join(DATA_DIR, file), 'workout');
        allDocuments.push(...docs);
    }

    // Process App Knowledge CSV
    const knowledgeDocs = await processFile(path.join(DATA_DIR, 'AppKnowledge.csv'), 'knowledge');
    allDocuments.push(...knowledgeDocs);

    // Process Heritage CSV
    const heritageDocs = await processFile(HERITAGE_FILE, 'heritage');
    allDocuments.push(...heritageDocs);

    console.log(`\nTotal documents processed: ${allDocuments.length}`);

    // Write to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allDocuments, null, 2));
    console.log(`RAG corpus saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
