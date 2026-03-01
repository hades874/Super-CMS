
'use client';
import { useState, useMemo } from 'react';
import type { Question, QuestionSet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot, Upload, Trash2, PlusCircle, Filter, X, Image as ImageIcon, MoreHorizontal, Edit, Eye, ArrowLeft } from 'lucide-react';
import { AiQuestionSuggester } from '@/components/AiQuestionSuggester';
import { QuestionSetCard } from '@/components/QuestionSetCard';
import { Button } from '@/components/ui/button';
import { ImageQuestionGenerator } from '@/components/ImageQuestionGenerator';
import { QuestionDetailsDialog } from '@/components/QuestionDetailsDialog';
import { QuestionSetDetailsDialog } from '@/components/QuestionSetDetailsDialog';
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
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
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type FilterValue = string | null;

const AttributeBadge = ({ value, className }: { value: string | string[] | undefined, className?: string }) => {
  if (!value) return null;
  const values = Array.isArray(value) ? value : [value];
  return (
    <div className='flex flex-wrap gap-1'>
      {values.map((val, index) => (
        <Badge key={index} variant="outline" className={cn("text-[10px] py-0 px-2 font-black uppercase tracking-tighter", className)}>{val}</Badge>
      ))}
    </div>
  );
};

export default function McqQuestionsPage() {
  const [allQuestions, setAllQuestions] = useLocalStorage<Question[]>('allQuestions', mockQuestions);
  const [ieltsQuestionsBank, setIeltsQuestionsBank] = useLocalStorage<Question[]>('ieltsQuestions', []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [vertical, setVertical] = useState<FilterValue>(null);
  const [program, setProgram] = useState<FilterValue>(null);
  const [subject, setSubject] = useState<FilterValue>(null);
  const [paper, setPaper] = useState<FilterValue>(null);
  const [chapter, setChapter] = useState<FilterValue>(null);
  const [examSet, setExamSet] = useState<FilterValue>(null);
  const [topic, setTopic] = useState<FilterValue>(null);
  const [difficulty, setDifficulty] = useState<FilterValue>(null);
  const [board, setBoard] = useState<FilterValue>(null);
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [questionsToDelete, setQuestionsToDelete] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  const sortedQuestions = useMemo(() => {
    const combined = [...allQuestions, ...ieltsQuestionsBank];
    return combined.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
    });
  }, [allQuestions, ieltsQuestionsBank]);

  const doesValueMatch = (questionValue: string | string[] | undefined, filterValue: string) => {
    if (!questionValue) return false;
    if (Array.isArray(questionValue)) return questionValue.includes(filterValue);
    return questionValue === filterValue;
  }

  const filteredQuestions = useMemo(() => {
    return sortedQuestions.filter(q =>
      q && q.subject !== 'IELTS' && q.type !== 'ielts' && !q.type?.startsWith('ielts') &&
      (
        (q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.topic && (Array.isArray(q.topic) ? q.topic.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) : q.topic.toLowerCase().includes(searchTerm.toLowerCase())))
      ) &&
      (!vertical || doesValueMatch(q.vertical, vertical)) &&
      (!program || doesValueMatch(q.program, program)) &&
      (!subject || doesValueMatch(q.subject, subject)) &&
      (!paper || doesValueMatch(q.paper, paper)) &&
      (!chapter || doesValueMatch(q.chapter, chapter)) &&
      (!examSet || doesValueMatch(q.exam_set, examSet)) &&
      (!topic || doesValueMatch(q.topic, topic)) &&
      (!difficulty || q.difficulty === difficulty) &&
      (!board || doesValueMatch(q.board, board))
    );
  }, [sortedQuestions, searchTerm, vertical, program, subject, paper, chapter, examSet, topic, difficulty, board]);

  const questionSets = useMemo(() => {
    const topics: { [key: string]: Question[] } = {};
    allQuestions.forEach(q => {
      const topicKeys = Array.isArray(q.topic) ? q.topic : [q.topic || 'Uncategorized'];
      topicKeys.forEach(topicKey => {
         if (topicKey) {
            if (!topics[topicKey]) {
                topics[topicKey] = [];
            }
            topics[topicKey].push(q);
         }
      });
    });

    return Object.entries(topics).map(([topicName, questionsInSet]) => ({
      id: topicName,
      name: topicName,
      description: `A set of ${questionsInSet.length} questions about ${topicName}.`,
      questionIds: questionsInSet.map(q => q.id)
    }));
  }, [allQuestions]);

  const getUniqueOptions = (key: keyof Question) => {
      const allValues = allQuestions.flatMap(q => {
          const val = q[key];
          if (Array.isArray(val)) return val.filter(v => typeof v === 'string');
          return typeof val === 'string' ? [val] : [];
      }).filter((v): v is string => typeof v === 'string' && v.trim() !== '');
      return [...new Set(allValues)];
  }
  
  const resetFilters = () => {
    setSearchTerm('');
    setVertical(null);
    setProgram(null);
    setSubject(null);
    setPaper(null);
    setChapter(null);
    setExamSet(null);
    setTopic(null);
    setDifficulty(null);
    setBoard(null);
    toast({ title: 'Filters cleared.' });
  }

  const allVerticals = useMemo(() => getUniqueOptions('vertical'), [allQuestions]);
  const allPrograms = useMemo(() => getUniqueOptions('program'), [allQuestions]);
  const allSubjects = useMemo(() => getUniqueOptions('subject'), [allQuestions]);
  const allPapers = useMemo(() => getUniqueOptions('paper'), [allQuestions]);
  const allChapters = useMemo(() => getUniqueOptions('chapter'), [allQuestions]);
  const allExamSets = useMemo(() => getUniqueOptions('exam_set'), [allQuestions]);
  const allTopics = useMemo(() => getUniqueOptions('topic'), [allQuestions]);
  const allBoards = useMemo(() => getUniqueOptions('board'), [allQuestions]);
  const allDifficulties = useMemo(() => ['Easy', 'Medium', 'Hard'], []);

  const addImportedQuestions = (newQuestionsList: Omit<Question, 'id'>[]) => {
     const questionsToAdd = newQuestionsList.map(q => ({
      ...q,
      id: `q${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    }));
    setAllQuestions(prev => [...prev, ...questionsToAdd]);
    toast({ title: `${questionsToAdd.length} new questions added.`});
  };

  const updateQuestion = (updatedQuestion: Question) => {
    const bankToUpdate = ieltsQuestionsBank.some(q => q.id === updatedQuestion.id) ? setIeltsQuestionsBank : setAllQuestions;
    bankToUpdate(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    toast({ title: `Question updated.`});
  };

  const deleteQuestion = (questionId: string) => {
    const bankToUpdate = ieltsQuestionsBank.some(q => q.id === questionId) ? setIeltsQuestionsBank : setAllQuestions;
    bankToUpdate(prev => prev.filter(q => q.id !== questionId));
    toast({ title: "Question deleted." });
  };

  const deleteMultipleQuestions = (questionIds: string[]) => {
    setIeltsQuestionsBank(prev => prev.filter(q => !questionIds.includes(q.id)));
    setAllQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
    toast({ title: `${questionIds.length} questions deleted.` });
  };
  
  const FilterableSelect = ({ value, onValueChange, options, placeholder }: { value: FilterValue, onValueChange: (value: FilterValue) => void, options: string[], placeholder: string }) => {
    if (options.length === 0) return null;
    return (
        <div className="relative">
            <Select value={value || ''} onValueChange={(val) => onValueChange(val || null)}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-muted-foreground/10 focus:ring-primary/20">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    {options.map((option) => (
                        <SelectItem key={option} value={option} className="rounded-lg">
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {value && (
                <Button variant="ghost" size="icon" className="absolute right-8 top-0 h-full w-8 hover:bg-transparent text-muted-foreground" onClick={(e) => { e.stopPropagation(); onValueChange(null); }}>
                    <X className="h-3 w-3"/>
                </Button>
            )}
        </div>
    )
  }

  const handleToggleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]);
  };
  
  const handleSelectAllVisible = () => {
    const allVisibleIds = filteredQuestions.map(q => q.id);
    const allSelected = allVisibleIds.every(id => selectedQuestions.includes(id));
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...allVisibleIds])]);
    }
  }
  
  const handleDeleteSelected = () => {
    if (selectedQuestions.length === 0) {
      toast({ variant: 'destructive', title: "No selection made" });
      return;
    }
    setQuestionsToDelete(selectedQuestions);
  }
  
  const confirmDeleteMultiple = () => {
    deleteMultipleQuestions(questionsToDelete);
    setSelectedQuestions([]);
    setQuestionsToDelete([]);
  }

  const handleSaveQuestion = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion);
    setQuestionToEdit(null);
  };

  const hasAnyFilterOptions = useMemo(() => [allVerticals, allPrograms, allSubjects, allPapers, allChapters, allExamSets, allTopics, allBoards, allDifficulties].some(options => options.length > 0), [allVerticals, allPrograms, allSubjects, allPapers, allChapters, allExamSets, allTopics, allBoards, allDifficulties]);
  const isAllVisibleSelected = useMemo(() => {
    const visibleIds = filteredQuestions.map(q => q.id);
    return visibleIds.length > 0 && visibleIds.every(id => selectedQuestions.includes(id));
  }, [filteredQuestions, selectedQuestions]);

  return (
    <>
    <div className='flex-1 flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl border h-10 w-10">
                 <ArrowLeft className="h-4 w-4" />
              </Button>
           </Link>
           <div>
              <h1 className="text-2xl font-bold tracking-tight uppercase">MCQ Question Bank</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">General Repository Management ({filteredQuestions.length} Items)</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Link href="/question-bank/bulk-upload">
              <Button variant="outline" className="h-10 px-5 rounded-xl font-bold gap-2 text-xs uppercase">
                 <Upload className="h-3.5 w-3.5" /> Bulk Upload
              </Button>
           </Link>
           <ImageQuestionGenerator addImportedQuestionsAction={addImportedQuestions}>
              <Button variant="outline" className="h-10 px-5 rounded-xl font-bold gap-2 text-xs uppercase border-dashed border-primary/40 text-primary">
                 <ImageIcon className="h-3.5 w-3.5" /> OCR Pipeline
              </Button>
           </ImageQuestionGenerator>
           <AiQuestionSuggester addImportedQuestionsAction={addImportedQuestions} existingQuestions={allQuestions}>
              <Button className="h-10 px-6 rounded-xl shadow-sm gap-2 font-bold text-xs uppercase">
                 <Bot className="h-4 w-4" /> Generate AI
              </Button>
           </AiQuestionSuggester>
        </div>
      </div>
      
        <Tabs defaultValue="questions" className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
           <TabsList className="bg-muted/50 p-1 rounded-xl h-10 border shadow-inner">
              <TabsTrigger value="questions" className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest">Inventory ({filteredQuestions.length})</TabsTrigger>
              <TabsTrigger value="sets" className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest">Topic Sets ({questionSets.length})</TabsTrigger>
           </TabsList>
           
           <div className="flex-1 max-w-xl relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input 
                placeholder="Search repository..." 
                className="pl-9 h-10 rounded-xl bg-card border-muted-foreground/20 text-sm" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
           </div>
           
           <Button 
                variant={isFilterOpen ? "default" : "outline"} 
                className="h-10 px-4 rounded-lg font-bold text-[10px] uppercase gap-2 shrink-0"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
           >
                <Filter className="h-3.5 w-3.5" /> Filters
           </Button>
        </div>

          <TabsContent value="questions" className="flex-1 flex flex-col gap-4 overflow-hidden mt-0">
           <Collapsible open={isFilterOpen}>
              <CollapsibleContent className="pb-4">
                 <Card className="border shadow-sm rounded-2xl p-4 bg-muted/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                       <FilterableSelect value={vertical} onValueChange={setVertical} options={allVerticals} placeholder="Vertical" />
                       <FilterableSelect value={subject} onValueChange={setSubject} options={allSubjects} placeholder="Subject" />
                       <FilterableSelect value={topic} onValueChange={setTopic} options={allTopics} placeholder="Topic" />
                       <FilterableSelect value={difficulty} onValueChange={setDifficulty} options={allDifficulties} placeholder="Difficulty"/>
                       <Button variant="ghost" size="sm" onClick={resetFilters} className="text-destructive hover:bg-destructive/10 rounded-lg h-10 font-bold uppercase text-[10px] border border-destructive/20 bg-background">
                          <X className="mr-2 h-3.5 w-3.5"/> Clear All
                       </Button>
                    </div>
                 </Card>
              </CollapsibleContent>
           </Collapsible>

           {selectedQuestions.length > 0 && (
              <div className="flex items-center justify-between bg-primary p-3 rounded-xl border border-primary/20 transition-all shadow-sm mb-4">
                  <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-[10px]">{selectedQuestions.length}</div>
                      <span className="text-white font-bold uppercase tracking-widest text-[9px]">Items Selected for Action</span>
                  </div>
                  <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedQuestions([])} className="text-white hover:bg-white/10 font-bold rounded-lg text-[9px] h-7 px-3 uppercase">Abort</Button>
                      <Button size="sm" variant="secondary" onClick={handleDeleteSelected} className="font-bold rounded-lg px-4 h-7 text-[9px] uppercase">
                          Delete Selection
                      </Button>
                  </div>
              </div>
           )}
           <Card className="border shadow-sm rounded-2xl flex-1 overflow-hidden min-h-0 flex flex-col">
              <ScrollArea className="flex-1">
                 <Table>
                    <TableHeader className="bg-muted/30 sticky top-0 bg-background z-20">
                       <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="w-12 px-6"><Checkbox checked={isAllVisibleSelected} onCheckedChange={handleSelectAllVisible} /></TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Question Content</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Metadata</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Level</TableHead>
                          <TableHead className="text-right px-6 text-[10px] font-black uppercase tracking-widest">Control</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                          <TableRow key={q.id} className="group border-b last:border-0 hover:bg-muted/5">
                             <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                                <Checkbox checked={selectedQuestions.includes(q.id)} onCheckedChange={() => handleToggleSelectQuestion(q.id)} />
                             </TableCell>
                             <TableCell className="py-5" onClick={() => setSelectedQuestion(q)}>
                                <div className="flex flex-col gap-1.5 max-w-xl">
                                   <span className="text-sm font-medium leading-relaxed line-clamp-2 text-foreground/90">{q.text}</span>
                                   <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-2">
                                      <Badge variant="outline" className="text-[8px] h-4 px-1">{q.type}</Badge>
                                      ID: {q.id.split('-')[0]}
                                   </span>
                                </div>
                             </TableCell>
                             <TableCell onClick={() => setSelectedQuestion(q)}>
                                <div className="flex flex-wrap gap-1">
                                   <Badge variant="outline" className="text-[9px] font-black uppercase bg-sky-50 text-sky-700 border-sky-100">{String(q.subject)}</Badge>
                                   <Badge variant="outline" className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border-emerald-100">{Array.isArray(q.topic) ? q.topic[0] : q.topic}</Badge>
                                </div>
                             </TableCell>
                             <TableCell onClick={() => setSelectedQuestion(q)}>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-black uppercase h-4 px-1.5 border-none",
                                   q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                                   q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                   'bg-rose-100 text-rose-800 shadow-sm'
                                )}>{q.difficulty}</Badge>
                             </TableCell>
                             <TableCell className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                         <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
                                      <DropdownMenuItem onSelect={() => setSelectedQuestion(q)} className="rounded-lg text-xs font-bold gap-2">
                                         <Eye className="h-3.5 w-3.5" /> View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => setQuestionToEdit(q)} className="rounded-lg text-xs font-bold gap-2">
                                         <Edit className="h-3.5 w-3.5" /> Edit Asset
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onSelect={() => setQuestionToDelete(q.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg text-xs font-bold gap-2">
                                         <Trash2 className="h-3.5 w-3.5" /> Delete Permanently
                                      </DropdownMenuItem>
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </TableCell>
                          </TableRow>
                       )) : (
                          <TableRow>
                             <TableCell colSpan={5} className="py-24 text-center">
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">Repository is Empty</p>
                             </TableCell>
                          </TableRow>
                       )}
                    </TableBody>
                 </Table>
              </ScrollArea>
           </Card>
          </TabsContent>
          <TabsContent value="sets" className="flex-1 overflow-hidden mt-0 pt-4">
            <ScrollArea className="h-full -mx-4 px-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {questionSets.map(qs => <QuestionSetCard key={qs.id} questionSet={qs} onViewClickAction={() => setSelectedQuestionSet(qs)}/>)}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
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
    {selectedQuestionSet && (
        <QuestionSetDetailsDialog
            questionSet={selectedQuestionSet}
            allQuestions={allQuestions}
            isOpen={!!selectedQuestionSet}
            onOpenChange={(open) => !open && setSelectedQuestionSet(null)}
            onQuestionClick={(question) => setSelectedQuestion(question)}
            onEditClick={(question) => {
                setQuestionToEdit(question);
                setSelectedQuestionSet(null);
            }}
        />
    )}
    <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic">CONFIRM PURGE TRANSACTION</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This will permanently delete the selected content payload from the core repository. Decryption and recovery will be impossible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-xl h-12 px-6 font-bold" onClick={() => setQuestionToDelete(null)}>ABORT</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl h-12 px-8 font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200" onClick={() => {if (questionToDelete) { deleteQuestion(questionToDelete); setQuestionToDelete(null);}}}>
              CONFIRM DESTRUCTION
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={questionsToDelete.length > 0} onOpenChange={(open) => !open && setQuestionsToDelete([])}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black italic">BATCH DESTRUCTION WARNING</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              You are about to purge {questionsToDelete.length} content payloads. This is a destructive transaction and cannot be rolled back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-xl h-12 px-6 font-bold" onClick={() => setQuestionsToDelete([])}>ABORT MISSION</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl h-12 px-8 font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200" onClick={confirmDeleteMultiple}>
              COMMENCE PURGE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
