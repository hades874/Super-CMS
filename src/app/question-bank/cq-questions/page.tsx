
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import type { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot, Upload, Trash2, PlusCircle, Filter, X, Image as ImageIcon, MoreHorizontal, Edit, Eye, Copy, Download, GitMerge, CheckCircle } from 'lucide-react';
import { AiQuestionSuggester } from '@/components/AiQuestionSuggester';
import { Button } from '@/components/ui/button';
import { ImageQuestionGenerator } from '@/components/ImageQuestionGenerator';
import { QuestionDetailsDialog } from '@/components/QuestionDetailsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { EditQuestionDialog } from '@/components/EditQuestionDialog';
import useLocalStorage from '@/hooks/useLocalStorage';
import { mockQuestions } from '@/data/mock-questions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

type ParsedQuestion = Omit<Question, 'id' | 'createdAt'>;
type DuplicateQuestionInfo = {
    existingQuestion: Question;
    newQuestionData: ParsedQuestion;
    mergedData: Question;
};

// Helper function to merge attributes. It ensures values are arrays and unique.
const mergeAttribute = (val1: any, val2: any): string[] => {
    const arr1 = Array.isArray(val1) ? val1 : (val1 ? [String(val1)] : []);
    const arr2 = Array.isArray(val2) ? val2 : (val2 ? [String(val2)] : []);
    return [...new Set([...arr1, ...arr2])].filter(v => v); // Filter out empty/null values
};


const AttributeBadge = ({ value, className }: { value: string | string[] | undefined, className?: string }) => {
  if (!value) return null;
  const values = Array.isArray(value) ? value : [value];
  return (
    <div className='flex flex-wrap gap-1'>
      {values.map((val, index) => (
        <Badge key={index} variant="outline" className={className}>{val}</Badge>
      ))}
    </div>
  );
};


export default function CqQuestionsPage() {
  const [allQuestions, setAllQuestions] = useLocalStorage<Question[]>('allQuestions', mockQuestions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  
  const [newQuestions, setNewQuestions] = useState<ParsedQuestion[]>([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState<DuplicateQuestionInfo[]>([]);
  const [selectedNew, setSelectedNew] = useState<number[]>([]);
  const [selectedDuplicatesForMerge, setSelectedDuplicatesForMerge] = useState<string[]>([]);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [questionsToDelete, setQuestionsToDelete] = useState<string[]>([]);
  const [selectedTableQuestions, setSelectedTableQuestions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedQuestions = useMemo(() => {
    return [...allQuestions].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [allQuestions]);

  const cqQuestions = useMemo(() => {
    return sortedQuestions.filter(q => q.type === 'cq');
  }, [sortedQuestions]);

  const filteredQuestions = useMemo(() => {
    return cqQuestions.filter(q =>
      (
        (q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.topic && (Array.isArray(q.topic) ? q.topic.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) : q.topic.toLowerCase().includes(searchTerm.toLowerCase())))
      ) &&
      (!difficulty || q.difficulty === difficulty)
    );
  }, [cqQuestions, searchTerm, difficulty]);

    const resetState = () => {
    setFile(null);
    setTextData('');
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicatesForMerge([]);
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

   const parseData = (data: File | string) => {
    setIsParsing(true);
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicatesForMerge([]);

    const existingQuestionMap = new Map(allQuestions.filter(q => q.text && q.type === 'cq').map(q => [q.text!.trim().toLowerCase(), q]));

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedNew: ParsedQuestion[] = [];
          const parsedDuplicates: DuplicateQuestionInfo[] = [];

          results.data.forEach((row: any) => {
            const questionText = (row.para || 'No paragraph provided').trim();
            if (questionText === 'No paragraph provided' || !questionText) return;

            const options: { text: string; isCorrect: boolean }[] = [];
             for (let i = 1; i <= 4; i++) {
                const opKey = `op${i}`;
                if (row[opKey]) {
                    options.push({ text: row[opKey], isCorrect: false }); // isCorrect is always false for CQ sub-questions
                }
            }
            
            const newQuestionData: ParsedQuestion = {
              text: questionText,
              type: 'cq',
              options,
              subject: 'Creative Question',
              topic: row.topic || questionText.substring(0, 30),
              difficulty: (row.difficulty as Question['difficulty']) || 'Medium',
            };

            const existingQuestion = existingQuestionMap.get(questionText.toLowerCase());

            if (existingQuestion) {
                 const mergedData: Question = {
                    ...existingQuestion,
                    subject: mergeAttribute(existingQuestion.subject, newQuestionData.subject),
                    topic: mergeAttribute(existingQuestion.topic, newQuestionData.topic),
                    options: (newQuestionData.options && newQuestionData.options.length > 0) ? newQuestionData.options : existingQuestion.options,
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
          setSelectedNew(parsedNew.map((_, index) => index)); // Select all new by default
          setSelectedDuplicatesForMerge(parsedDuplicates.map(d => d.existingQuestion.id)); // Select all duplicates to be merged by default

          toast({
            title: 'Preview ready',
            description: `Found ${parsedNew.length} new questions and ${parsedDuplicates.length} potential duplicates.`,
          });
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Parsing error',
            description: `An error occurred during parsing. Check the data format. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        } finally {
          setIsParsing(false);
        }
      },
      error: (error) => {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message,
          });
        setIsParsing(false);
      }
    });
  }

  const handleParse = () => {
    if (textData) {
      parseData(textData);
    } else if (file) {
      parseData(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'No data selected',
        description: 'Please paste CSV data or select a file to parse.',
      });
    }
  };

  const handleImportToBank = () => {
    const questionsToAdd: Question[] = selectedNew.map(index => ({
      ...newQuestions[index],
      id: `cq-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    }));
    
    const questionsToUpdate = selectedDuplicatesForMerge
        .map(id => duplicateQuestions.find(d => d.existingQuestion.id === id)?.mergedData)
        .filter((q): q is Question => !!q);
    
    if (questionsToAdd.length === 0 && questionsToUpdate.length === 0) {
        toast({ variant: 'destructive', title: 'No questions selected for import.'});
        return;
    }

    setAllQuestions(prev => {
        const updatedMap = new Map(prev.map(q => [q.id, q]));
        questionsToUpdate.forEach(q => updatedMap.set(q.id, q));
        return [...updatedMap.values(), ...questionsToAdd];
    });

    toast({ title: `${questionsToAdd.length} new CQ questions added and ${questionsToUpdate.length} questions updated.`});

    resetState();
  };

  const toggleSelectNew = (index: number) => {
      setSelectedNew(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  }
  const toggleSelectAllNew = () => {
      if (selectedNew.length === newQuestions.length) setSelectedNew([]);
      else setSelectedNew(newQuestions.map((_, index) => index));
  }
  const toggleSelectDuplicateForMerge = (id: string) => {
      setSelectedDuplicatesForMerge(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }
  const toggleSelectAllDuplicatesForMerge = () => {
      if (selectedDuplicatesForMerge.length === duplicateQuestions.length) setSelectedDuplicatesForMerge([]);
      else setSelectedDuplicatesForMerge(duplicateQuestions.map(q => q.existingQuestion.id));
  }

  const addImportedQuestions = (newQuestions: Omit<Question, 'id'>[]) => {
     const questionsToAdd = newQuestions.map(q => ({
      ...q,
      id: `q${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      type: 'cq' as const, // Ensure type is 'cq'
    }));
    setAllQuestions(prev => [...questionsToAdd, ...prev]);
    toast({ title: `${newQuestions.length} new CQ questions added to the bank.`});
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setAllQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    toast({ title: `Question updated.`});
  };

  const deleteQuestion = (questionId: string) => {
    setAllQuestions(prev => prev.filter(q => q.id !== questionId));
    toast({ title: "Question deleted." });
  };

  const deleteMultipleQuestions = (questionIds: string[]) => {
    setAllQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
    toast({ title: `${questionIds.length} questions deleted.` });
  };
  
  const handleToggleSelectQuestion = (questionId: string) => {
    setSelectedTableQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  const handleSelectAllVisible = () => {
    const allVisibleIds = filteredQuestions.map(q => q.id);
    const allSelected = allVisibleIds.every(id => selectedTableQuestions.includes(id));
    if (allSelected) {
      setSelectedTableQuestions(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      setSelectedTableQuestions(prev => [...new Set([...prev, ...allVisibleIds])]);
    }
  }
  
  const handleDeleteSelected = () => {
    if (selectedTableQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: "No questions selected",
        description: "Please select questions to delete."
      })
      return;
    }
    setQuestionsToDelete(selectedTableQuestions);
  }
  
  const confirmDeleteMultiple = () => {
    deleteMultipleQuestions(questionsToDelete);
    setSelectedTableQuestions([]);
    setQuestionsToDelete([]);
  }

  const handleSaveQuestion = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion);
    setQuestionToEdit(null);
  };
  
  const isAllVisibleSelected = useMemo(() => {
    const visibleIds = filteredQuestions.map(q => q.id);
    return visibleIds.length > 0 && visibleIds.every(id => selectedTableQuestions.includes(id));
  }, [filteredQuestions, selectedTableQuestions]);

  const hasPreview = newQuestions.length > 0 || duplicateQuestions.length > 0;
  const totalSelectedForBank = selectedNew.length + selectedDuplicatesForMerge.length;

   const OptionsList = ({ options }: { options?: { text?: string; isCorrect: boolean }[] }) => {
    if (!options || options.length === 0) return null;
    return (
      <ol className="mt-2 space-y-1 list-alpha list-inside">
        {options.map((opt, index) => (
          <li key={index} className="flex items-start text-sm">
            {opt.text}
          </li>
        ))}
      </ol>
    )
  }

  if (!mounted) {
    return null; // Or a loading spinner
  }

  return (
    <>
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Card>
            <CardHeader>
                <CardTitle>Upload Creative Questions (CQ)</CardTitle>
                <CardDescription>
                    Use AI to generate from an image or use the bulk system to paste/upload CSV data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="image" className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value="image">Generate from Image</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload System</TabsTrigger>
                    </TabsList>
                    <TabsContent value="image" className="py-4 flex justify-center">
                        <ImageQuestionGenerator addImportedQuestionsAction={addImportedQuestions}>
                            <Button variant="outline">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Select Image to Generate Questions
                            </Button>
                        </ImageQuestionGenerator>
                    </TabsContent>
                    <TabsContent value="bulk" className="py-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Tabs defaultValue="paste" className='w-full'>
                                    <TabsList className='grid w-full grid-cols-2'>
                                        <TabsTrigger value="paste">Paste Text</TabsTrigger>
                                        <TabsTrigger value="file">Upload File</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="paste" className="py-4">
                                        <Textarea placeholder='Paste your CSV data here... (headers: para, op1, op2...)' className='h-40 font-mono' value={textData} onChange={handleTextChange}/>
                                    </TabsContent>
                                    <TabsContent value="file" className="py-4">
                                        <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="flex-1" />
                                    </TabsContent>
                                </Tabs>
                                <div className='flex justify-end'>
                                     <a href="/cq-upload-template.csv" download>
                                       <Button variant="outline" size="sm">
                                          <Download className="mr-2" />
                                          Download Template
                                       </Button>
                                     </a>
                                </div>
                            </div>
                            <div className="space-y-4 flex flex-col justify-center">
                                <Button onClick={handleParse} disabled={(!file && !textData) || isParsing} className="w-full">
                                    {isParsing ? 'Parsing...' : 'Parse & Preview'}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        
        {hasPreview && (
             <Card>
                <CardHeader>
                    <CardTitle>CQ Preview</CardTitle>
                    <CardDescription>Review the questions found. New questions and merged attributes for duplicates will be imported.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] border rounded-md">
                        {newQuestions.length > 0 && (
                            <div className='p-4'>
                                <h4 className='font-semibold mb-2'>New CQ Questions ({newQuestions.length})</h4>
                                <Table>
                                    <TableHeader><TableRow><TableHead className="w-12"><Checkbox checked={newQuestions.length > 0 && selectedNew.length === newQuestions.length} onCheckedChange={toggleSelectAllNew}/></TableHead><TableHead>Paragraph & Sub-questions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {newQuestions.map((q, i) => (
                                        <TableRow key={`new-${i}`}>
                                            <TableCell><Checkbox checked={selectedNew.includes(i)} onCheckedChange={() => toggleSelectNew(i)} /></TableCell>
                                            <TableCell className="align-top">
                                                <p className="font-medium">{q.text}</p>
                                                {q.options && <OptionsList options={q.options} />}
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {duplicateQuestions.length > 0 && (
                            <div className='p-4'>
                                {newQuestions.length > 0 && <Separator className="my-4" />}
                                <h4 className='font-semibold mb-2'>Found Duplicates ({duplicateQuestions.length})</h4>
                                 <p className="text-sm text-muted-foreground mb-2">These paragraphs already exist. The sub-questions will be updated/overwritten if you import.</p>
                                <Table>
                                    <TableHeader><TableRow><TableHead className="w-12"><Checkbox checked={duplicateQuestions.length > 0 && selectedDuplicatesForMerge.length === duplicateQuestions.length} onCheckedChange={toggleSelectAllDuplicatesForMerge}/></TableHead><TableHead>Question & New Sub-questions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {duplicateQuestions.map(d => (
                                        <TableRow key={d.existingQuestion.id}>
                                            <TableCell><Checkbox checked={selectedDuplicatesForMerge.includes(d.existingQuestion.id)} onCheckedChange={() => toggleSelectDuplicateForMerge(d.existingQuestion.id)} /></TableCell>
                                            <TableCell className="align-top">
                                                <p className="font-medium">{d.existingQuestion.text}</p>
                                                <OptionsList options={d.mergedData.options || d.existingQuestion.options} />
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <div className="flex justify-end w-full">
                         <Button onClick={handleImportToBank} disabled={totalSelectedForBank === 0} variant="success">
                            <GitMerge className="mr-2" />
                            Import {selectedNew.length > 0 ? `${selectedNew.length} New` : ''}
                            {selectedNew.length > 0 && selectedDuplicatesForMerge.length > 0 ? ' & ' : ''}
                            {selectedDuplicatesForMerge.length > 0 ? `Update ${selectedDuplicatesForMerge.length}` : ''}
                            {totalSelectedForBank > 0 ? ` to Bank` : 'to Bank'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )}

        <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader>
                <CardTitle>CQ Question Bank</CardTitle>
                <CardDescription>Browse, search, and manage all your Creative Questions.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search questions by text or topic..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                
                {selectedTableQuestions.length > 0 && (
                    <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm font-medium">{selectedTableQuestions.length} questions selected</span>
                        <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={handleDeleteSelected}><Trash2/> Delete Selected</Button>
                        </div>
                    </div>
                )}
                <div className="border rounded-md flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                            <TableHead className="w-12">
                            <Checkbox checked={isAllVisibleSelected} onCheckedChange={handleSelectAllVisible} aria-label="Select all visible rows" />
                            </TableHead>
                            <TableHead>Question (Paragraph)</TableHead>
                            <TableHead>Sub-questions</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuestions.length > 0 ? (
                            filteredQuestions.map(q => 
                                <TableRow key={q.id} data-state={selectedTableQuestions.includes(q.id) ? 'selected' : ''}>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedTableQuestions.includes(q.id)}
                                        onCheckedChange={() => handleToggleSelectQuestion(q.id)}
                                        aria-label="Select row"
                                    />
                                </TableCell>
                                <TableCell className="font-medium max-w-sm truncate" onClick={() => setSelectedQuestion(q)}>{q.text}</TableCell>
                                <TableCell onClick={() => setSelectedQuestion(q)}>{q.options?.length || 0}</TableCell>
                                <TableCell onClick={() => setSelectedQuestion(q)}>
                                    {q.difficulty && <Badge
                                        variant="outline"
                                        className={
                                            q.difficulty === 'Easy' ? 'border-green-400 text-green-700' :
                                            q.difficulty === 'Medium' ? 'border-amber-400 text-amber-700' :
                                            'border-red-400 text-red-700'
                                        }
                                    >{q.difficulty}</Badge>}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setSelectedQuestion(q)}>
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setQuestionToEdit(q)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setQuestionToDelete(q.id)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            )
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                       <div>
                                            <p>No CQ questions found.</p>
                                            <p className="text-sm text-muted-foreground">Try adjusting your filters or importing new questions.</p>
                                        </div>
                                    </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    </div>
    {selectedQuestion && (
        <QuestionDetailsDialog 
            question={selectedQuestion}
            allQuestions={allQuestions}
            isOpen={!!selectedQuestion} 
            onOpenChangeAction={(open: boolean) => !open && setSelectedQuestion(null)}
            onEditClickAction={() => {
                setQuestionToEdit(selectedQuestion);
                setSelectedQuestion(null);
            }}
        />
    )}
    {questionToEdit && (
        <EditQuestionDialog
            question={questionToEdit}
            isOpen={!!questionToEdit}
            onOpenChangeAction={(open: boolean) => !open && setQuestionToEdit(null)}
            onSaveAction={handleSaveQuestion}
        />
    )}
    <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question from the bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {if (questionToDelete) { deleteQuestion(questionToDelete); setQuestionToDelete(null);}}}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={questionsToDelete.length > 0} onOpenChange={(open) => !open && setQuestionsToDelete([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {questionsToDelete.length} questions from the bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionsToDelete([])}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMultiple}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
