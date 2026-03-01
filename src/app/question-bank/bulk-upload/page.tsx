
'use client';

import { useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { decodeAttributes } from '@/data/attribute-mapping';
import { CheckCircle, XCircle, PlusCircle, GitMerge, Download, Upload, Database, Layers, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import useLocalStorage from '@/hooks/useLocalStorage';
import { mockQuestions } from '@/data/mock-questions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ParsedQuestion = Omit<Question, 'id' | 'createdAt'>;
type DuplicateQuestionInfo = {
    existingQuestion: Question;
    newQuestionData: ParsedQuestion;
    mergedData: Question;
};

const mergeAttribute = (val1: any, val2: any): string[] => {
    const arr1 = Array.isArray(val1) ? val1 : (val1 ? [String(val1)] : []);
    const arr2 = Array.isArray(val2) ? val2 : (val2 ? [String(val2)] : []);
    return [...new Set([...arr1, ...arr2])].filter(v => v);
};

export default function BulkUploadPage() {
  const [allQuestions, setAllQuestions] = useLocalStorage<Question[]>('allQuestions', mockQuestions);
  
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualBoardType, setManualBoardType] = useState('');
  const [manualBoardName, setManualBoardName] = useState('');
  const [manualVertical, setManualVertical] = useState<string>('');

  const [newQuestions, setNewQuestions] = useState<ParsedQuestion[]>([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState<DuplicateQuestionInfo[]>([]);
  const [selectedNew, setSelectedNew] = useState<number[]>([]);
  const [selectedDuplicatesForMerge, setSelectedDuplicatesForMerge] = useState<string[]>([]);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setTextData('');
      setNewQuestions([]);
      setDuplicateQuestions([]);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(event.target.value);
    setFile(null);
    setNewQuestions([]);
    setDuplicateQuestions([]);
  };

  const resetState = () => {
    setFile(null);
    setTextData('');
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicatesForMerge([]);
    setManualTopic('');
    setManualBoardName('');
    setManualBoardType('');
    setManualVertical('');
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const parseData = (data: File | string) => {
    setIsParsing(true);
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicatesForMerge([]);

    const existingQuestionMap = new Map(allQuestions.filter(q => q.text).map(q => [q.text!.trim().toLowerCase(), q]));

    Papa.parse(data as any, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedNew: ParsedQuestion[] = [];
          const parsedDuplicates: DuplicateQuestionInfo[] = [];
          const isFillBlanksFormat = results.meta.fields?.includes('meta:type');

          results.data.forEach((row: any) => {
            let questionText: string;
            let newQuestionData: ParsedQuestion;

            if (isFillBlanksFormat) {
                questionText = (row['q:text'] || 'No text provided').trim();
                if (questionText === 'No text provided' || !questionText) return;
                const answer = row['q:answer'];
                const gapPlaceholder = /\{\{([^}]+)\}\}/.exec(questionText);
                newQuestionData = {
                  text: questionText,
                  type: 'FILL_BLANKS',
                  answer: answer,
                  blanks: gapPlaceholder ? [{ id: gapPlaceholder[1], correctAnswer: answer, order: 1 }] : [],
                  difficulty: 'Medium',
                  topic: manualTopic || 'Fill in the Blanks',
                }
            } else {
                questionText = (row.title || 'No title provided').trim();
                if (questionText === 'No title provided' || !questionText) return;
                const decodedAttrs = decodeAttributes(row);
                const options: { text: string; isCorrect: boolean }[] = [];
                for (let i = 1; i <= 4; i++) {
                    if (row[`options_${i}_answer`]) {
                        options.push({
                            text: row[`options_${i}_answer`],
                            isCorrect: row[`options_${i}_is_correct`] === '1' || String(row[`options_${i}_is_correct`]).toLowerCase() === 'true',
                        });
                    }
                }
                newQuestionData = {
                    text: questionText,
                    type: row.type || 'm1',
                    image: row.image,
                    options,
                    answer: options.find(o => o.isCorrect)?.text,
                    subject: decodedAttrs.subject || 'Misc',
                    topic: manualTopic || decodedAttrs.topics || 'Misc',
                    class: decodedAttrs.class || 'Misc',
                    difficulty: (decodedAttrs.difficulty as Question['difficulty']) || 'Medium',
                    vertical: manualVertical || decodedAttrs.vertical,
                    program: decodedAttrs.program,
                    paper: decodedAttrs.paper,
                    chapter: decodedAttrs.chapter,
                    exam_set: decodedAttrs.exam_set,
                    board: manualBoardType && manualBoardName ? `${manualBoardType}: ${manualBoardName}` : decodedAttrs.board,
                    explanation: row.explanation,
                    category: decodedAttrs.category,
                    modules: decodedAttrs.modules,
                    group_type: decodedAttrs.group_type,
                    marks: row.marks ? parseInt(row.marks) : 1,
                };
            }

            const existingQuestion = existingQuestionMap.get(questionText.toLowerCase());
            if (existingQuestion) {
                const mergedData: Question = {
                    ...existingQuestion,
                    subject: mergeAttribute(existingQuestion.subject, newQuestionData.subject),
                    topic: mergeAttribute(existingQuestion.topic, newQuestionData.topic),
                    class: mergeAttribute(existingQuestion.class, newQuestionData.class),
                    vertical: mergeAttribute(existingQuestion.vertical, newQuestionData.vertical),
                    program: mergeAttribute(existingQuestion.program, newQuestionData.program),
                    paper: mergeAttribute(existingQuestion.paper, newQuestionData.paper),
                    chapter: mergeAttribute(existingQuestion.chapter, newQuestionData.chapter),
                    exam_set: mergeAttribute(existingQuestion.exam_set, newQuestionData.exam_set),
                    board: mergeAttribute(existingQuestion.board, newQuestionData.board),
                    category: mergeAttribute(existingQuestion.category, newQuestionData.category),
                    modules: mergeAttribute(existingQuestion.modules, newQuestionData.modules),
                    difficulty: newQuestionData.difficulty || existingQuestion.difficulty,
                    explanation: newQuestionData.explanation || existingQuestion.explanation,
                    marks: newQuestionData.marks || existingQuestion.marks,
                    options: (newQuestionData.options && newQuestionData.options.length > 0) ? newQuestionData.options : existingQuestion.options,
                    type: newQuestionData.type || existingQuestion.type,
                    image: newQuestionData.image || existingQuestion.image,
                    answer: newQuestionData.answer || existingQuestion.answer,
                    group_type: newQuestionData.group_type || existingQuestion.group_type,
                };
                parsedDuplicates.push({ existingQuestion, newQuestionData, mergedData });
            } else {
               if (!parsedNew.some(nq => nq.text!.toLowerCase() === newQuestionData.text!.toLowerCase())) {
                  parsedNew.push(newQuestionData);
               }
            }
          });

          setNewQuestions(parsedNew);
          setDuplicateQuestions(parsedDuplicates);
          setSelectedNew(parsedNew.map((_, index) => index));
          setSelectedDuplicatesForMerge(parsedDuplicates.map(d => d.existingQuestion.id));

          toast({ title: 'System Analysis Complete', description: `Parsed ${parsedNew.length} new signals and ${parsedDuplicates.length} overlaps.` });
        } catch (error) {
           toast({ variant: 'destructive', title: 'Data Corruption Detected', description: `Schema mismatch or parsing error. ${error instanceof Error ? error.message : ''}` });
        } finally {
          setIsParsing(false);
        }
      },
      error: (error) => {
        toast({ variant: 'destructive', title: 'Ingestion Failed', description: error.message });
        setIsParsing(false);
      }
    });
  }

  const handleParse = () => {
    if (textData) parseData(textData);
    else if (file) parseData(file);
    else toast({ variant: 'destructive', title: 'Vacuum Input', description: 'Please provide a content stream.' });
  };

  const handleImportToBank = () => {
    const questionsToAdd: Question[] = selectedNew.map(index => ({
      ...newQuestions[index],
      id: `q${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    }));
    const questionsToUpdate = selectedDuplicatesForMerge
        .map(id => duplicateQuestions.find(d => d.existingQuestion.id === id)?.mergedData)
        .filter((q): q is Question => !!q);
    
    if (questionsToAdd.length === 0 && questionsToUpdate.length === 0) {
        toast({ variant: 'destructive', title: 'Empty Selection', description: 'No assets selected for core synchronization.' });
        return;
    }
    setAllQuestions(prev => {
        const updatedMap = new Map(prev.map(q => [q.id, q]));
        questionsToUpdate.forEach(q => updatedMap.set(q.id, q));
        return [...updatedMap.values(), ...questionsToAdd];
    });
    toast({ title: 'Synchronization Finished', description: `Added ${questionsToAdd.length} new records and updated ${questionsToUpdate.length} legacy assets.` });
    resetState();
  };

  const toggleSelectNew = (index: number) => setSelectedNew(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  const toggleSelectAllNew = () => {
      if (selectedNew.length === newQuestions.length) setSelectedNew([]);
      else setSelectedNew(newQuestions.map((_, index) => index));
  }
  const toggleSelectDuplicateForMerge = (id: string) => setSelectedDuplicatesForMerge(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAllDuplicatesForMerge = () => {
      if (selectedDuplicatesForMerge.length === duplicateQuestions.length) setSelectedDuplicatesForMerge([]);
      else setSelectedDuplicatesForMerge(duplicateQuestions.map(q => q.existingQuestion.id));
  }

  const hasPreview = newQuestions.length > 0 || duplicateQuestions.length > 0;
  const totalSelectedForBank = selectedNew.length + selectedDuplicatesForMerge.length;

  const AttributeBadge = ({label, value}: {label: string, value: any}) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const values = Array.isArray(value) ? value : [value];
    return (
      <div className="flex flex-wrap gap-1">
        {values.map((val, i) => (
          <Badge key={i} variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-muted/50 border-muted-foreground/10">{val}</Badge>
        ))}
      </div>
    )
  }

  const AttributeDiff = ({ label, oldVal, newVal }: { label: string, oldVal: any, newVal: any }) => {
    const oldArr = useMemo(() => Array.isArray(oldVal) ? oldVal.filter(Boolean) : (oldVal ? [String(oldVal)] : []), [oldVal]);
    const newArr = useMemo(() => Array.isArray(newVal) ? newVal.filter(Boolean) : (newVal ? [String(newVal)] : []), [newVal]);
    const allValues = [...new Set([...oldArr, ...newArr])];
    if (allValues.length <= 1 && oldArr.join(',') === newArr.join(',')) return null;
    return (
        <div className="flex flex-col items-start gap-1 text-[10px] p-2 border rounded-xl bg-muted/10 w-full group">
            <span className="font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
            <div className="flex flex-col gap-1 w-full">
              {oldArr.length > 0 && <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /><span className="text-muted-foreground line-clamp-1">{oldArr.join(', ')}</span></div>}
              {newArr.filter(v => !oldArr.includes(v)).map((val, i) => <div key={i} className="flex items-center gap-2 text-emerald-600 font-bold"><PlusCircle className="h-2 w-2" /><span className="line-clamp-1">{val}</span></div>)}
            </div>
        </div>
    );
  };

  const OptionsList = ({ options }: { options?: { text?: string; isCorrect: boolean }[] }) => {
    if (!options || options.length === 0) return null;
    return (
      <ul className="mt-2 space-y-1">
        {options.map((opt, index) => (
          <li key={index} className="flex items-start text-xs">
            {opt.isCorrect ? <CheckCircle className="h-3 w-3 mr-2 text-emerald-500 mt-0.5" /> : <XCircle className="h-3 w-3 mr-2 text-rose-500 mt-0.5" />}
            <span className={cn(opt.isCorrect ? "text-emerald-700 font-bold" : "text-muted-foreground")}>{opt.text}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className='flex-1 flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full'>
      <div className="flex items-center gap-4">
        <Link href="/question-bank/mcq-questions">
           <Button variant="ghost" size="icon" className="rounded-xl border h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
           </Button>
        </Link>
        <div>
           <h1 className="text-2xl font-bold tracking-tight uppercase">Bulk Upload Hub</h1>
           <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mass ingestion pipeline for question assets</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card className="border shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/5 border-b py-4">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ingestion Strategy</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Manual Meta Injection</Label>
                    <Input 
                        placeholder="Global Topic (Optional)" 
                        className="h-10 rounded-lg text-xs font-bold" 
                        value={manualTopic}
                        onChange={(e) => setManualTopic(e.target.value)}
                    />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Vertical Categorization</Label>
                    <Select value={manualVertical} onValueChange={setManualVertical}>
                         <SelectTrigger className="h-10 rounded-lg text-xs font-bold uppercase"><SelectValue placeholder="Select Vertical" /></SelectTrigger>
                         <SelectContent>
                             {['K12', 'Higher Education', 'Professional', 'Competitive Exams'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                         </SelectContent>
                    </Select>
                 </div>
                 <div className="pt-2">
                    <Button 
                        disabled={(!file && !textData) || isParsing} 
                        onClick={() => parseData(file || textData)}
                        className="w-full h-11 rounded-xl shadow-sm font-black text-xs uppercase tracking-widest gap-2"
                    >
                        {isParsing ? "Analyzing Stream..." : "Initiate Parse"}
                        <Database className="h-3.5 w-3.5" />
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <div className="p-5 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
              <div className="flex items-start gap-3">
                 <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Schema Blueprint</p>
                    <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/80">Support for CSV/JSON formats with specific header mapping for text, options, and metadata.</p>
                 </div>
              </div>
           </div>
        </div>
        <div className="lg:col-span-2">
           <Card className="border shadow-sm rounded-2xl overflow-hidden h-full flex flex-col">
              <Tabs defaultValue="file" className="flex-1 flex flex-col">
                 <CardHeader className="bg-muted/5 border-b pb-0">
                    <TabsList className="bg-transparent h-12 gap-6 p-0">
                       <TabsTrigger value="file" className="h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 text-[10px] font-black uppercase tracking-widest shadow-none">File Stream</TabsTrigger>
                       <TabsTrigger value="text" className="h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 text-[10px] font-black uppercase tracking-widest shadow-none">Raw Segment</TabsTrigger>
                    </TabsList>
                 </CardHeader>
                 <CardContent className="p-6 flex-1">
                    <TabsContent value="file" className="m-0 h-full">
                       <div 
                          className={cn(
                             "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 px-6 transition-all h-full bg-muted/5",
                             file ? "border-primary/40 bg-primary/[0.02]" : "border-muted-foreground/20"
                          )}
                       >
                          <Upload className={cn("h-10 w-10 mb-4 transition-colors", file ? "text-primary" : "text-muted-foreground/40")} />
                          <div className="text-center space-y-2">
                             <p className="text-sm font-bold">{file ? file.name : "No payload detected."}</p>
                             <p className="text-xs text-muted-foreground font-medium">{file ? `${(file.size / 1024).toFixed(4)} KB` : "Drag/Drop or browse system files."}</p>
                          </div>
                          <Input 
                            type="file" 
                            className="hidden" 
                            id="file-upload" 
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                          <Button variant="outline" className="mt-6 rounded-lg h-9 px-6 font-bold text-[10px] uppercase tracking-widest" asChild>
                             <label htmlFor="file-upload" className="cursor-pointer">Browse Explorer</label>
                          </Button>
                       </div>
                    </TabsContent>
                    <TabsContent value="text" className="m-0 h-full">
                       <Textarea 
                          placeholder="Paste data stream here..." 
                          className="min-h-[300px] h-full rounded-xl bg-muted/5 border-muted-foreground/20 font-mono text-xs p-4 focus-visible:ring-primary/20"
                          value={textData}
                          onChange={handleTextChange}
                       />
                    </TabsContent>
                 </CardContent>
              </Tabs>
           </Card>
        </div>
      </div>

      {hasPreview && (
        <Card className="border shadow-lg rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <CardHeader className="bg-foreground text-background py-6 px-8 flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-xl font-bold uppercase tracking-tight">Intelligence Report</CardTitle>
                 <CardDescription className="text-background/60 font-medium">Found {newQuestions.length} unique nodes and {duplicateQuestions.length} convergence points.</CardDescription>
              </div>
              <div className="flex gap-3">
                 <Button disabled={totalSelectedForBank === 0} onClick={() => {
                    const selectedNewQuestions = newQuestions.filter((_, i) => selectedNew.includes(i));
                    const questionsToMerge = duplicateQuestions.filter(d => selectedDuplicatesForMerge.includes(d.existingQuestion.id)).map(d => d.mergedData);
                    const allToAdd = [...selectedNewQuestions, ...questionsToMerge];
                    
                    const questionsToAdd = allToAdd.map(q => ({
                        ...q,
                        id: `q${Date.now()}-${Math.random()}`,
                        createdAt: new Date().toISOString(),
                    }));
                    
                    setAllQuestions(prev => [...prev, ...questionsToAdd]);
                    toast({ title: "Repository Synchronized", description: `${questionsToAdd.length} assets integrated.` });
                    resetState();
                 }} className="h-10 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Commit {totalSelectedForBank} Assets
                 </Button>
                 <Button variant="ghost" onClick={resetState} className="h-10 px-4 text-background/60 hover:text-background font-bold text-xs uppercase">Abort</Button>
              </div>
           </CardHeader>
           
           <div className="p-0">
              <ScrollArea className="h-[500px]">
                 {newQuestions.length > 0 && (
                    <div className="p-8 border-b">
                       <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                             New Signal Stream <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => {
                             if (selectedNew.length === newQuestions.length) setSelectedNew([]);
                             else setSelectedNew(newQuestions.map((_, i) => i));
                          }} className="text-[10px] uppercase font-bold h-8 border border-muted-foreground/10 rounded-lg">
                             {selectedNew.length === newQuestions.length ? 'Reset All' : 'Select All New'}
                          </Button>
                       </div>
                       <div className="grid md:grid-cols-2 gap-4">
                          {newQuestions.map((q, i) => (
                             <Card 
                                key={i} 
                                className={cn(
                                   "p-4 rounded-xl border transition-all cursor-pointer",
                                   selectedNew.includes(i) ? "border-primary bg-primary/[0.02] ring-1 ring-primary/20" : "hover:border-primary/20"
                                )}
                                onClick={() => {
                                   if (selectedNew.includes(i)) setSelectedNew(prev => prev.filter(idx => idx !== i));
                                   else setSelectedNew(prev => [...prev, i]);
                                }}
                             >
                                <div className="flex gap-4">
                                   <Checkbox checked={selectedNew.includes(i)} />
                                   <div className="flex-1 space-y-3">
                                      <p className="text-sm font-medium leading-relaxed italic">{q.text}</p>
                                      <OptionsList options={q.options} />
                                      <div className="flex flex-wrap gap-1 pt-3 border-t">
                                         <AttributeBadge label="SUB" value={q.subject} />
                                         <AttributeBadge label="TOP" value={q.topic} />
                                         <AttributeBadge label="LVL" value={q.difficulty} />
                                      </div>
                                   </div>
                                </div>
                             </Card>
                          ))}
                       </div>
                    </div>
                 )}

                 {duplicateQuestions.length > 0 && (
                    <div className="p-8 bg-muted/5">
                       <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                             Convergence Points <div className="h-2 w-2 rounded-full bg-amber-500" />
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => {
                             if (selectedDuplicatesForMerge.length === duplicateQuestions.length) setSelectedDuplicatesForMerge([]);
                             else setSelectedDuplicatesForMerge(duplicateQuestions.map(d => d.existingQuestion.id));
                          }} className="text-[10px] uppercase font-bold h-8 border border-amber-200 text-amber-600 rounded-lg">
                             {selectedDuplicatesForMerge.length === duplicateQuestions.length ? 'Reset All' : 'Select Overrides'}
                          </Button>
                       </div>
                       <div className="space-y-4">
                          {duplicateQuestions.map(d => (
                             <Card 
                                key={d.existingQuestion.id} 
                                className={cn(
                                   "p-5 rounded-xl border transition-all cursor-pointer opacity-90 hover:opacity-100",
                                   selectedDuplicatesForMerge.includes(d.existingQuestion.id) ? "border-amber-400 bg-amber-50/20 shadow-sm" : "hover:border-amber-200"
                                )}
                                onClick={() => {
                                   if (selectedDuplicatesForMerge.includes(d.existingQuestion.id)) setSelectedDuplicatesForMerge(prev => prev.filter(id => id !== d.existingQuestion.id));
                                   else setSelectedDuplicatesForMerge(prev => [...prev, d.existingQuestion.id]);
                                }}
                             >
                                <div className="flex gap-4">
                                   <Checkbox checked={selectedDuplicatesForMerge.includes(d.existingQuestion.id)} />
                                   <div className="flex-1">
                                      <div className="flex items-center justify-between mb-3">
                                         <Badge variant="outline" className="text-[8px] font-black uppercase">Asset ID: {d.existingQuestion.id.slice(0,8)}</Badge>
                                         <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase">
                                            <GitMerge className="h-3 w-3" /> Potential Integration
                                         </div>
                                      </div>
                                      <p className="text-sm font-medium opacity-60 mb-4 italic leading-relaxed">{d.existingQuestion.text}</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                         <AttributeDiff label="Subject" oldVal={d.existingQuestion.subject} newVal={d.newQuestionData.subject} />
                                         <AttributeDiff label="Topic" oldVal={d.existingQuestion.topic} newVal={d.newQuestionData.topic} />
                                         <AttributeDiff label="Vertical" oldVal={d.existingQuestion.vertical} newVal={d.newQuestionData.vertical} />
                                         <AttributeDiff label="Board" oldVal={d.existingQuestion.board} newVal={d.newQuestionData.board} />
                                      </div>
                                   </div>
                                </div>
                             </Card>
                          ))}
                       </div>
                    </div>
                 )}
              </ScrollArea>
           </div>
           
           <CardFooter className="bg-muted/30 p-8 border-t flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex gap-8">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Selected Payload</span>
                    <span className="text-3xl font-black text-primary">{totalSelectedForBank}</span>
                 </div>
                 <Separator orientation="vertical" className="h-10 my-auto" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Transaction Target</span>
                    <span className="text-3xl font-black text-foreground">REPOSITORY</span>
                 </div>
              </div>
              <Button onClick={() => {
                 const selectedNewQuestions = newQuestions.filter((_, i) => selectedNew.includes(i));
                 const questionsToMerge = duplicateQuestions.filter(d => selectedDuplicatesForMerge.includes(d.existingQuestion.id)).map(d => d.mergedData);
                 const allToAdd = [...selectedNewQuestions, ...questionsToMerge];
                 
                 const questionsToAdd = allToAdd.map(q => ({
                     ...q,
                     id: `q${Date.now()}-${Math.random()}`,
                     createdAt: new Date().toISOString(),
                 }));
                 
                 setAllQuestions(prev => [...prev, ...questionsToAdd]);
                 toast({ title: "Repository Synchronized", description: `${questionsToAdd.length} assets integrated.` });
                 resetState();
              }} disabled={totalSelectedForBank === 0} className="h-16 px-12 rounded-2xl shadow-xl shadow-primary/20 text-lg font-black tracking-widest gap-3 uppercase group">
                 <Database className="h-5 w-5" /> Sync Repository
                 <ArrowRight className="h-5 w-5 translate-x-0 group-hover:translate-x-1 transition-transform" />
              </Button>
           </CardFooter>
        </Card>
      )}
    </div>
  );
}
