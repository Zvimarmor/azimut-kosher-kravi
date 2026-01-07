import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
const WEBSITE_DESC_FILE = path.join(process.cwd(), 'website_description.md');
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

// Process Markdown Description File
async function processMarkdownFile(filePath: string): Promise<RAGDocument[]> {
    console.log(`Processing markdown ${filePath}...`);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const documents: RAGDocument[] = [];

    // Split by H2 headers (## ) to get main sections
    // We treat the H1 as a general intro if present before first H2
    const sections = content.split(/^## /m);

    for (const section of sections) {
        let textToEmbed = section.trim();
        if (!textToEmbed) continue;

        // If it was split by ##, the first line is the title
        const lines = textToEmbed.split('\n');
        let title = 'General Info';

        // Check if this chunk actually had a header (it won't have '##' because we split by it)
        // But we need to handle the very first chunk which might be the file title ( # Title)

        if (lines[0].startsWith('# ')) {
            // Main title chunk
            title = lines[0].replace('# ', '').trim();
            textToEmbed = lines.slice(1).join('\n').trim();
        } else if (sections.indexOf(section) > 0) {
            // This is a section split by ##
            title = lines[0].trim();
            textToEmbed = lines.slice(1).join('\n').trim();
        }

        // Clean and prepare
        textToEmbed = `Topic: ${title}\nContent: ${textToEmbed}`;
        textToEmbed = cleanText(textToEmbed);

        if (textToEmbed.length < 10) continue;

        const embedding = await generateEmbedding(textToEmbed);
        if (embedding.length > 0) {
            documents.push({
                id: crypto.randomUUID(),
                content: textToEmbed,
                metadata: { type: 'manual_knowledge', title },
                embedding,
            });
            process.stdout.write('M');
        }
    }
    console.log(`\nProcessed ${documents.length} sections from markdown`);
    return documents;
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
        relax_quotes: true,
    }) as Record<string, any>[];

    const documents: RAGDocument[] = [];

    for (const record of records) {
        let textToEmbed = '';
        let metadata: Record<string, any> = { type, source: path.basename(filePath) };

        if (type === 'heritage') {
            textToEmbed = `Title: ${record.title}\nContent: ${record.content}`;
            metadata = { ...metadata, title: record.title, category: record.category };
        } else if (type === 'workout') {
            // Declarative format for workouts
            const title = record.Name || record.name || record.Title || record.title || 'Unknown Workout';
            const description = record.Description || record.description || record.Content || record.content || '';
            const difficulty = record.difficulty || record.Difficulty || 'General';
            const category = record.category || record.Category || 'General';
            const instructions = record.instructions || record.Instructions || '';

            textToEmbed = `Workout: ${title}\nCategory: ${category}\nDifficulty: ${difficulty}\n`;

            if (description) {
                textToEmbed += `Description: ${description}\n`;
            }
            if (instructions) {
                textToEmbed += `Instructions: ${instructions}\n`;
            }

            // Add attributes if they exist
            if (record.target_attributes && record.target_attributes !== '[]') {
                textToEmbed += `Targets: ${record.target_attributes}\n`;
            }

            // Minimal equipment check
            if (record.equipment && record.equipment !== '[]') {
                textToEmbed += `Equipment needed: ${record.equipment}\n`;
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

    // 1. Process Manual Website Description
    const manualDocs = await processMarkdownFile(WEBSITE_DESC_FILE);
    allDocuments.push(...manualDocs);

    // 2. Process Workout CSVs
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

    // 3. Process Heritage CSV
    // Check if heritage file exists before trying to process
    if (fs.existsSync(HERITAGE_FILE)) {
        const heritageDocs = await processFile(HERITAGE_FILE, 'heritage');
        allDocuments.push(...heritageDocs);
    } else {
        console.warn(`Skipping heritage file (not found): ${HERITAGE_FILE}`);
    }

    console.log(`\nTotal documents processed: ${allDocuments.length}`);

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Write to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allDocuments, null, 2));
    console.log(`RAG corpus saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
