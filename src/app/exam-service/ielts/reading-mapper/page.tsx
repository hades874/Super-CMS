
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  FileText, 
  Layers,
  Search,
  CheckCircle2,
  X,
  Type,
  AlignLeft,
  Layout
} from 'lucide-react';
import Link from 'next/link';
import type { Question, ReadingPassage, ReadingSection } from '@/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IeltsReadingMapperPage() {
  const [mcqQuestions] = useLocalStorage<Question[]>('allQuestions', mockQuestions);
  const [ieltsQuestions] = useLocalStorage<Question[]>('ieltsQuestions', []);
  const { toast } = useToast();

  const [readingSection, setReadingSection] = useLocalStorage<ReadingSection>('ielts-reading-section', {
    id: 'ar-s1',
    passages: [
      { id: 'passage-1', passageNumber: 1, title: '', content: '', questions: [] },
      { id: 'passage-2', passageNumber: 2, title: '', content: '', questions: [] },
      { id: 'passage-3', passageNumber: 3, title: '', content: '', questions: [] },
    ]
  });

  const [activePassageIndex, setActivePassageIndex] = useState(0);
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

  const handleUpdatePassage = (index: number, updates: Partial<ReadingPassage>) => {
    setReadingSection(prev => ({
      ...prev,
      passages: prev.passages.map((p, i) => i === index ? { ...p, ...updates } : p)
    }));
  };

  const handleAddPassage = () => {
    const nextNumber = readingSection.passages.length + 1;
    const newPassage: ReadingPassage = {
        id: `passage-${Date.now()}`,
        passageNumber: nextNumber,
        title: `New Passage ${nextNumber}`,
        content: '',
        questions: []
    };
    setReadingSection(prev => ({
        ...prev,
        passages: [...prev.passages, newPassage]
    }));
    setActivePassageIndex(readingSection.passages.length);
    toast({ title: "New Reading Passage Initialized" });
  };

  const toggleQuestionSelection = (question: Question) => {
    const currentQuestions = readingSection.passages[activePassageIndex].questions;
    const isSelected = currentQuestions.some(q => q.id === question.id);

    let nextQuestions;
    if (isSelected) {
      nextQuestions = currentQuestions.filter(q => q.id !== question.id);
    } else {
      nextQuestions = [...currentQuestions, question];
    }

    handleUpdatePassage(activePassageIndex, { questions: nextQuestions });
  };

  const handleSave = () => {
    toast({
        title: "IELTS Reading Configuration Saved",
        description: "Your reading passages and metadata have been synced.",
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/exam-service/ielts">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
              <BookOpen className="h-8 w-8 text-violet-500" />
              READING SECTION MAPPER
            </h1>
            <p className="text-muted-foreground font-medium">Configure complex passages, metadata, and linked question payloads.</p>
          </div>
        </div>
        <Button onClick={handleSave} className="h-12 px-8 rounded-xl shadow-xl shadow-violet-500/10 gap-2 font-bold hover:scale-[1.02] transition-transform bg-violet-600 hover:bg-violet-700 text-white">
          <Save className="h-5 w-5" />
          SYNC READING DATA
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar Passage Selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-4 bg-violet-500/5 border-2 border-dashed border-violet-500/20 rounded-2xl mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600/60">Reading Hierarchy</span>
            <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="bg-violet-500/10 text-violet-700 border-violet-500/20 px-3 h-6 rounded-full font-black text-[10px]">SECTION 01</Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground px-3 h-6 rounded-full font-black text-[10px]">v1.2.0</Badge>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-400px)] -mx-2 px-2">
            <div className="space-y-3">
                {readingSection.passages.map((passage, index) => (
                    <button
                    key={passage.id}
                    onClick={() => setActivePassageIndex(index)}
                    className={cn(
                        "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden",
                        activePassageIndex === index 
                        ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20" 
                        : "bg-card border-border hover:border-violet-500/40 hover:bg-violet-500/5"
                    )}
                    >
                    <div className="flex items-center gap-3 relative z-10">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner shrink-0",
                            activePassageIndex === index ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        )}>
                        {passage.passageNumber}
                        </div>
                        <div className="overflow-hidden">
                        <p className="font-black text-sm uppercase tracking-tight truncate">
                            {passage.title || `Passage ${passage.passageNumber}`}
                        </p>
                        <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            activePassageIndex === index ? "text-white/70" : "text-muted-foreground"
                        )}>
                            {passage.questions.length} Questions Linked
                        </p>
                        </div>
                    </div>
                    {activePassageIndex === index && (
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <FileText className="h-16 w-16" />
                        </div>
                    )}
                    </button>
                ))}
            </div>
          </ScrollArea>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 border-dashed border-violet-500/30 text-violet-600 font-black tracking-widest text-xs gap-2 hover:bg-violet-50 transition-colors"
            onClick={handleAddPassage}
          >
            <Plus className="h-4 w-4" />
            DEPLOY NEW PASSAGE
          </Button>
        </div>

        {/* Focused Work Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full grid grid-cols-3 mb-6 border ring-offset-background border-muted shadow-sm">
                <TabsTrigger value="content" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <FileText className="h-4 w-4" />
                    Passage Data
                </TabsTrigger>
                <TabsTrigger value="mapping" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <Layers className="h-4 w-4" />
                    Question Mapping ({readingSection.passages[activePassageIndex].questions.length})
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    Live Preview
                </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
                <Card className="border-none shadow-2xl overflow-hidden rounded-3xl ring-4 ring-violet-500/5">
                    <CardHeader className="bg-muted/30 p-8 border-b">
                        <div className="flex items-center justify-between text-violet-700">
                            <div>
                                <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Reading Passage: {readingSection.passages[activePassageIndex].passageNumber}</CardTitle>
                                <CardDescription className="text-base font-medium">Input the source text and metadata for this tactical segment.</CardDescription>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 border border-violet-200">
                                <AlignLeft className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">PASSAGE TITLE (INTERNAL & DISPLAY)</Label>
                            <div className="relative group">
                                <Input 
                                    placeholder="e.g., The Impact of Renewable Energy on Urban Infrastructure" 
                                    className="h-14 pl-12 rounded-2xl border-2 border-muted bg-muted/5 group-focus-within:border-violet-500/50 transition-all font-bold text-lg"
                                    value={readingSection.passages[activePassageIndex].title}
                                    onChange={(e) => handleUpdatePassage(activePassageIndex, { title: e.target.value })}
                                />
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-violet-600 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">MAIN PASSAGE CONTENT (RAW PAYLOAD)</Label>
                                <Badge variant="secondary" className="bg-violet-50 text-violet-600 font-bold text-[9px]">SUPPORTS HTML/MARKDOWN</Badge>
                            </div>
                            <Textarea 
                                placeholder="Paste the full passage text content here..." 
                                className="min-h-[400px] p-6 rounded-3xl border-2 border-muted bg-muted/5 focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50 transition-all font-medium leading-relaxed resize-none text-base"
                                value={readingSection.passages[activePassageIndex].content}
                                onChange={(e) => handleUpdatePassage(activePassageIndex, { content: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="mapping">
                <Card className="border-none shadow-2xl overflow-hidden rounded-3xl ring-4 ring-violet-500/5">
                    <CardHeader className="bg-violet-600 p-8 text-white border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Question Assignment Matrix</CardTitle>
                                <CardDescription className="text-white/80 font-medium">Link specific question payloads to Passage {readingSection.passages[activePassageIndex].passageNumber}.</CardDescription>
                            </div>
                            <Layout className="h-10 w-10 text-white/30" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">STRATEGIC PAYLOADS</Label>
                            </div>
                            <Button 
                                className="rounded-xl font-bold h-11 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 gap-2"
                                onClick={() => setIsQuestionPickerOpen(true)}
                            >
                                <Plus className="h-5 w-5" />
                                CONFIGURE QUESTION STREAM
                            </Button>
                        </div>

                        <div className="grid gap-3">
                            {readingSection.passages[activePassageIndex].questions.length > 0 ? (
                                readingSection.passages[activePassageIndex].questions.map((q, qIndex) => (
                                    <div 
                                        key={q.id} 
                                        className="p-5 rounded-2xl border-2 border-muted bg-muted/5 flex items-center justify-between group hover:border-violet-500/30 hover:bg-violet-500/5 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-muted/50 dark:bg-muted/10 flex items-center justify-center font-black text-xs text-muted-foreground border">
                                                Q{qIndex + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold line-clamp-1 truncate max-w-md" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] uppercase font-black bg-white dark:bg-background h-5 px-2">{q.type}</Badge>
                                                    <Badge variant="outline" className="text-[9px] uppercase font-black bg-violet-50 text-violet-700 h-5 px-2 border-violet-200">{q.difficulty}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                            onClick={() => toggleQuestionSelection(q)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] bg-muted/5 opacity-60">
                                    <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Zero questions linked to this passage</p>
                                    <Button variant="link" onClick={() => setIsQuestionPickerOpen(true)} className="mt-2 font-black text-violet-600 uppercase text-xs">Authorize Mapping Protocol</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="preview">
                <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-320px)]">
                    <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex flex-col">
                        <CardHeader className="bg-violet-600 p-6 text-white shrink-0">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 italic">
                                <AlignLeft className="h-5 w-5" />
                                {readingSection.passages[activePassageIndex].title || "Untitled Passage"}
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 bg-white dark:bg-muted/5 p-10">
                            <div 
                                className="prose prose-violet dark:prose-invert max-w-none font-medium leading-relaxed text-lg"
                                dangerouslySetInnerHTML={{ __html: readingSection.passages[activePassageIndex].content || "<p className='opacity-30 italic'>No content provided for this passage.</p>" }} 
                            />
                        </ScrollArea>
                    </Card>

                    <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] flex flex-col bg-muted/5 border-2 border-dashed">
                        <CardHeader className="p-6 border-b shrink-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-tight italic text-muted-foreground flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                ASSOCIATED PAYLOADS
                            </CardTitle>
                            <Badge variant="outline" className="font-black h-6">{readingSection.passages[activePassageIndex].questions.length} Items</Badge>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-8">
                            <div className="space-y-6">
                                {readingSection.passages[activePassageIndex].questions.length > 0 ? (
                                    readingSection.passages[activePassageIndex].questions.map((q, i) => (
                                        <div key={q.id} className="space-y-4 p-6 bg-card border-2 rounded-3xl shadow-sm relative group">
                                            <div className="absolute -left-3 top-6 h-8 w-10 bg-violet-600 text-white flex items-center justify-center font-black rounded-r-xl shadow-lg shadow-violet-500/20">
                                                {i + 1}
                                            </div>
                                            <div className="pl-8">
                                                <p className="font-bold text-lg leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                                                <div className="grid gap-2">
                                                    {q.options?.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/5">
                                                            <div className="h-6 w-6 rounded-lg border-2 flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <span className="text-sm font-medium">{opt.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                                        <Search className="h-12 w-12 mb-4" />
                                        <p>No questions mapped to this segment.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Question Selection Dialog */}
      <Dialog open={isQuestionPickerOpen} onOpenChange={setIsQuestionPickerOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col rounded-[3rem] border-none shadow-[0_35px_60px_-15px_rgba(139,92,246,0.3)] p-0 overflow-hidden ring-1 ring-violet-500/20">
          <DialogHeader className="p-10 pb-2 flex flex-col items-start bg-violet-600 text-white">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Layers className="h-6 w-6" />
                </div>
                <div>
                    <DialogTitle className="text-3xl font-black italic tracking-tight uppercase">Strategic Bank Audit</DialogTitle>
                    <DialogDescription className="text-white/70 font-medium text-base">Select question payloads for the Reading repository.</DialogDescription>
                </div>
            </div>
            
            <div className="relative w-full mt-8 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <Input 
                    placeholder="Search all accessible IELTS repositories..." 
                    className="h-16 pl-14 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20 focus-visible:border-white/50 transition-all font-bold text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-10 py-8 bg-background">
            <div className="grid gap-3 pb-8">
              {filteredQuestions.length > 0 ? filteredQuestions.map(q => {
                const isSelected = readingSection.passages[activePassageIndex].questions.some(sq => sq.id === q.id);
                return (
                  <div 
                    key={q.id}
                    onClick={() => toggleQuestionSelection(q)}
                    className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                        isSelected 
                        ? "border-violet-600 bg-violet-500/5 ring-4 ring-violet-500/5 shadow-sm" 
                        : "border-muted bg-muted/5 hover:border-violet-500/30"
                    )}
                  >
                    <div className="flex items-center gap-5 flex-1 pr-6">
                        <div className={cn(
                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                            isSelected ? "bg-violet-600 border-violet-600" : "border-muted-foreground/30 group-hover:border-violet-500/50"
                        )}>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                        <div className="space-y-1 text-left">
                            <p className="font-bold text-base leading-snug" dangerouslySetInnerHTML={{ __html: q.text || '' }} />
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-[10px] font-black tracking-widest uppercase bg-violet-100 text-violet-700 h-6 px-3 rounded-full">{q.type}</Badge>
                                {q.topic && <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase h-6 px-3 rounded-full border-muted-foreground/20">{Array.isArray(q.topic) ? q.topic[0] : q.topic}</Badge>}
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter ml-2 opacity-50">ID: {q.id.split('-').slice(-1)}</span>
                            </div>
                        </div>
                    </div>
                    {isSelected && (
                        <div className="flex items-center gap-2 shrink-0">
                             <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                             <span className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em]">LINKED</span>
                        </div>
                    )}
                  </div>
                );
              }) : (
                <div className="py-24 text-center space-y-4 opacity-40">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="font-black uppercase tracking-[0.3em] text-sm">Signal Lost in Bank Subspace</p>
                    <p className="text-xs font-bold uppercase text-muted-foreground/60 tracking-widest leading-relaxed">Adjust search frequency or re-sync bank data</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-10 bg-muted/20 border-t-2 border-muted flex items-center justify-between">
            <div className="flex gap-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter mb-1">Passage Index</span>
                    <span className="text-3xl font-black text-violet-600">#{readingSection.passages[activePassageIndex].passageNumber}</span>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block mt-1" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter mb-1">Stream Payload</span>
                    <span className="text-3xl font-black text-foreground">{readingSection.passages[activePassageIndex].questions.length} / 15</span>
                </div>
            </div>
            <DialogClose asChild>
                <Button className="h-16 px-12 rounded-3xl font-black text-lg bg-violet-600 hover:bg-violet-700 text-white shadow-2xl shadow-violet-500/30 tracking-tight transition-transform active:scale-95">
                    CONFIRM CONFIGURATION
                </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
