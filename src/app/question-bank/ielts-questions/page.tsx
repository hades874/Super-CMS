
'use client';
import { useState, useMemo } from 'react';
import type { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Trash2, Download, Edit, Eye, MoreHorizontal, Upload as UploadIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionDetailsDialog } from '@/components/QuestionDetailsDialog';
import Link from 'next/link';
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
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const AttributeBadge = ({ value, className }: { value: string | string[] | undefined, className?: string }) => {
  if (!value) return null;
  const values = Array.isArray(value) ? value : [value];
  return (
    <div className='flex flex-wrap gap-1'>
      {values.map((val, index) => (
        <Badge key={index} variant="outline" className={`text-[10px] py-0 px-1 font-medium ${className}`}>{val}</Badge>
      ))}
    </div>
  );
};

export default function IeltsQuestionBank() {
  const { 
    questions: ieltsQuestionsBank, 
    allQuestions, 
    updateQuestion, 
    deleteQuestion: deleteQuestionRepo,
    deleteMultipleQuestions: deleteMultipleRepo,
    exportData,
    clearRepository
  } = useIeltsRepository();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [part, setPart] = useState<string | null>(null);
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [questionsToDelete, setQuestionsToDelete] = useState<string[]>([]);
  const [selectedTableQuestions, setSelectedTableQuestions] = useState<string[]>([]);
  
  const { toast } = useToast();

  const sortedQuestions = useMemo(() => {
    const combined = [...allQuestions, ...ieltsQuestionsBank];
    return combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [allQuestions, ieltsQuestionsBank]);

  const ieltsQuestions = useMemo(() => {
    return sortedQuestions.filter(q => {
        const hasIeltsSubject = Array.isArray(q.subject) ? q.subject.includes('IELTS') : q.subject === 'IELTS';
        return hasIeltsSubject || q.type === 'ielts' || q.type?.startsWith('ielts');
    });
  }, [sortedQuestions]);

  const filteredQuestions = useMemo(() => {
    return ieltsQuestions.filter(q => {
      const matchesSearch = (
        (q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.topic && (Array.isArray(q.topic) ? q.topic.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) : q.topic.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      const matchesDifficulty = !difficulty || q.difficulty === difficulty;
      const matchesPart = !part || (Array.isArray(q.subject) ? q.subject.includes(part) : q.subject === part);
      return matchesSearch && matchesDifficulty && matchesPart;
    });
  }, [ieltsQuestions, searchTerm, difficulty, part]);

  const handleSaveQuestion = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion);
    toast({ title: "Question updated successfully" });
    setQuestionToEdit(null);
  };

  const deleteQuestionLocal = (id: string) => {
    deleteQuestionRepo(id);
    toast({ title: "Question deleted" });
    setQuestionToDelete(null);
  };

  const deleteMultipleQuestionsLocal = (ids: string[]) => {
    deleteMultipleRepo(ids);
    toast({ title: `Deleted ${ids.length} questions` });
  };

  const confirmDeleteMultiple = () => {
    deleteMultipleQuestionsLocal(questionsToDelete);
    setSelectedTableQuestions([]);
    setQuestionsToDelete([]);
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedTableQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const toggleAllQuestions = () => {
    if (selectedTableQuestions.length === filteredQuestions.length) {
      setSelectedTableQuestions([]);
    } else {
      setSelectedTableQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const handlePurgeCache = () => {
    if (confirm("Are you sure? This will wipe your local cache and reload the page.")) {
      clearRepository();
      toast({ title: "Cache purged successfully" });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/exam-service/ielts/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">IELTS Question Bank</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Repository Management ({ieltsQuestions.length} Items)</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={exportData} className="rounded-xl font-bold h-10 gap-2 border">
             <Download className="h-3.5 w-3.5" /> EXPORT
           </Button>
           <Link href="/question-bank/ielts-questions/upload">
             <Button className="h-10 px-6 rounded-xl shadow-sm gap-2 font-bold">
               <UploadIcon className="h-4 w-4" /> IMPORT
             </Button>
           </Link>
        </div>
      </div>

      <Card className="border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/5 pb-4 border-b">
           <div className="flex flex-col sm:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
               <Input
                 placeholder="Search by text or topic..."
                 className="pl-9 h-10 rounded-lg text-sm bg-background border-muted-foreground/20"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="flex items-center gap-2">
               <div className="flex bg-muted/30 p-1 rounded-lg border">
                 {['Listening', 'Reading', 'Writing'].map(p => (
                   <button
                     key={p}
                     onClick={() => setPart(part === p ? null : p)}
                     className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${part === p ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     {p}
                   </button>
                 ))}
               </div>
               <div className="flex bg-muted/30 p-1 rounded-lg border">
                 {['Easy', 'Medium', 'Hard'].map(level => (
                   <button
                     key={level}
                     onClick={() => setDifficulty(difficulty === level ? null : level)}
                     className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${difficulty === level ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     {level}
                   </button>
                 ))}
               </div>
               <Button variant="ghost" size="sm" onClick={handlePurgeCache} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-md">
                 <Trash2 className="h-3.5 w-3.5" />
               </Button>
             </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedTableQuestions.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/5 border-b">
              <p className="text-[10px] font-black uppercase text-primary px-3">{selectedTableQuestions.length} selected</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setQuestionsToDelete(selectedTableQuestions)}
                className="rounded-lg h-7 text-[10px] font-black uppercase px-4"
              >
                Delete Selected
              </Button>
            </div>
          )}

          <ScrollArea className="h-[550px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={selectedTableQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                      onCheckedChange={toggleAllQuestions}
                    />
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Content Preview</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <TableRow key={question.id} className="group border-b last:border-0 hover:bg-muted/5">
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedTableQuestions.includes(question.id)}
                          onCheckedChange={() => toggleQuestionSelection(question.id)}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1.5 max-w-2xl">
                          <p className="text-sm font-medium leading-tight text-foreground/90 line-clamp-2" dangerouslySetInnerHTML={{ __html: question.text || '' }} />
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[9px] font-black py-0 px-1.5 uppercase opacity-60">{question.difficulty}</Badge>
                             <AttributeBadge value={question.topic} className="opacity-70 bg-muted/30" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[9px] font-black py-0 px-1.5 uppercase tracking-tighter">{question.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelectedQuestion(question)}>
                              <Eye className="h-3.5 w-3.5" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setQuestionToEdit(question)}>
                              <Edit className="h-3.5 w-3.5" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => setQuestionToDelete(question.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20">
                      <p className="text-xs font-bold text-muted-foreground uppercase">No questions discovered</p>
                      <Link href="/question-bank/ielts-questions/upload">
                        <Button variant="link" className="mt-2 text-xs font-black uppercase">Start Import</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedQuestion && (
        <QuestionDetailsDialog
          question={selectedQuestion}
          allQuestions={ieltsQuestions}
          isOpen={!!selectedQuestion}
          onOpenChangeAction={(open: boolean) => !open && setSelectedQuestion(null)}
          onEditClickAction={(q) => {
            setSelectedQuestion(null);
            setQuestionToEdit(q);
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
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question from your cache.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => questionToDelete && deleteQuestionLocal(questionToDelete)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={questionsToDelete.length > 0} onOpenChange={(open) => !open && setQuestionsToDelete([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {questionsToDelete.length} Questions?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected questions from your cache.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMultiple} className="bg-destructive text-destructive-foreground">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
