
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Headphones, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Music, 
  Layers,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import Link from 'next/link';
import type { Question, ListeningPart, ListeningSection } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { mockQuestions } from '@/data/mock-questions';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';

export default function IeltsListeningMapperPage() {
  const { questions: ieltsQuestions, allQuestions: mcqQuestions } = useIeltsRepository();
  const { toast } = useToast();

  const [listeningSection, setListeningSection] = useLocalStorage<ListeningSection>('ielts-listening-section', {
    id: 'al-s1',
    parts: [
      { id: 'part-1', partNumber: 1, audioSrc: '', questions: [] },
      { id: 'part-2', partNumber: 2, audioSrc: '', questions: [] },
      { id: 'part-3', partNumber: 3, audioSrc: '', questions: [] },
      { id: 'part-4', partNumber: 4, audioSrc: '', questions: [] },
    ]
  });

  const [activePartIndex, setActivePartIndex] = useState(0);
  const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allAvailableQuestions = useMemo(() => {
    return [...mcqQuestions, ...ieltsQuestions].filter(q => 
        q.subject === 'IELTS' || q.type === 'ielts' || q.type?.startsWith('ielts')
    );
  }, [mcqQuestions, ieltsQuestions]);

  const filteredQuestions = useMemo(() => {
    return allAvailableQuestions.filter(q => 
      q.text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.topic?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allAvailableQuestions, searchTerm]);

  const handleUpdatePart = (index: number, updates: Partial<ListeningPart>) => {
    setListeningSection(prev => ({
      ...prev,
      parts: prev.parts.map((p, i) => i === index ? { ...p, ...updates } : p)
    }));
  };

  const toggleQuestionSelection = (question: Question) => {
    const currentQuestions = listeningSection.parts[activePartIndex].questions;
    const isSelected = currentQuestions.some(q => q.id === question.id);

    let nextQuestions;
    if (isSelected) {
      nextQuestions = currentQuestions.filter(q => q.id !== question.id);
    } else {
      nextQuestions = [...currentQuestions, question];
    }

    handleUpdatePart(activePartIndex, { questions: nextQuestions });
  };

  const handleSave = () => {
    toast({
        title: "IELTS Listening Configuration Saved",
        description: "Your listening section mapping has been synced to local storage.",
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/exam-service/ielts/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">Listening Mapper</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Configure audio and questions for IELTS sections</p>
          </div>
        </div>
        <Button onClick={handleSave} className="h-10 px-6 rounded-xl shadow-sm gap-2 font-bold uppercase text-xs">
          <Save className="h-4 w-4" />
          Save Mapping
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 flex-1">
        {/* Sidebar Parts Selector */}
        <div className="lg:col-span-1 space-y-2">
          {listeningSection.parts.map((part, index) => (
            <button
              key={part.id}
              onClick={() => setActivePartIndex(index)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                activePartIndex === index 
                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                : "bg-card border-border hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    activePartIndex === index ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {part.partNumber}
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-tight">Part {part.partNumber}</p>
                  <p className={cn(
                    "text-[9px] font-bold uppercase opacity-70",
                    activePartIndex === index ? "text-white" : "text-muted-foreground"
                  )}>
                    {part.questions.length} Questions
                  </p>
                </div>
              </div>
              <Music className={cn(
                "h-4 w-4 opacity-30",
                activePartIndex === index ? "text-white" : "text-muted-foreground"
              )} />
            </button>
          ))}
        </div>

        {/* Focused Work Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/5 p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold uppercase">Section {listeningSection.parts[activePartIndex].partNumber} Settings</CardTitle>
                  <CardDescription className="text-xs">Manage audio resource and question associations.</CardDescription>
                </div>
                <Music className="h-5 w-5 text-muted-foreground/30" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Audio Source Entry */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Audio Stream URL</Label>
                <div className="relative group">
                    <Input 
                        placeholder="Cloud URL or local assets path..." 
                        className="h-11 pl-10 rounded-xl bg-background border-muted-foreground/20 text-sm"
                        value={listeningSection.parts[activePartIndex].audioSrc}
                        onChange={(e) => handleUpdatePart(activePartIndex, { audioSrc: e.target.value })}
                    />
                    <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Mapped Questions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mapped Question Bank</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg font-bold h-8 border text-[10px] uppercase px-3"
                    onClick={() => setIsQuestionPickerOpen(true)}
                  >
                    <Plus className="mr-1.5 h-3 w-3" />
                    Attach Questions
                  </Button>
                </div>

                <div className="grid gap-2">
                  {listeningSection.parts[activePartIndex].questions.length > 0 ? (
                    listeningSection.parts[activePartIndex].questions.map((q, qIndex) => (
                      <div 
                        key={q.id} 
                        className="p-4 rounded-xl border bg-muted/5 flex items-center justify-between group hover:bg-primary/5 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center font-black text-[10px] text-muted-foreground border">
                                Q{qIndex + 1}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium line-clamp-1" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[8px] uppercase font-black px-1.5 h-4 opacity-60">{q.type}</Badge>
                                    <Badge variant="outline" className="text-[8px] uppercase font-black bg-muted/30 h-4 px-1.5 border-transparent opacity-70">{q.difficulty}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => toggleQuestionSelection(q)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/5">
                      <Layers className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Part is currently empty</p>
                      <Button variant="link" onClick={() => setIsQuestionPickerOpen(true)} className="mt-1 font-black text-primary uppercase text-[10px]">Sync Items</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Question Selection Dialog */}
      <Dialog open={isQuestionPickerOpen} onOpenChange={setIsQuestionPickerOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-lg font-bold uppercase">Question Bank Selection</DialogTitle>
            <DialogDescription className="text-xs">Search and attach question payloads to Section {listeningSection.parts[activePartIndex].partNumber}.</DialogDescription>
            
            <div className="relative mt-4 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search repository..." 
                    className="h-10 pl-9 rounded-xl text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            <div className="grid gap-2 pb-6">
              {filteredQuestions.length > 0 ? filteredQuestions.map(q => {
                const isSelected = listeningSection.parts[activePartIndex].questions.some(sq => sq.id === q.id);
                return (
                  <div 
                    key={q.id}
                    onClick={() => toggleQuestionSelection(q)}
                    className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                        isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border bg-background hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 pr-4">
                        <div className={cn(
                            "h-4 w-4 rounded-md border flex items-center justify-center transition-all",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                        )}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <div className="space-y-0.5">
                            <p className="font-medium text-sm leading-tight" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[9px] font-black uppercase h-4 px-1.5">{q.type}</Badge>
                                {q.topic && <Badge variant="outline" className="text-[9px] font-black uppercase h-4 px-1.5 opacity-60">{Array.isArray(q.topic) ? q.topic[0] : q.topic}</Badge>}
                            </div>
                        </div>
                    </div>
                    {isSelected && (
                        <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-primary uppercase tracking-widest">Attached</span>
                        </div>
                    )}
                  </div>
                );
              }) : (
                <div className="py-20 text-center space-y-2 opacity-50">
                    <p className="font-bold uppercase tracking-widest text-xs">No matching items</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-muted/5 border-t flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-muted-foreground">Selection Summary</span>
                <span className="text-lg font-black text-primary uppercase">{listeningSection.parts[activePartIndex].questions.length} Items</span>
            </div>
            <DialogClose asChild>
                <Button className="h-10 px-8 rounded-xl font-bold text-xs uppercase shadow-sm">Confirm & Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
