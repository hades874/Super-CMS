
'use client';

import { useState, useMemo } from 'react';
import type { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { mockQuestions } from '@/data/mock-questions';
import { Filter, Search, X, Check, PlusCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { QuestionCard } from './QuestionCard';

type FilterValue = string | null;

type QuestionCompositionProps = {
    selectedQuestions: Question[];
    setSelectedQuestionsAction: React.Dispatch<React.SetStateAction<Question[]>>;
};

export function QuestionComposition({ selectedQuestions, setSelectedQuestionsAction }: QuestionCompositionProps) {
    const [mcqQuestions] = useLocalStorage<Question[]>('allQuestions', mockQuestions);
    const [ieltsQuestions] = useLocalStorage<Question[]>('ieltsQuestions', []);
    const [isOpen, setIsOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [questionType, setQuestionType] = useState<FilterValue>('mcq');
    const [vertical, setVertical] = useState<FilterValue>(null);
    const [program, setProgram] = useState<FilterValue>(null);
    const [subject, setSubject] = useState<FilterValue>(null);
    const [paper, setPaper] = useState<FilterValue>(null);
    const [chapter, setChapter] = useState<FilterValue>(null);
    const [examSet, setExamSet] = useState<FilterValue>(null);
    const [topic, setTopic] = useState<FilterValue>(null);
    const [difficulty, setDifficulty] = useState<FilterValue>(null);
    const [board, setBoard] = useState<FilterValue>(null);

    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { toast } = useToast();

    const allQuestions = useMemo(() => {
        const ieltsTagged = ieltsQuestions.map(q => ({...q, type: q.type || 'ielts' as const}));
        return [...mcqQuestions, ...ieltsTagged];
    }, [mcqQuestions, ieltsQuestions])

    const sortedQuestions = useMemo(() => {
        return [...allQuestions].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [allQuestions]);

    const doesValueMatch = (questionValue: string | string[] | undefined, filterValue: string) => {
        if (!questionValue) return false;
        if (Array.isArray(questionValue)) return questionValue.includes(filterValue);
        return questionValue === filterValue;
    }

    const filteredQuestions = useMemo(() => {
        return sortedQuestions.filter(q =>
            (q.text?.toLowerCase().includes(searchTerm.toLowerCase()) || q.topic?.toString().toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!questionType || q.type === questionType) &&
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
    }, [sortedQuestions, searchTerm, questionType, vertical, program, subject, paper, chapter, examSet, topic, difficulty, board]);

    const getUniqueOptions = (key: keyof Question) => {
        const allValues = allQuestions.flatMap(q => {
            const val = q[key];
            if (Array.isArray(val)) return val.map(v => String(v));
            return [String(val)];
        }).filter(v => v !== 'undefined' && v !== 'null' && v.trim() !== '');
        return [...new Set(allValues)];
    }

    const resetFilters = () => {
        setSearchTerm(''); setVertical(null); setProgram(null); setSubject(null);
        setPaper(null); setChapter(null); setExamSet(null); setTopic(null);
        setDifficulty(null); setBoard(null);
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

    const FilterableSelect = ({ value, onValueChange, options, placeholder }: { value: FilterValue, onValueChange: (value: FilterValue) => void, options: string[], placeholder: string }) => {
        if (options.length === 0) return null;
        return (
            <div className="relative">
                <Select value={value || ''} onValueChange={(val) => onValueChange(val || null)}>
                    <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {value && (
                    <Button variant="ghost" size="icon" className="absolute right-8 top-0 h-full w-8" onClick={(e) => { e.stopPropagation(); onValueChange(null); }}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        )
    }

    const handleToggleSelectQuestion = (questionId: string) => {
        setTempSelected(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleAddSelectedToExam = () => {
        const questionsToAdd = allQuestions.filter(q => tempSelected.includes(q.id));
        const newQuestions = questionsToAdd.filter(q => !selectedQuestions.some(sq => sq.id === q.id));
        setSelectedQuestionsAction(prev => [...prev, ...newQuestions]);
        toast({ title: `${newQuestions.length} questions added to the exam.`});
        setIsOpen(false);
    }
    
    const onOpen = () => {
        setTempSelected(selectedQuestions.map(q => q.id));
        setIsOpen(true);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Question Composition</CardTitle>
                    <CardDescription>
                        Define how questions are selected for this exam.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        {selectedQuestions.length} questions have been added to this exam.
                    </p>
                    <Button onClick={onOpen} className="w-full">
                        <PlusCircle className="mr-2" /> Add Questions from Bank
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add Questions to Exam</DialogTitle>
                        <DialogDescription>
                            Filter and select questions from the question bank to add to your exam.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="browse" className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <TabsList>
                            <TabsTrigger value="browse">Browse & Select</TabsTrigger>
                            <TabsTrigger value="selected">Currently Added ({selectedQuestions.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="browse" className="flex-1 flex flex-col gap-4 overflow-hidden">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search questions by text or topic..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full"><Filter className="mr-2 h-4 w-4" />Advanced Filters</Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4 space-y-4">
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                        <Select value={questionType || ''} onValueChange={(val) => setQuestionType(val || null)}>
                                            <SelectTrigger><SelectValue placeholder="Select Question Type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mcq">MCQ</SelectItem>
                                                <SelectItem value="cq">CQ</SelectItem>
                                                <SelectItem value="ielts">IELTS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FilterableSelect value={vertical} onValueChange={setVertical} options={allVerticals} placeholder="Select Vertical" />
                                        <FilterableSelect value={program} onValueChange={setProgram} options={allPrograms} placeholder="Select Program" />
                                        <FilterableSelect value={subject} onValueChange={setSubject} options={allSubjects} placeholder="Select Subject" />
                                        <FilterableSelect value={paper} onValueChange={setPaper} options={allPapers} placeholder="Select Paper" />
                                        <FilterableSelect value={chapter} onValueChange={setChapter} options={allChapters} placeholder="Select Chapter" />
                                        <FilterableSelect value={examSet} onValueChange={setExamSet} options={allExamSets} placeholder="Select Exam Set" />
                                        <FilterableSelect value={topic} onValueChange={setTopic} options={allTopics} placeholder="Select Topic" />
                                        <FilterableSelect value={board} onValueChange={setBoard} options={allBoards} placeholder="Select Board/School" />
                                        <FilterableSelect value={difficulty} onValueChange={setDifficulty} options={allDifficulties} placeholder="Select Difficulty" />
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        <X className="mr-2 h-4 w-4" />Clear All Filters
                                    </Button>
                                </CollapsibleContent>
                            </Collapsible>
                             <div className="text-sm text-muted-foreground">{tempSelected.length} questions selected</div>
                            <ScrollArea className="flex-1 border rounded-md -mx-6 px-6">
                                <div className="space-y-3 py-4">
                                    {filteredQuestions.map(q => (
                                        <div key={q.id} className="flex items-start gap-3">
                                            <Checkbox
                                                checked={tempSelected.includes(q.id)}
                                                onCheckedChange={() => handleToggleSelectQuestion(q.id)}
                                                id={`select-${q.id}`}
                                                className="mt-1"
                                            />
                                            <label htmlFor={`select-${q.id}`} className="flex-1">
                                                <p className="font-medium text-sm">{q.text}</p>
                                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                                    <Badge variant="secondary">{q.subject}</Badge>
                                                    <Badge variant="outline">{q.difficulty}</Badge>
                                                    <Badge variant="default" className="bg-sky-500">{q.type}</Badge>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="selected" className="flex-1 overflow-hidden">
                             <ScrollArea className="h-full">
                                <div className="space-y-2">
                                     {selectedQuestions.length > 0 ? selectedQuestions.map(q => (
                                        <div key={q.id} className="border p-3 rounded-md bg-muted/50 flex justify-between items-center">
                                            <p className="text-sm font-medium flex-1">{q.text}</p>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedQuestionsAction(prev => prev.filter(item => item.id !== q.id))}>
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                     )) : (
                                        <p className="text-center text-muted-foreground p-8">No questions added yet.</p>
                                     )}
                                </div>
                             </ScrollArea>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <DialogClose asChild>
                           <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddSelectedToExam}><Check className="mr-2"/>Confirm Selection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
