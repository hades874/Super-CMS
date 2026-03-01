

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-response'
  | 'true-false-not-given'
  | 'matching-headings'
  | 'sentence-completion'
  | 'summary-completion'
  | 'diagram-labeling'
  | 'short-answer'
  | 'flow-chart-completion'
  | 'fill-in-the-blanks'
  | 'drag-and-drop'
  | 'table'
  | 'matching-features'
  | 'yes-no-poll'
  | 'm1' // For legacy multiple choice
  | 'mcq'
  | 'cq'
  | 'ielts'
  | 'task-1'
  | 'task-2'
  | 'FILL_BLANKS';


export interface QuestionOption {
  id?: string; // Unique ID for the option
  text?: string;
  image?: string;
  isCorrect: boolean;
}

export interface Blank {
    id: string;
    correctAnswer: string;
    order: number;
}

export interface TableData {
    headers: string[];
    rows: string[][];
}

export interface Question {
  id: string;
  questionTypeId?: number; // To map to the new question types (2-17)
  text?: string;
  image?: string;
  options?: QuestionOption[];
  blanks?: Blank[]; // For fill-in-the-blanks
  table?: TableData; // For table-based questions
  answer?: string;
  subject?: string | string[];
  topic?: string | string[];
  class?: string | string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  type?: QuestionType; // Existing type, can be used for broad categorization
  createdAt?: string;
  explanation?: string;
  program?: string | string[];
  paper?: string | string[];
  chapter?: string | string[];
  board?: string | string[];
  vertical?: string | string[];
  exam_set?: string | string[];
  category?: string | string[];
  modules?: string | string[];
  group_type?: string | string[];
  marks?: number;
  questionNumber?: number;
  passageId?: string;
  partId?: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
}

export interface Exam {
  id: string;
  name: string;
  questions: Question[];
  duration: number; // in minutes
  negativeMarking: number; // percentage
  windowStart: string; // ISO date string
  windowEnd: string; // ISO date string
  createdAt: string;
}

export interface Submission {
  examId: string;
  answers: { [key: string]: string };
  timeTaken: number;
  submittedAt: string;
}


// IELTS Specific Types

export interface IeltsQuestion extends Question {
  type: 'ielts'; // Discriminating union property
  ieltsType: 'MCQ' | 'FILL_BLANKS' | 'MATCHING' | 'LABELLING' | 'COMPLETION' | 'TRUE_FALSE_NOT_GIVEN';
  grading: any; // Could be a more specific type based on ieltsType
}


export interface ReadingPassage {
  id: string;
  passageNumber: number;
  title: string;
  content: string; // The full text of the passage
  questions: Question[];
}

export interface ReadingSection {
  id: 'ar-s1';
  passages: ReadingPassage[];
}

export interface ListeningPart {
    id: string;
    partNumber: number;
    audioSrc: string;
    questions: Question[];
}

export interface ListeningSection {
    id: 'al-s1';
    parts: ListeningPart[];
}

export interface WritingTask {
    id: string;
    taskNumber: number;
    type: 'task-1' | 'task-2';
    text: string;
    image?: string;
}

export interface WritingSection {
    id: 'aw-s1';
    tasks: WritingTask[];
}

export interface IeltsTest {
  id: 'academic-test-1';
  title: string;
  type: 'Academic' | 'General Training';
  readingSection: ReadingSection;
  listeningSection: ListeningSection;
  writingSection: WritingSection;
}

export type QuestionStatus = 'unanswered' | 'answered' | 'review';

export type Answer = {
  questionNumber: number;
  value: string | string[] | null;
}

export type LiveClass = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'scheduled' | 'ended';
  accessible: 'private' | 'public';
  liveUrl?: string;
};

export type ZoomClass = {
    id: string;
    title: string;
    meetingId: string;
    start: string;
    end: string;
    liveUrl?: string;
};
