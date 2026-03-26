
'use server';

import * as mammoth from 'mammoth';
import { extractQuestionsFromFile } from '@/ai/flows/extract-questions-from-file';

export async function processIeltsFile(base64Data: string, fileName: string) {
  console.log(`[processIeltsFile] Starting processing for: ${fileName}`);
  try {
    const isDocx = fileName.toLowerCase().endsWith('.docx');
    const isPdf = fileName.toLowerCase().endsWith('.pdf');

    if (isDocx) {
      console.log(`[processIeltsFile] Detected DOCX. Extracting text...`);
      // Convert base64 to buffer
      // Data URI format: data:<mimetype>;base64,<data>
      const base64Parts = base64Data.split(',');
      const pureBase64 = base64Parts.length > 1 ? base64Parts[1] : base64Data;
      const buffer = Buffer.from(pureBase64, 'base64');
      
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      console.log(`[processIeltsFile] DOCX text extracted. Length: ${text.length}. Sending to AI...`);

      return await extractQuestionsFromFile({
        fileContent: text,
        fileType: 'text'
      });
    } else if (isPdf) {
      console.log(`[processIeltsFile] Detected PDF. Sending to AI for OCR...`);
      return await extractQuestionsFromFile({
        fileContent: base64Data,
        fileType: 'pdf'
      });
    } else {
      throw new Error('Unsupported file format. Please upload PDF or DOCX.');
    }
  } catch (error) {
    console.error('[processIeltsFile] Critical error:', error);
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred during file processing.');
  }
}

export async function fetchGoogleSheetData(url: string) {
  try {
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch || !idMatch[1]) {
      throw new Error('Invalid Google Sheet URL.');
    }
    const spreadsheetId = idMatch[1];
    
    // Common IELTS sheet names to try syncing
    const sheetsToTry = [
      'Listening', 'Reading', 'Writing Task 1', 'Writing Task 2', 'Speaking', 
      'Sheet1', 'Sheet 1', 'Questions', 'Database',
      'Academic Reading', 'General Reading', 'Academic Writing', 'General Writing',
      'LISTENING_QUESTIONS', 'READING_QUESTIONS', 'WRITING_TASK_1', 'WRITING_TASK_2'
    ];
    const results: { sheetName: string; csvData: string }[] = [];

    // First, try to fetch the default sheet (the one active or first)
    const defaultResponse = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`);
    if (defaultResponse.ok) {
        const defaultData = await defaultResponse.text();
        results.push({ sheetName: 'Default', csvData: defaultData });
    }

    // Then try to fetch specific sheets by name
    for (const sheetName of sheetsToTry) {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const response = await fetch(exportUrl);
      if (response.ok) {
        const csvData = await response.text();
        // Check if it's actually data or just a 404/error page in CSV form (sometimes happens)
        if (csvData && csvData.length > 50 && !results.some(r => r.csvData === csvData)) {
            results.push({ sheetName, csvData });
        }
      }
    }
    
    if (results.length === 0) {
      throw new Error('Failed to fetch any data from the Google Sheet. Ensure it is public.');
    }

    return results;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error fetching Google Sheet');
  }
}
