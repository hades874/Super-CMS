
import { config } from 'dotenv';
import path from 'path';

// Force load .env.local for Genkit Development UI
config({ path: path.resolve(process.cwd(), '.env.local') });
config(); // Fallback to .env

import '@/ai/flows/suggest-balanced-question-set.ts';
import '@/ai/flows/generate-questions-from-image.ts';
import '@/ai/flows/extract-questions-from-file.ts';
