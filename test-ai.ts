
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_API_KEY })],
});

async function main() {
  try {
    console.log('Testing gemini-2.0-flash...');
    const { text } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: 'Hi, return a JSON { "status": "ok" }',
        output: { format: 'json' }
    });
    console.log('Success! Response:', text);
  } catch (e: any) {
    console.error('Error with gemini-2.0-flash:', e.message || e);
  }
}
main();
