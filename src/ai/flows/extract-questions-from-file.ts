
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractQuestionsFromFileInputSchema = z.object({
  fileContent: z.string().describe('The content of the file. For PDFs, it is a base64 data URI. For DOCX, it is extracted raw text.'),
  fileType: z.string().describe('The type of content provided (pdf or text).'),
});

const GeneratedOptionSchema = z.object({
  text: z.string().describe('The text of the option.'),
  isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
});

const GeneratedQuestionSchema = z.object({
  question: z.string().describe('The extracted question text.'),
  options: z.array(GeneratedOptionSchema).describe('An array of multiple-choice options for the question.'),
  subject: z.string().optional().describe('Subject of the question (e.g., IELTS)'),
  topic: z.string().optional().describe('Topic or module (e.g., Listening Section 1)'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
});

const ExtractQuestionsFromFileOutputSchema = z.object({
  generatedQuestions: z.array(GeneratedQuestionSchema).describe('An array of questions extracted from the file.'),
});

export type ExtractQuestionsFromFileInput = z.infer<typeof ExtractQuestionsFromFileInputSchema>;
export type ExtractQuestionsFromFileOutput = z.infer<typeof ExtractQuestionsFromFileOutputSchema>;

export async function extractQuestionsFromFile(input: ExtractQuestionsFromFileInput): Promise<ExtractQuestionsFromFileOutput> {
  try {
    const { output } = await ai.generate({
        prompt: `You are an expert IELTS Content Specialist and OCR agent. Analyze the provided ${input.fileType.toUpperCase()} file content to extract ALL questions and structure them. Identify MCQs, T/F/NG, and completion tasks. Structure them into the output schema.
        
        Tag each question with "subject": "IELTS" and relevant "topic" (e.g., "Reading Section 1", "Listening Part 3").
        If options are missing for completion tasks, suggest generic but high-quality options.`,
        output: { schema: ExtractQuestionsFromFileOutputSchema },
        messages: [
            {
                role: 'user',
                content: input.fileType === 'pdf' 
                    ? [
                        { media: { url: input.fileContent, contentType: 'application/pdf' } },
                        { text: 'Analyze this IELTS PDF content.' }
                      ]
                    : [
                        { text: `Analyze this IELTS test text:\n\n${input.fileContent}` }
                      ]
            }
        ]
    });

    if (!output) {
        throw new Error('AI returned an empty response. This might be due to safety filters or unsupported content.');
    }

    return output;
  } catch (error) {
    console.error('Error in extractQuestionsFromFile flow:', error);
    throw new Error(`AI Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
