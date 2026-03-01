
export interface RawClassRow {
  'Class Code'?: string;
  'Month'?: string;
  'Class Date'?: string;
  'Start Time'?: string;
  'Class Time'?: string;
  'Program'?: string;
  'Course'?: string;
  'Subject'?: string;
  'Chapter'?: string;
  'Topic'?: string;
  'Teacher 1'?: string;
  'Teacher 2/Doubt Solver 1'?: string;
  'Teacher 3/Doubt Solver 2'?: string;
  'Platform'?: string;
  'Title'?: string;
  'Caption'?: string;
  'Content Developer'?: string;
  'Remarks'?: string;
  [key: string]: string | undefined;
}

export interface ParsedClass {
  id: string;
  classCode: string;
  month: string;
  classDate: string; // Full date string
  classEndDate?: string;
  startTime: string; // e.g., "10:00 PM"
  endTime: string;   // e.g., "11:30 PM"
  classTime: string; // Original raw time string
  programs: string[];
  course: string;
  subject: string;
  chapter: string;
  topic: string;
  teacher1: string;
  teacher2: string;
  teacher3: string;
  platform: string;
  title: string;
  caption: string;
  contentDeveloper: string;
  remarks: string;
  isMultiDirectional: boolean;
  createdAt: string;
  
  // New fields for extended editing
  classType?: string;
  description?: string;
  previewUrl?: string;
  downloadUrl?: string;
  doubtSolve?: 'Teacher Inbox' | 'TenTen';
  classDiscussion?: boolean;
  status?: 'Private' | 'Public';
  generateTranscription?: boolean;
  mappings?: Array<{
    type: string;
    program: string;
    course: string;
    subject: string;
  }>;
}
