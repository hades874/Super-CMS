
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
  classDate: string;
  startTime: string;
  classTime: string;
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
}
