
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_API_KEY })],
});

async function main() {
  try {
    // In Genkit, we can't easily list models via registry.list in a simple way 
    // without it being initialized. 
    // Let's try to just do a simple generate with a known stable model name.
    console.log('Using API Key:', process.env.GOOGLE_API_KEY ? 'FOUND' : 'MISSING');
    
    // Test with gemini-1.5-flash-latest
    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: 'Hi',
    });
    console.log('Response from gemini-1.5-flash-latest:', text);
  } catch (e) {
    console.error('Error with gemini-1.5-flash-latest:', e.message);
    
    try {
        // Test with gemini-pro
        const { text } = await ai.generate({
            model: 'googleai/gemini-pro',
            prompt: 'Hi',
        });
        console.log('Response from gemini-pro:', text);
    } catch (e2) {
        console.error('Error with gemini-pro:', e2.message);
    }
  }
}
main();
