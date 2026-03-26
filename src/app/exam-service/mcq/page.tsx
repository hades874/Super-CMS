
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  ArrowLeft, Plus, Trash2, ChevronRight, Wand2,
  Settings, Clock, BookOpen, AlignLeft, List, Copy, Check,
  Search, X, ChevronsUpDown, CheckCheck,
} from 'lucide-react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types';

// ─── Dropdown data ────────────────────────────────────────────────────────────

const VERTICALS = ['k12', 'skills'];

const PROGRAMS = [
  'HSC 27 অনলাইন ব্যাচ - ইকোনমিক্স',
  'HSC 27 অনলাইন ব্যাচ - জিওগ্রাফি',
  'HSC 27 অনলাইন ব্যাচ - একাউন্টিং',
  'HSC 27 অনলাইন ব্যাচ - ফাইন্যান্স',
  'HSC 27 অনলাইন ব্যাচ - বায়োলজি',
  'HSC 27 অনলাইন ব্যাচ - ম্যাথ',
  'HSC 27 অনলাইন ব্যাচ - কেমিস্ট্রি',
  'HSC 27 অনলাইন ব্যাচ - ফিজিক্স',
  'HSC 27 অনলাইন ব্যাচ - ICT',
  'HSC 27 অনলাইন ব্যাচ - ইংরেজি',
  'HSC 27 অনলাইন ব্যাচ - বাংলা',
  'HSC 26 অনলাইন ব্যাচ - ম্যাথ',
  'HSC 26 অনলাইন ব্যাচ - কেমিস্ট্রি',
  'HSC 26 অনলাইন ব্যাচ - ফিজিক্স',
  'HSC 26 অনলাইন ব্যাচ - বায়োলজি',
  'HSC 26 অনলাইন ব্যাচ - ICT 2.0',
  'HSC 26 অনলাইন ব্যাচ - ইংরেজি 2.0',
  'HSC 26 অনলাইন ব্যাচ - বাংলা 2.0',
  '১০ম শ্রেণি - অনলাইন ব্যাচ ২০২৫ (বিজ্ঞান বিভাগ) + টেস্ট পরীক্ষার প্রস্তুতি [SSC 2026 ব্যাচ]',
  '৯ম শ্রেণি - অনলাইন ব্যাচ + বার্ষিক পরীক্ষার প্রস্তুতি ২০২৫',
  '৮ম শ্রেণি - অনলাইন ব্যাচ + বার্ষিক পরীক্ষার প্রস্তুতি ২০২৫',
  '৭ম শ্রেণি - অনলাইন ব্যাচ + বার্ষিক পরীক্ষার প্রস্তুতি ২০২৫',
  '৬ষ্ঠ শ্রেণি - অনলাইন ব্যাচ + বার্ষিক পরীক্ষার প্রস্তুতি ২০২৫',
  'ভার্সিটি A Unit + গুচ্ছ এডমিশন কোর্স - ২০২৫',
  'ভার্সিটি B Unit + গুচ্ছ এডমিশন কোর্স - ২০২৫',
  'ভার্সিটি C Unit + গুচ্ছ এডমিশন কোর্স - ২০২৫',
  'HSC 26 শেষ মুহূর্তের প্রস্তুতি কোর্স [বিজ্ঞান বিভাগ]',
  'HSC 26 শেষ মুহূর্তের প্রস্তুতি কোর্স [মানবিক বিভাগ]',
  'HSC 26 শেষ মুহূর্তের প্রস্তুতি কোর্স [ব্যবসায় শিক্ষা বিভাগ]',
  'HSC 26 শেষ মুহূর্তের প্রস্তুতি কোর্স [বাংলা, ইংরেজি, ICT]',
  'SSC 2026 শেষ মুহূর্তের প্রস্তুতি কোর্স [বিজ্ঞান বিভাগ]',
  'SSC 2026 Shesh Muhurter Prostuti Course [Humanities]',
  'SSC 2026 Shesh Muhurter Prostuti Course [Business Studies]',
  'ষষ্ঠ শ্রেণি - অনলাইন ব্যাচ ২০২৬',
  'সপ্তম শ্রেণি - অনলাইন ব্যাচ ২০২৬',
  'অষ্টম শ্রেণি - অনলাইন ব্যাচ ২০২৬',
  'নবম শ্রেণি - অনলাইন ব্যাচ ২০২৬ [বিজ্ঞান বিভাগ - SSC 28]',
  'নবম শ্রেণি - অনলাইন ব্যাচ ২০২৬ [ব্যবসায় শিক্ষা ও মানবিক বিভাগ - SSC 28]',
  'নবম শ্রেণি - বাংলা, ইংরেজি ও আইসিটি অনলাইন ব্যাচ ২০২৬ [সকল বিভাগ - SSC 2028]',
  'দশম শ্রেণি - অনলাইন ব্যাচ ২০২৬ [বিজ্ঞান বিভাগ - SSC 27]',
  'দশম শ্রেণি - বাংলা, ইংরেজি ও আইসিটি অনলাইন ব্যাচ ২০২৬ [সকল বিভাগ - SSC 2027]',
  'Class 5 Super Course | 2026',
  'Class 6 Super Course | 2026',
  'Class 7 Super Course | 2026',
  'Class 8 Super Course | 2026',
  'SSC 28 | Class 9 Super Course',
  'SSC 27 | Class 10 Super Course',
  'SSC 26 | Super Course',
];

const SUBJECTS = [
  'Science', 'Math', 'English', 'General Math', 'Physics', 'Chemistry',
  'Biology', 'Higher Math', 'Business Entrepreneurship', 'Accounting',
  'Finance & Banking', 'Economics', 'Civics and Citizenship',
  'History of Bangladesh & World Civilization', 'GK National', 'GK International',
  'ICT', 'Bangla', 'BGS', 'Ethics & Governance', 'Geography',
  'Mental Ability', 'Marketing', 'Social Work', 'Logic',
];

const CLASSES = [
  'Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05', 'Class 06',
  'Class 07', 'Class 08', 'Class 09', 'Class 10', 'Class 11', 'Class 12',
  'Class 9 - 10', 'Class 11 - 12',
];

const PAPERS = ['1st Paper', '2nd Paper'];

const CHAPTERS = Array.from({ length: 30 }, (_, i) => `Chapter ${i + 1}`);

const EXAM_SETS = [
  ...Array.from({ length: 20 }, (_, i) => `Exam Set ${i + 1}`),
  'Model Test',
  'Monthly Test',
  'Weekly Test 01',
  'Weekly Test 02',
  'Weekly Test 03',
  'Weekly Test 04',
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamServiceConfig = {
  id: string;
  createdAt: string;
  // General
  title: string;
  examType: string;
  accessType: string;
  vertical: string;
  program: string;
  subject: string;
  class: string;
  paper: string;
  chapter: string;
  examSet: string;
  // Submission
  totalMarks: string;
  negativeMarking: boolean;
  negativeMarkValue: string;
  passMark: string;
  showResult: boolean;
  allowRetake: boolean;
  maxAttempts: string;
  // Time
  durationMinutes: string;
  windowStart: string;
  windowEnd: string;
  showTimer: boolean;
  autoSubmit: boolean;
  // Question
  totalQuestions: string;
  questionsPerPage: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showQuestionNumbers: boolean;
  // Instruction
  instructions: string;
  termsAndConditions: string;
  // Composition — IDs of selected questions
  selectedQuestionIds: string[];
  // Attribute fingerprint used to filter
  attributeSet: Record<string, string> | null;
};

const EXAM_TYPES = [
  'MCQ Exam', 'Quiz', 'Mock Test', 'Model Test', 'Practice Test',
  'Weekly Exam', 'Monthly Exam', 'Diagnostic Test', 'Final Exam',
  'Admission Test', 'Scholarship Test', 'Competitive Exam',
];

const ACCESS_TYPES = ['Public', 'Private', 'Enrolled Only', 'Premium'];

const TABS = [
  { id: 'general',     label: 'General',     icon: Settings },
  { id: 'submission',  label: 'Submission',  icon: Check },
  { id: 'time',        label: 'Time',        icon: Clock },
  { id: 'question',    label: 'Question',    icon: BookOpen },
  { id: 'instruction', label: 'Instruction', icon: AlignLeft },
  { id: 'composition', label: 'Composition', icon: List },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── Factory ──────────────────────────────────────────────────────────────────

function defaultExam(): ExamServiceConfig {
  return {
    id: `exam-${Date.now()}`,
    createdAt: new Date().toISOString(),
    title: '',
    examType: 'MCQ Exam',
    accessType: 'Public',
    vertical: '',
    program: '',
    subject: '',
    class: '',
    paper: '',
    chapter: '',
    examSet: '',
    totalMarks: '100',
    negativeMarking: false,
    negativeMarkValue: '0.25',
    passMark: '40',
    showResult: true,
    allowRetake: false,
    maxAttempts: '1',
    durationMinutes: '60',
    windowStart: '',
    windowEnd: '',
    showTimer: true,
    autoSubmit: true,
    totalQuestions: '30',
    questionsPerPage: '10',
    shuffleQuestions: false,
    shuffleOptions: false,
    showQuestionNumbers: true,
    instructions: '',
    termsAndConditions: '',
    selectedQuestionIds: [],
    attributeSet: null,
  };
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={value ? 'font-medium' : 'text-muted-foreground'}>
            {value || placeholder || 'Select...'}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-[10px] text-muted-foreground">No results found.</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => { onChange(''); setOpen(false); }}
                  className="text-xs text-muted-foreground italic"
                >
                  <X className="mr-2 h-3 w-3" /> Clear selection
                </CommandItem>
              )}
              {options.map(opt => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => { onChange(opt); setOpen(false); }}
                  className="text-xs"
                >
                  <Check className={`mr-2 h-3 w-3 ${value === opt ? 'opacity-100' : 'opacity-0'}`} />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 mt-6 first:mt-0">
    {children}
  </h3>
);

const Field = ({
  label, children, description,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold uppercase tracking-wider">{label}</Label>
    {children}
    {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
  </div>
);

const CheckField = ({
  label, description, checked, onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} className="mt-0.5" />
    <div>
      <p className="text-xs font-bold">{label}</p>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function McqExamServicePage() {
  const [exams, setExams] = useLocalStorage<ExamServiceConfig[]>('examServiceMcq', []);
  const [allQuestions] = useLocalStorage<Question[]>('allQuestions', []);

  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [attrPasteRaw, setAttrPasteRaw] = useState('');
  const [attrParseError, setAttrParseError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const activeExam = useMemo(
    () => exams.find(e => e.id === activeExamId) ?? null,
    [exams, activeExamId],
  );

  const update = (patch: Partial<ExamServiceConfig>) => {
    if (!activeExamId) return;
    setExams(prev =>
      prev.map(e => (e.id === activeExamId ? { ...e, ...patch } : e)),
    );
  };

  const createNewExam = () => {
    const exam = defaultExam();
    setExams(prev => [exam, ...prev]);
    setActiveExamId(exam.id);
    setActiveTab('general');
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    if (activeExamId === id) setActiveExamId(null);
  };

  // Attribute-filtered questions for Composition tab
  const matchingQuestions = useMemo(() => {
    if (!activeExam?.attributeSet) return allQuestions;
    const attrSet = activeExam.attributeSet;
    return allQuestions.filter(q => {
      return Object.entries(attrSet).every(([key, val]) => {
        const qVal = (q as unknown as Record<string, unknown>)[key];
        if (!qVal) return false;
        const qValStr = Array.isArray(qVal) ? qVal[0] : String(qVal);
        return qValStr === val;
      });
    });
  }, [allQuestions, activeExam?.attributeSet]);

  const filteredQuestions = useMemo(() => {
    if (!searchTerm) return matchingQuestions;
    const lower = searchTerm.toLowerCase();
    return matchingQuestions.filter(
      q => q.text?.toLowerCase().includes(lower) || String(q.subject || '').toLowerCase().includes(lower),
    );
  }, [matchingQuestions, searchTerm]);

  const selectedQuestions = useMemo(() => {
    if (!activeExam) return [];
    return allQuestions.filter(q => activeExam.selectedQuestionIds.includes(q.id));
  }, [allQuestions, activeExam]);

  const toggleQuestionSelection = (qId: string) => {
    if (!activeExam) return;
    const already = activeExam.selectedQuestionIds.includes(qId);
    update({
      selectedQuestionIds: already
        ? activeExam.selectedQuestionIds.filter(id => id !== qId)
        : [...activeExam.selectedQuestionIds, qId],
    });
  };

  const selectAllFiltered = () => {
    if (!activeExam) return;
    const newIds = filteredQuestions.map(q => q.id);
    const merged = Array.from(new Set([...activeExam.selectedQuestionIds, ...newIds]));
    update({ selectedQuestionIds: merged });
  };

  const deselectAllFiltered = () => {
    if (!activeExam) return;
    const filteredIds = new Set(filteredQuestions.map(q => q.id));
    update({ selectedQuestionIds: activeExam.selectedQuestionIds.filter(id => !filteredIds.has(id)) });
  };

  const allFilteredSelected = useMemo(() => {
    if (!activeExam || filteredQuestions.length === 0) return false;
    return filteredQuestions.every(q => activeExam.selectedQuestionIds.includes(q.id));
  }, [filteredQuestions, activeExam]);

  const applyAttributeSet = () => {
    setAttrParseError('');
    try {
      const parsed = JSON.parse(attrPasteRaw);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        setAttrParseError('Must be a JSON object like {"subject":"Math","class":"Class 9 - 10"}');
        return;
      }
      update({ attributeSet: parsed });
      setAttrPasteRaw('');
      toast({ title: 'Attribute set applied', description: `${Object.keys(parsed).length} attributes loaded.` });
    } catch {
      setAttrParseError('Invalid JSON — paste the copied fingerprint from Bulk Upload.');
    }
  };

  const copyExamConfig = () => {
    if (!activeExam) return;
    navigator.clipboard.writeText(JSON.stringify(activeExam, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Exam config copied to clipboard.' });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col gap-0 h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">MCQ Exam Service</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Configure &amp; Publish MCQ Exams ({exams.length} Exams)
            </p>
          </div>
        </div>
        <Button onClick={createNewExam} className="h-10 px-5 rounded-xl font-bold gap-2 text-xs uppercase">
          <Plus className="h-4 w-4" /> New Exam
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Exam list sidebar */}
        <div className="w-72 border-r flex flex-col bg-muted/20">
          <div className="p-3 border-b">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Exam Registry</p>
          </div>
          <ScrollArea className="flex-1">
            {exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                  No Exams Yet
                </p>
                <Button onClick={createNewExam} variant="outline" size="sm" className="mt-4 rounded-xl text-xs font-bold gap-2">
                  <Plus className="h-3.5 w-3.5" /> Create First Exam
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {exams.map(exam => (
                  <button
                    key={exam.id}
                    onClick={() => { setActiveExamId(exam.id); setActiveTab('general'); }}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all group flex items-center justify-between gap-2 ${
                      activeExamId === exam.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${activeExamId === exam.id ? 'text-primary-foreground' : ''}`}>
                        {exam.title || 'Untitled Exam'}
                      </p>
                      <p className={`text-[9px] font-medium truncate ${activeExamId === exam.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {exam.examType} · {exam.selectedQuestionIds.length}Q
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${activeExamId === exam.id ? 'text-primary-foreground/70' : 'text-muted-foreground/40'}`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Editor area */}
        {!activeExam ? (
          <div className="flex-1 flex items-center justify-center bg-muted/5">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                Select an exam or create a new one
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Tab sidebar */}
            <div className="w-44 border-r bg-muted/10 flex flex-col py-3 gap-0.5 px-2">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground font-black shadow-sm'
                        : 'hover:bg-muted/60 font-bold text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
                  </button>
                );
              })}
              <Separator className="my-2" />
              <button
                onClick={() => deleteExam(activeExam.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Delete</span>
              </button>
              <button
                onClick={copyExamConfig}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-muted-foreground hover:bg-muted/60 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-green-600" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
                <span className="text-[10px] font-bold uppercase tracking-wide">{copied ? 'Copied!' : 'Export'}</span>
              </button>
            </div>

            {/* Tab content */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-2xl space-y-4">
                {/* ── GENERAL ── */}
                {activeTab === 'general' && (
                  <>
                    <SectionTitle>Basic Information</SectionTitle>
                    <Field label="Exam Title">
                      <Input
                        value={activeExam.title}
                        onChange={e => update({ title: e.target.value })}
                        placeholder="e.g. SSC Physics Model Test 2025"
                        className="rounded-xl"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Exam Type">
                        <Select value={activeExam.examType} onValueChange={v => update({ examType: v })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {EXAM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Access Type">
                        <Select value={activeExam.accessType} onValueChange={v => update({ accessType: v })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ACCESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <SectionTitle>Attribute Classification</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Vertical">
                        <SearchableSelect
                          value={activeExam.vertical}
                          onChange={v => update({ vertical: v })}
                          options={VERTICALS}
                          placeholder="Select vertical"
                        />
                      </Field>
                      <Field label="Subject">
                        <SearchableSelect
                          value={activeExam.subject}
                          onChange={v => update({ subject: v })}
                          options={SUBJECTS}
                          placeholder="Select subject"
                        />
                      </Field>
                      <Field label="Class">
                        <SearchableSelect
                          value={activeExam.class}
                          onChange={v => update({ class: v })}
                          options={CLASSES}
                          placeholder="Select class"
                        />
                      </Field>
                      <Field label="Paper">
                        <SearchableSelect
                          value={activeExam.paper}
                          onChange={v => update({ paper: v })}
                          options={PAPERS}
                          placeholder="Select paper"
                        />
                      </Field>
                      <Field label="Chapter">
                        <SearchableSelect
                          value={activeExam.chapter}
                          onChange={v => update({ chapter: v })}
                          options={CHAPTERS}
                          placeholder="Select chapter"
                        />
                      </Field>
                      <Field label="Exam Set">
                        <SearchableSelect
                          value={activeExam.examSet}
                          onChange={v => update({ examSet: v })}
                          options={EXAM_SETS}
                          placeholder="Select exam set"
                        />
                      </Field>
                    </div>
                    <Field label="Program">
                      <SearchableSelect
                        value={activeExam.program}
                        onChange={v => update({ program: v })}
                        options={PROGRAMS}
                        placeholder="Select program"
                      />
                    </Field>
                  </>
                )}

                {/* ── SUBMISSION ── */}
                {activeTab === 'submission' && (
                  <>
                    <SectionTitle>Marking Scheme</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Total Marks">
                        <Input value={activeExam.totalMarks} onChange={e => update({ totalMarks: e.target.value })} type="number" className="rounded-xl" />
                      </Field>
                      <Field label="Pass Mark">
                        <Input value={activeExam.passMark} onChange={e => update({ passMark: e.target.value })} type="number" className="rounded-xl" />
                      </Field>
                    </div>
                    <CheckField
                      label="Enable Negative Marking"
                      description="Deduct marks for wrong answers"
                      checked={activeExam.negativeMarking}
                      onCheckedChange={v => update({ negativeMarking: v })}
                    />
                    {activeExam.negativeMarking && (
                      <Field label="Negative Mark Value" description="Marks deducted per wrong answer">
                        <Input value={activeExam.negativeMarkValue} onChange={e => update({ negativeMarkValue: e.target.value })} type="number" step="0.25" className="rounded-xl" />
                      </Field>
                    )}

                    <SectionTitle>Retake Policy</SectionTitle>
                    <CheckField
                      label="Allow Retake"
                      checked={activeExam.allowRetake}
                      onCheckedChange={v => update({ allowRetake: v })}
                    />
                    {activeExam.allowRetake && (
                      <Field label="Max Attempts">
                        <Input value={activeExam.maxAttempts} onChange={e => update({ maxAttempts: e.target.value })} type="number" min="1" className="rounded-xl" />
                      </Field>
                    )}
                    <CheckField
                      label="Show Result After Submission"
                      checked={activeExam.showResult}
                      onCheckedChange={v => update({ showResult: v })}
                    />
                  </>
                )}

                {/* ── TIME ── */}
                {activeTab === 'time' && (
                  <>
                    <SectionTitle>Duration</SectionTitle>
                    <Field label="Duration (minutes)">
                      <Input value={activeExam.durationMinutes} onChange={e => update({ durationMinutes: e.target.value })} type="number" className="rounded-xl" />
                    </Field>
                    <CheckField
                      label="Show Countdown Timer"
                      checked={activeExam.showTimer}
                      onCheckedChange={v => update({ showTimer: v })}
                    />
                    <CheckField
                      label="Auto Submit on Expiry"
                      checked={activeExam.autoSubmit}
                      onCheckedChange={v => update({ autoSubmit: v })}
                    />

                    <SectionTitle>Availability Window</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Window Start">
                        <Input value={activeExam.windowStart} onChange={e => update({ windowStart: e.target.value })} type="datetime-local" className="rounded-xl" />
                      </Field>
                      <Field label="Window End">
                        <Input value={activeExam.windowEnd} onChange={e => update({ windowEnd: e.target.value })} type="datetime-local" className="rounded-xl" />
                      </Field>
                    </div>
                  </>
                )}

                {/* ── QUESTION ── */}
                {activeTab === 'question' && (
                  <>
                    <SectionTitle>Question Configuration</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Total Questions">
                        <Input value={activeExam.totalQuestions} onChange={e => update({ totalQuestions: e.target.value })} type="number" className="rounded-xl" />
                      </Field>
                      <Field label="Questions Per Page">
                        <Input value={activeExam.questionsPerPage} onChange={e => update({ questionsPerPage: e.target.value })} type="number" className="rounded-xl" />
                      </Field>
                    </div>
                    <SectionTitle>Display Options</SectionTitle>
                    <CheckField
                      label="Shuffle Questions"
                      description="Randomize question order for each student"
                      checked={activeExam.shuffleQuestions}
                      onCheckedChange={v => update({ shuffleQuestions: v })}
                    />
                    <CheckField
                      label="Shuffle Options"
                      description="Randomize answer option order"
                      checked={activeExam.shuffleOptions}
                      onCheckedChange={v => update({ shuffleOptions: v })}
                    />
                    <CheckField
                      label="Show Question Numbers"
                      checked={activeExam.showQuestionNumbers}
                      onCheckedChange={v => update({ showQuestionNumbers: v })}
                    />
                  </>
                )}

                {/* ── INSTRUCTION ── */}
                {activeTab === 'instruction' && (
                  <>
                    <SectionTitle>Exam Instructions</SectionTitle>
                    <Field label="Instructions" description="Shown to students before they start the exam">
                      <Textarea
                        value={activeExam.instructions}
                        onChange={e => update({ instructions: e.target.value })}
                        placeholder="Read all questions carefully before answering..."
                        rows={6}
                        className="rounded-xl resize-none"
                      />
                    </Field>
                    <Field label="Terms &amp; Conditions" description="Students must agree to these before starting">
                      <Textarea
                        value={activeExam.termsAndConditions}
                        onChange={e => update({ termsAndConditions: e.target.value })}
                        placeholder="By starting this exam, you agree to..."
                        rows={4}
                        className="rounded-xl resize-none"
                      />
                    </Field>
                  </>
                )}

                {/* ── COMPOSITION ── */}
                {activeTab === 'composition' && (
                  <>
                    <SectionTitle>Attribute Fingerprint</SectionTitle>
                    <Card className="border rounded-2xl">
                      <CardContent className="pt-4 pb-4 space-y-3">
                        {activeExam.attributeSet ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(activeExam.attributeSet).map(([k, v]) => (
                                <Badge key={k} variant="outline" className="text-[10px] font-bold uppercase">
                                  {k}: {v}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => update({ attributeSet: null, selectedQuestionIds: [] })}
                              className="text-destructive hover:bg-destructive/10 rounded-lg text-[10px] font-bold h-7 px-3 uppercase"
                            >
                              <X className="h-3 w-3 mr-1" /> Clear Fingerprint
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground font-medium">
                              Paste an attribute fingerprint copied from the Bulk Upload page to auto-filter matching questions.
                            </p>
                            <Textarea
                              value={attrPasteRaw}
                              onChange={e => { setAttrPasteRaw(e.target.value); setAttrParseError(''); }}
                              placeholder={'{\n  "subject": "Physics",\n  "class": "Class 9 - 10"\n}'}
                              rows={4}
                              className="rounded-xl resize-none text-xs font-mono"
                            />
                            {attrParseError && <p className="text-[10px] text-destructive font-bold">{attrParseError}</p>}
                            <Button
                              onClick={applyAttributeSet}
                              size="sm"
                              className="h-8 px-4 rounded-xl font-bold text-[10px] uppercase gap-2"
                            >
                              <Wand2 className="h-3.5 w-3.5" /> Apply &amp; Filter
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                      <SectionTitle>
                        Question Pool ({filteredQuestions.length} matching
                        {activeExam.attributeSet ? ' fingerprint' : ' — all questions'})
                      </SectionTitle>
                      {filteredQuestions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={allFilteredSelected ? deselectAllFiltered : selectAllFiltered}
                          className="h-7 px-3 rounded-lg text-[10px] font-bold uppercase gap-1.5 mb-4 shrink-0"
                        >
                          <CheckCheck className="h-3 w-3" />
                          {allFilteredSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}
                    </div>

                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                      <Input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search questions..."
                        className="pl-9 h-9 rounded-xl text-xs"
                      />
                    </div>

                    <Card className="border rounded-2xl overflow-hidden">
                      <ScrollArea className="h-64">
                        {filteredQuestions.length === 0 ? (
                          <div className="flex items-center justify-center py-12">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                              No questions match
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredQuestions.map(q => {
                              const isSelected = activeExam.selectedQuestionIds.includes(q.id);
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => toggleQuestionSelection(q.id)}
                                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                                  }`}
                                >
                                  <Checkbox checked={isSelected} className="mt-0.5 shrink-0" onCheckedChange={() => toggleQuestionSelection(q.id)} />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium line-clamp-2 text-left">{q.text || '(No text)'}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {q.subject && <Badge variant="outline" className="text-[8px] h-4 px-1 font-bold">{String(q.subject)}</Badge>}
                                      {q.difficulty && (
                                        <Badge variant="outline" className={`text-[8px] h-4 px-1 font-bold border-none ${
                                          q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                          q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                          'bg-rose-100 text-rose-700'
                                        }`}>{q.difficulty}</Badge>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </Card>

                    <SectionTitle>
                      Selected Questions ({selectedQuestions.length} / {activeExam.totalQuestions} target)
                    </SectionTitle>
                    {selectedQuestions.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground font-medium py-4 text-center">
                        No questions selected yet. Pick from the pool above.
                      </p>
                    ) : (
                      <Card className="border rounded-2xl overflow-hidden">
                        <ScrollArea className="max-h-64">
                          <div className="divide-y">
                            {selectedQuestions.map((q, idx) => (
                              <div key={q.id} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="text-[10px] font-black text-muted-foreground w-5 shrink-0">{idx + 1}.</span>
                                <p className="text-xs font-medium flex-1 truncate">{q.text || '(No text)'}</p>
                                <button
                                  onClick={() => toggleQuestionSelection(q.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
