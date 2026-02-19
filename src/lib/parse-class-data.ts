
import Papa from 'papaparse';
import type { RawClassRow, ParsedClass } from '@/types/class-creation';

function getField(row: RawClassRow, keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
    // Case-insensitive fallback
    const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
    if (foundKey) {
      const v = row[foundKey];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        return String(v).trim();
      }
    }
  }
  return '';
}

export function parseClassData(rawText: string): ParsedClass[] {
  if (!rawText.trim()) return [];

  // Try tab-separated first (Excel copy), fall back to comma-separated
  const delimiter = rawText.includes('\t') ? '\t' : ',';

  const result = Papa.parse<RawClassRow>(rawText.trim(), {
    header: true,
    delimiter,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
    transform: (v: string) => v.trim(),
  });

  if (!result.data || result.data.length === 0) return [];

  // Group rows by the 4-column multi-directional key
  const groupMap = new Map<string, { rows: RawClassRow[]; programs: Set<string> }>();

  for (const row of result.data) {
    const course   = getField(row, ['Course', 'course']);
    const subject  = getField(row, ['Subject', 'subject']);
    const chapter  = getField(row, ['Chapter', 'chapter']);
    const topic    = getField(row, ['Topic', 'topic']);
    const program  = getField(row, ['Program', 'program']);

    // Skip rows that have no meaningful content
    if (!course && !subject && !chapter && !topic) continue;

    const key = `${course}|${subject}|${chapter}|${topic}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, { rows: [row], programs: new Set(program ? [program] : []) });
    } else {
      const group = groupMap.get(key)!;
      group.rows.push(row);
      if (program) group.programs.add(program);
    }
  }

  const parsed: ParsedClass[] = [];

  groupMap.forEach(({ rows, programs }) => {
    // Use the first row as the canonical source for all non-program fields
    const row = rows[0];

    const programList = Array.from(programs).filter(Boolean);

    parsed.push({
      id: `cls-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      classCode:        getField(row, ['Class Code', 'ClassCode', 'class_code']),
      month:            getField(row, ['Month', 'month']),
      classDate:        getField(row, ['Class Date', 'ClassDate', 'class_date', 'Date']),
      startTime:        getField(row, ['Start Time', 'StartTime', 'start_time']),
      classTime:        getField(row, ['Class Time', 'ClassTime', 'class_time', 'Duration']),
      programs:         programList,
      course:           getField(row, ['Course', 'course']),
      subject:          getField(row, ['Subject', 'subject']),
      chapter:          getField(row, ['Chapter', 'chapter']),
      topic:            getField(row, ['Topic', 'topic']),
      teacher1:         getField(row, ['Teacher 1', 'Teacher1', 'teacher_1']),
      teacher2:         getField(row, ['Teacher 2/Doubt Solver 1', 'Teacher 2', 'Teacher2']),
      teacher3:         getField(row, ['Teacher 3/Doubt Solver 2', 'Teacher 3', 'Teacher3']),
      platform:         getField(row, ['Platform', 'platform']),
      title:            getField(row, ['Title', 'title']),
      caption:          getField(row, ['Caption', 'caption']),
      contentDeveloper: getField(row, ['Content Developer', 'ContentDeveloper', 'content_developer']),
      remarks:          getField(row, ['Remarks', 'remarks', 'Notes']),
      isMultiDirectional: programList.length > 1,
      createdAt:        new Date().toISOString(),
    });
  });

  return parsed;
}
