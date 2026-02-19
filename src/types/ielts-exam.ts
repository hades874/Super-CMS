
import type { Question } from './index';

export type IeltsSectionType = 'Listening' | 'Reading' | 'Writing' | 'Speaking';

export interface IeltsExamSectionConfig {
  included: boolean;
  questionSetIds: string[]; // These are IDs or "Codes" for grouped questions
  timingMinutes: number;
}

export interface IeltsExam {
  id: string;
  examCode: string;
  title: string;
  type: 'Full' | 'ListeningReading' | 'Individual';
  ieltsCategory: 'Academic' | 'General Training';
  createdAt: string;
  creator: string;
  sections: {
    listening: IeltsExamSectionConfig;
    reading: IeltsExamSectionConfig;
    writing: IeltsExamSectionConfig;
    speaking: IeltsExamSectionConfig;
  };
  status: 'Draft' | 'Published';
  instructions?: string;
}

export interface IeltsSectionAttempt {
  sectionType: IeltsSectionType;
  skipped: boolean;
  startTime?: string;
  endTime?: string;
  answers: Record<string, string | string[]>; // questionId -> answer
  score?: number;
  bandScore?: number;
}

export interface IeltsExamAttempt {
  id: string;
  examId: string;
  startTime: string;
  endTime?: string;
  status: 'In Progress' | 'Completed';
  sections: Record<string, IeltsSectionAttempt>; // key is lowercase section type
  overallBandScore?: number;
}

export interface QuestionGroup {
  code: string;
  type: IeltsSectionType;
  questions: Question[];
  uploadDate: string;
}
