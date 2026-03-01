
'use server';
/**
 * @fileOverview AI flow to generate questions from an image document.
 *
 * - generateQuestionsFromImage - A function that takes an image of a document and extracts questions.
 * - GenerateQuestionsFromImageInput - The input type for the flow.
 * - GenerateQuestionsFromImageOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuestionsFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateQuestionsFromImageInput = z.infer<
  typeof GenerateQuestionsFromImageInputSchema
>;

const GeneratedOptionSchema = z.object({
  text: z.string().describe('The text of the option.'),
  isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
});

const GeneratedQuestionSchema = z.object({
  question: z.string().describe('The extracted question text.'),
  options: z
    .array(GeneratedOptionSchema)
    .describe('An array of multiple-choice options for the question.'),
});

const GenerateQuestionsFromImageOutputSchema = z.object({
  generatedQuestions: z
    .array(GeneratedQuestionSchema)
    .describe(
      'An array of questions extracted from the document image.'
    ),
});
export type GenerateQuestionsFromImageOutput = z.infer<
  typeof GenerateQuestionsFromImageOutputSchema
>;

export async function generateQuestionsFromImage(
  input: GenerateQuestionsFromImageInput
): Promise<GenerateQuestionsFromImageOutput> {
  return generateQuestionsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsFromImagePrompt',
  input: { schema: GenerateQuestionsFromImageInputSchema },
  output: { schema: GenerateQuestionsFromImageOutputSchema },
  prompt: `You are an expert OCR and question parsing agent. Your task is to analyze the provided image of a document, identify all the questions, and structure them into a JSON format.

  The document can contain various question types, including:
  1.  Standard Multiple-Choice Questions (MCQs):
      - Extract the main question text.
      - Extract all possible answer options.
      - Identify the correct answer. If you cannot determine it, mark the first option as correct.

  2.  Form or Table Completion (e.g., Questions 1-10):
      - These often have a number in parentheses, like (1) or (15) ____.
      - For EACH numbered blank, treat it as a separate question.
      - The question text should be the label or context for that blank. For example, for "Name: Tom (1) ____", the question text should be "Name: Tom". For a table cell with "(15) ____" under a "KEY FEATURES" column and in the "GARDENS" row, the question text should be "GARDENS - KEY FEATURES: plants shaped like".
      - The options for these completion tasks will not be in the image. Generate four plausible but generic placeholder options (e.g., "Option A", "Option B", etc.) and mark the first one as correct.

  3.  "True/False/Not Given" Question Blocks:
      - The image may contain a block of statements (e.g., "Questions 9-13").
      - For EACH statement in the block, treat it as a separate question.
      - The "options" for each of these questions will ALWAYS be an array of three objects: { text: "TRUE" }, { text: "FALSE" }, and { text: "NOT GIVEN" }.
      - Since the correct answer cannot be determined from the image alone, you MUST mark "TRUE" as the correct answer by default for all of them (e.g., { text: "TRUE", isCorrect: true }).

  Please analyze the following image:
  Image: {{media url=photoDataUri}}
  
  Return the data as a JSON object with a "generatedQuestions" array. Each object in the array should contain:
  - "question": The question text (for completion/T/F questions, this is the label/statement).
  - "options": An array of objects, where each object has "text" and "isCorrect" (boolean) keys.
  
  Ensure your output is clean, well-structured JSON.
  `,
});

const generateQuestionsFromImageFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFromImageFlow',
    inputSchema: GenerateQuestionsFromImageInputSchema,
    outputSchema: GenerateQuestionsFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
