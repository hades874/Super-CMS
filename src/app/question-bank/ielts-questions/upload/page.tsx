
'use client';
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import type { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Trash2, PlusCircle, X, Image as ImageIcon, Download, GitMerge, CheckCircle, XCircle, FileText, FileUp, Link as LinkIcon, FileSpreadsheet, Bot, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageQuestionGenerator } from '@/components/ImageQuestionGenerator';
import { IeltsFileExtractor } from '@/components/IeltsFileExtractor';
import { fetchGoogleSheetData } from '../../../actions/ielts-actions';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type ParsedQuestion = Omit<Question, 'id' | 'createdAt'>;
type DuplicateQuestionInfo = {
    existingQuestion: Question;
    newQuestionData: ParsedQuestion;
    mergedData: Question;
};

export default function IeltsUploadHub() {
  const { 
    questions: ieltsQuestionsBank, 
    allQuestions, 
    addQuestions: addQuestionsRepo,
    updateMultipleQuestions: updateMultipleQuestionsRepo
  } = useIeltsRepository();
  
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  
  const [newQuestions, setNewQuestions] = useState<ParsedQuestion[]>([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState<DuplicateQuestionInfo[]>([]);
  const [selectedNew, setSelectedNew] = useState<number[]>([]);
  const [selectedDuplicatesForMerge, setSelectedDuplicatesForMerge] = useState<string[]>([]);
  
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPreview = newQuestions.length > 0 || duplicateQuestions.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(e.target.value);
  };

  const processParsedData = (parsed: any[], sheetName?: string) => {
    const existingQuestions = [...allQuestions, ...ieltsQuestionsBank];
    const newItems: ParsedQuestion[] = [];
    const duplicates: DuplicateQuestionInfo[] = [];

    const getField = (row: any, aliases: string[]) => {
      for (const alias of aliases) {
        if (row[alias] !== undefined && row[alias] !== null && row[alias] !== '') return row[alias];
        const lowerAlias = alias.toLowerCase();
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === lowerAlias);
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') return row[foundKey];
      }
      return undefined;
    };

    const normalizePart = (input?: string) => {
      if (!input) return null;
      const lower = input.toLowerCase();
      if (lower.includes('listen')) return 'Listening';
      if (lower.includes('read')) return 'Reading';
      if (lower.includes('writ')) return 'Writing';
      return null;
    };

    parsed.forEach((row) => {
      const text = getField(row, ['text', 'question', 'Question_Content', 'Question Content', 'content', 'Template_ID']);
      if (!text) return;

      const rawSubject = getField(row, ['subject', 'Subject', 'Section']);
      const partFromSubject = normalizePart(String(rawSubject || ''));
      const partFromSheet = normalizePart(sheetName || '');
      const partFromId = normalizePart(String(text).startsWith('L-') ? 'Listening' : String(text).startsWith('R-') ? 'Reading' : String(text).startsWith('W-') ? 'Writing' : '');
      
      const detectedPart = partFromSheet || partFromSubject || partFromId;
      
      const subjectArr: string[] = ['IELTS'];
      if (detectedPart) subjectArr.push(detectedPart);
      if (rawSubject && String(rawSubject) !== detectedPart) subjectArr.push(String(rawSubject));

      const questionData: ParsedQuestion = {
        text: String(text),
        type: getField(row, ['type', 'Question_Type', 'Question Type', 'Format']) || 'ielts',
        subject: subjectArr,
        topic: getField(row, ['topic', 'Topic', 'Tags']),
        difficulty: getField(row, ['difficulty', 'Difficulty']) || 'Medium',
        answer: getField(row, ['answer', 'Answer_Key', 'Answer Key', 'Correct Answer']),
        explanation: getField(row, ['explanation', 'Design_Notes', 'Design Notes', 'Rationale']),
        options: (() => {
          const rawOptions = getField(row, ['options', 'Options', 'Distractors']);
          if (!rawOptions) return undefined;
          if (typeof rawOptions !== 'string') return rawOptions;
          try {
            return JSON.parse(rawOptions);
          } catch (e) {
            return undefined;
          }
        })(),
      };

      const existingMatch = existingQuestions.find(q => q.text?.toLowerCase() === questionData.text?.toLowerCase());
      
      if (existingMatch) {
          const mergedData = { ...existingMatch, ...questionData, id: existingMatch.id };
          // If we already added this as a duplicate in this run, don't add again
          if (!duplicates.some(d => d.existingQuestion.id === existingMatch.id)) {
              duplicates.push({
                existingQuestion: existingMatch,
                newQuestionData: questionData,
                mergedData
              });
          }
      } else {
        // Prevent adding same question multiple times in one parse
        if (!newItems.some(n => n.text?.toLowerCase() === questionData.text?.toLowerCase())) {
            newItems.push(questionData);
        }
      }
    });

    setNewQuestions(prev => [...prev, ...newItems]);
    setDuplicateQuestions(prev => [...prev, ...duplicates]);
    setSelectedNew(prev => {
        const start = prev.length;
        const newIndices = newItems.map((_, i) => start + i);
        return [...prev, ...newIndices];
    });
    toast({ title: sheetName ? `Synced ${sheetName}: ${newItems.length} new items` : `Parsed ${newItems.length} new questions, ${duplicates.length} duplicates found` });
  };

  const handleParse = () => {
    setIsParsing(true);
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicatesForMerge([]);

    const dataSource = file || textData;
    if (!dataSource) {
      toast({ title: "No data provided", variant: "destructive" });
      setIsParsing(false);
      return;
    }

    Papa.parse(file || textData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
        setIsParsing(false);
      },
      error: () => {
        toast({ title: "Parse error", variant: "destructive" });
        setIsParsing(false);
      }
    });
  };

  const handleFetchGoogleSheet = async () => {
    setIsFetchingSheet(true);
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicatesForMerge([]);

    try {
      const sheetResults = await fetchGoogleSheetData(googleSheetUrl);
      
      for (const sheet of sheetResults) {
          Papa.parse(sheet.csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              processParsedData(results.data, sheet.sheetName);
            }
          });
      }
      setIsFetchingSheet(false);
    } catch (error) {
      toast({ title: "Failed to fetch Google Sheet", variant: "destructive" });
      setIsFetchingSheet(false);
    }
  };

  const addImportedQuestions = (questions: Omit<Question, 'id'>[]) => {
    const questionsWithIds = questions.map(q => ({
      ...q,
      id: `ielts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    })) as Question[];
    addQuestionsRepo(questionsWithIds);
    toast({ title: `Added ${questionsWithIds.length} questions to repository` });
  };

  const confirmAddNew = () => {
    const questionsToAdd = selectedNew.map(index => {
      const q = newQuestions[index];
      return {
        ...q,
        id: `ielts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      } as Question;
    });
    
    addQuestionsRepo(questionsToAdd);
    toast({ title: `Added ${questionsToAdd.length} questions to cache` });
    setNewQuestions([]);
    setSelectedNew([]);
  };

  const confirmMergeDuplicates = () => {
    const mergedQuestions = duplicateQuestions
      .filter(d => selectedDuplicatesForMerge.includes(d.existingQuestion.id))
      .map(d => d.mergedData);
    
    if (mergedQuestions.length > 0) {
        updateMultipleQuestionsRepo(mergedQuestions);
        toast({ title: `Merged ${mergedQuestions.length} duplicate questions` });
    }
    
    setDuplicateQuestions([]);
    setSelectedDuplicatesForMerge([]);
  };

  const getPartFromQuestion = (q: ParsedQuestion | Question) => {
    const subjects = Array.isArray(q.subject) ? q.subject : [q.subject];
    const subjectStr = subjects.join(' ').toLowerCase();
    if (subjectStr.includes('listen')) return 'Listening';
    if (subjectStr.includes('read')) return 'Reading';
    if (subjectStr.includes('writ')) return 'Writing';
    return 'Other';
  };

  const groupedNew = {
    Listening: newQuestions.map((q, i) => ({ q, i })).filter(({ q }) => getPartFromQuestion(q) === 'Listening'),
    Reading: newQuestions.map((q, i) => ({ q, i })).filter(({ q }) => getPartFromQuestion(q) === 'Reading'),
    Writing: newQuestions.map((q, i) => ({ q, i })).filter(({ q }) => getPartFromQuestion(q) === 'Writing'),
    Other: newQuestions.map((q, i) => ({ q, i })).filter(({ q }) => getPartFromQuestion(q) === 'Other')
  };

  const groupedDuplicates = {
    Listening: duplicateQuestions.map((d, i) => ({ d, i })).filter(({ d }) => getPartFromQuestion(d.existingQuestion) === 'Listening'),
    Reading: duplicateQuestions.map((d, i) => ({ d, i })).filter(({ d }) => getPartFromQuestion(d.existingQuestion) === 'Reading'),
    Writing: duplicateQuestions.map((d, i) => ({ d, i })).filter(({ d }) => getPartFromQuestion(d.existingQuestion) === 'Writing'),
    Other: duplicateQuestions.map((d, i) => ({ d, i })).filter(({ d }) => getPartFromQuestion(d.existingQuestion) === 'Other')
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/question-bank/ielts-questions">
          <Button variant="ghost" size="icon" className="rounded-xl border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Upload Hub</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sync items to the IELTS repository</p>
        </div>
      </div>

      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/5 pb-6 border-b">
          <CardTitle className="text-lg font-bold">Ingestion Methods</CardTitle>
          <CardDescription className="text-xs">Direct import or AI-assisted extraction.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="bulk" className='w-full'>
            <TabsList className='bg-muted/50 p-1 rounded-xl h-10 w-full max-w-md mx-auto grid grid-cols-4 mb-8'>
              <TabsTrigger value="doc-ai" className="rounded-lg text-[10px] font-black uppercase">DOC AI</TabsTrigger>
              <TabsTrigger value="image" className="rounded-lg text-[10px] font-black uppercase">OCR</TabsTrigger>
              <TabsTrigger value="bulk" className="rounded-lg text-[10px] font-black uppercase">BULK</TabsTrigger>
              <TabsTrigger value="sheet" className="rounded-lg text-[10px] font-black uppercase">SHEET</TabsTrigger>
            </TabsList>

            <TabsContent value="doc-ai" className="py-10 flex flex-col items-center justify-center border rounded-2xl bg-muted/5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base mb-1 uppercase">Document Extraction</h4>
              <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs font-medium uppercase tracking-tight">AI-native parsing for PDF & DOCX</p>
              <IeltsFileExtractor addImportedQuestionsAction={addImportedQuestions}>
                <Button className="rounded-xl h-11 px-8 font-bold text-xs uppercase tracking-widest">
                  <FileUp className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </IeltsFileExtractor>
            </TabsContent>

            <TabsContent value="image" className="py-10 flex flex-col items-center justify-center border rounded-2xl bg-muted/5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base mb-1 uppercase">Visual OCR</h4>
              <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs font-medium uppercase tracking-tight">Convert scans to digital items</p>
              <ImageQuestionGenerator addImportedQuestionsAction={addImportedQuestions}>
                <Button className="rounded-xl h-11 px-8 font-bold text-xs uppercase tracking-widest">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </ImageQuestionGenerator>
            </TabsContent>

            <TabsContent value="bulk" className="py-2">
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                  <Tabs defaultValue="paste" className='w-full'>
                    <TabsList className='grid grid-cols-2 bg-muted/30 rounded-lg p-0.5 h-8 w-fit mx-auto'>
                      <TabsTrigger value="paste" className="text-[10px] font-black uppercase px-4">Paste Data</TabsTrigger>
                      <TabsTrigger value="file" className="text-[10px] font-black uppercase px-4">CSV Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="paste" className="pt-4">
                      <Textarea placeholder='Paste CSV data...' className='h-40 font-mono text-xs bg-muted/5 rounded-xl' value={textData} onChange={handleTextChange}/>
                    </TabsContent>
                    <TabsContent value="file" className="pt-4">
                      <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/5 group hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-8 w-8 text-muted-foreground/30 mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-xs font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Drop CSV File</p>
                        <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="lg:col-span-4 flex flex-col justify-between p-6 bg-muted/10 rounded-2xl border">
                  <div className="space-y-4">
                    <h5 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                       <Bot className="h-4 w-4 text-primary" /> Validation Engine
                    </h5>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">System will sanitize, verify strings, and bridge data to IELTS schema.</p>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Button onClick={handleParse} disabled={(!file && !textData) || isParsing} className="w-full h-11 rounded-xl font-bold text-xs uppercase tracking-widest">
                      {isParsing ? 'Processing AI...' : 'Run Pipeline'}
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase opacity-60" asChild>
                       <a href="/ielts-upload-template.csv" download>Download Schema</a>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sheet" className="py-10 flex flex-col items-center justify-center border rounded-2xl bg-emerald-500/5">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base mb-1 uppercase">Cloud Sync</h4>
              <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs font-medium uppercase tracking-tight">Sync directly from Google Sheets</p>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Sheet URL..." 
                    className="pl-9 h-11 rounded-xl text-xs" 
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleFetchGoogleSheet} 
                  disabled={!googleSheetUrl || isFetchingSheet}
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase"
                >
                  {isFetchingSheet ? 'Syncing' : 'Fetch'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {hasPreview && (
        <Card className="border-none shadow-2xl animate-in slide-in-from-right-4 duration-500 overflow-hidden ring-4 ring-primary/5">
          <CardHeader className="bg-primary p-6 text-primary-foreground border-b border-primary/10">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl font-black italic">
                  PRE-FLIGHT VERIFICATION
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 font-medium">
                  Audit results: {newQuestions.length} unique items, {duplicateQuestions.length} overlaps.
                </CardDescription>
              </div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 h-8 font-black">AI ANALYZED</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-12">
            {newQuestions.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-dashed">
                  <div className="space-y-1">
                    <h3 className="font-black text-lg">New Questions Pipeline</h3>
                    <div className="flex items-center gap-2">
                        <Checkbox 
                            id="select-all-new"
                            checked={selectedNew.length === newQuestions.length && newQuestions.length > 0}
                            onCheckedChange={(checked) => {
                                if (checked) setSelectedNew(newQuestions.map((_, i) => i));
                                else setSelectedNew([]);
                            }}
                        />
                        <label htmlFor="select-all-new" className="text-sm font-bold cursor-pointer">SELECT ALL NEW ({selectedNew.length}/{newQuestions.length})</label>
                    </div>
                  </div>
                  <Button onClick={confirmAddNew} disabled={selectedNew.length === 0} className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Commit New to Cache
                  </Button>
                </div>

                <div className="grid gap-8">
                  {(['Listening', 'Reading', 'Writing', 'Other'] as const).map(partName => {
                    const items = groupedNew[partName];
                    if (items.length === 0) return null;
                    return (
                        <div key={partName} className="space-y-4">
                            <div className="flex items-center gap-2 border-l-4 border-primary pl-3 py-1">
                                <h4 className="font-black text-sm uppercase tracking-wider">{partName}</h4>
                                <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                            </div>
                            <div className="grid gap-2">
                                {items.map(({ q, i }) => (
                                    <div key={i} className="flex items-start gap-3 p-4 border rounded-xl bg-card hover:border-primary/30 transition-colors group">
                                        <Checkbox 
                                            checked={selectedNew.includes(i)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedNew([...selectedNew, i]);
                                                else setSelectedNew(selectedNew.filter(idx => idx !== i));
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-bold line-clamp-2">{q.text}</p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[9px] py-0">{q.type}</Badge>
                                                <Badge variant="outline" className="text-[9px] py-0">{q.difficulty}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            )}

            {duplicateQuestions.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-500/5 p-4 rounded-2xl border border-dashed border-amber-500/30">
                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-amber-600">Overlap Management</h3>
                    <div className="flex items-center gap-2">
                        <Checkbox 
                            id="select-all-duplicates"
                            checked={selectedDuplicatesForMerge.length === duplicateQuestions.length && duplicateQuestions.length > 0}
                            onCheckedChange={(checked) => {
                                if (checked) setSelectedDuplicatesForMerge(duplicateQuestions.map(d => d.existingQuestion.id));
                                else setSelectedDuplicatesForMerge([]);
                            }}
                        />
                        <label htmlFor="select-all-duplicates" className="text-sm font-bold cursor-pointer text-amber-700">SELECT ALL OVERLAPS ({selectedDuplicatesForMerge.length}/{duplicateQuestions.length})</label>
                    </div>
                  </div>
                  <Button onClick={confirmMergeDuplicates} disabled={selectedDuplicatesForMerge.length === 0} variant="outline" className="rounded-xl h-12 px-6 font-bold border-amber-500/50 text-amber-700 hover:bg-amber-500/10">
                    <GitMerge className="mr-2 h-5 w-5" />
                    Apply Merged Data
                  </Button>
                </div>

                <div className="grid gap-8">
                  {(['Listening', 'Reading', 'Writing', 'Other'] as const).map(partName => {
                    const items = groupedDuplicates[partName];
                    if (items.length === 0) return null;
                    return (
                        <div key={partName} className="space-y-4">
                            <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3 py-1">
                                <h4 className="font-black text-sm uppercase tracking-wider text-amber-700">{partName}</h4>
                                <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700">{items.length}</Badge>
                            </div>
                            <div className="grid gap-2">
                                {items.map(({ d, i }) => (
                                    <div key={i} className="flex items-start gap-4 p-4 border rounded-xl bg-amber-50/30 hover:border-amber-500/30 transition-colors">
                                        <Checkbox 
                                            checked={selectedDuplicatesForMerge.includes(d.existingQuestion.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedDuplicatesForMerge([...selectedDuplicatesForMerge, d.existingQuestion.id]);
                                                else setSelectedDuplicatesForMerge(selectedDuplicatesForMerge.filter(id => id !== d.existingQuestion.id));
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-amber-500 text-white text-[9px] h-4">DUPLICATE DETECTED</Badge>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">ID: {d.existingQuestion.id}</p>
                                            </div>
                                            <p className="text-sm font-bold leading-tight">{d.existingQuestion.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
