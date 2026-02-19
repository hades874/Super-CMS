
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  SkipForward, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  Volume2,
  BookOpen,
  PenTool,
  Mic2,
  LayoutDashboard,
  FileText,
  Headphones,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  IeltsExam, 
  IeltsExamAttempt, 
  IeltsSectionAttempt, 
  IeltsSectionType 
} from '@/types/ielts-exam';
import type { Question } from '@/types';

export default function IeltsExamPlayer() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { exams, questions: ieltsQuestionsRepo, allQuestions, addAttempt } = useIeltsRepository();
  
  const ieltsQuestionsBank = useMemo(() => {
    const combined = [...allQuestions, ...ieltsQuestionsRepo];
    // Remove duplicates by ID
    const uniqueMap = new Map();
    combined.forEach(q => uniqueMap.set(q.id, q));
    return Array.from(uniqueMap.values()).filter(q => {
        const subjects = Array.isArray(q.subject) ? q.subject : [String(q.subject)];
        const hasIeltsSubject = subjects.some(s => s?.toUpperCase() === 'IELTS');
        return hasIeltsSubject || q.type === 'ielts' || String(q.type).startsWith('ielts');
    });
  }, [allQuestions, ieltsQuestionsRepo]);
  
  const exam = useMemo(() => exams.find(e => e.id === id), [exams, id]);
  
  const [activeSection, setActiveSection] = useState<IeltsSectionType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [attempt, setAttempt] = useState<Partial<IeltsExamAttempt>>({
    id: `attempt-${Date.now()}`,
    examId: id as string,
    startTime: new Date().toISOString(),
    status: 'In Progress',
    sections: {}
  });

  const [writingContent, setWritingContent] = useState<Record<string, string>>({});
  const [isReadingSplit, setIsReadingSplit] = useState(true);

  // Load questions for the active section
  const sectionQuestions = useMemo(() => {
    if (!activeSection || !exam) return [];
    const sectionKey = activeSection.toLowerCase() as keyof IeltsExam['sections'];
    const config = exam.sections[sectionKey];
    if (!config || !config.included || config.questionSetIds.length === 0) return [];

    return ieltsQuestionsBank.filter(q => {
      const subjects = Array.isArray(q.subject) ? q.subject : [String(q.subject || '')];
      const examSets = Array.isArray(q.exam_set) ? q.exam_set : [String(q.exam_set || '')];
      const topics = Array.isArray(q.topic) ? q.topic : [String(q.topic || '')];
      
      let qCode = subjects.find(s => s?.includes('-SET-') || s?.match(/^[LRWS]-/)) || 
                  examSets.find(s => s && s !== 'undefined' && s !== '') || 
                  topics.find(s => s && s !== 'undefined' && s !== '');

      if (!qCode) {
          const part = subjects.find(s => ['Listening', 'Reading', 'Writing', 'Speaking'].includes(s || ''));
          if (part) qCode = `${part.toUpperCase()}-GENERAL-POOL`;
      }

      return qCode && config.questionSetIds.includes(qCode);
    });
  }, [activeSection, exam, ieltsQuestionsBank]);

  // Passage extraction: If a question has type 'ielts-passage' or very large text with no options
  const passage = useMemo(() => {
    if (activeSection !== 'Reading') return null;
    // Look for a question in the current set that might be a passage
    // Often it's the first one in a group, or has a specific topic
    const possiblePassage = sectionQuestions.find(q => 
        (q.text && q.text.length > 500 && (!q.options || q.options.length === 0)) || 
        q.type === 'ielts' && String(q.topic).toLowerCase().includes('passage')
    );
    return possiblePassage ? possiblePassage.text : null;
  }, [activeSection, sectionQuestions]);

  // Timer logic
  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const startSection = useCallback((type: IeltsSectionType) => {
    const sectionKey = type.toLowerCase() as keyof IeltsExam['sections'];
    const config = exam!.sections[sectionKey];
    
    setActiveSection(type);
    setTimeLeft(config.timingMinutes * 60);
    setCurrentQuestionIndex(0);
    
    setAttempt(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          sectionType: type,
          skipped: false,
          startTime: new Date().toISOString(),
          answers: {}
        }
      }
    }));
  }, [exam]);

  const skipSection = () => {
    if (!activeSection) return;
    const sectionKey = activeSection.toLowerCase() as keyof IeltsExam['sections'];
    setAttempt(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: {
          sectionType: activeSection,
          skipped: true,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          answers: {}
        }
      }
    }));
    toast({ title: `${activeSection} Skipped`, description: "Moving to next operational sector." });
    moveToNextSection();
  };

  const moveToNextSection = () => {
    const sectionOrder: IeltsSectionType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];
    const currentIndex = sectionOrder.indexOf(activeSection!);
    for (let i = currentIndex + 1; i < sectionOrder.length; i++) {
        const nextType = sectionOrder[i];
        const nextKey = nextType.toLowerCase() as keyof IeltsExam['sections'];
        if (exam?.sections[nextKey].included) {
            startSection(nextType);
            return;
        }
    }
    finishExam();
  };

  const finishExam = () => {
    const finalAttempt = {
      ...attempt,
      status: 'Completed',
      endTime: new Date().toISOString()
    } as IeltsExamAttempt;
    addAttempt(finalAttempt);
    toast({ title: "Mission Successful", description: "Report finalized and archived." });
    router.push(`/exam-service/ielts/results/${finalAttempt.id}`);
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const sectionKey = activeSection!.toLowerCase() as keyof IeltsExam['sections'];
    setAttempt(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [sectionKey]: {
          ...prev.sections![sectionKey],
          answers: { ...prev.sections![sectionKey].answers, [questionId]: value }
        }
      }
    }));
    if (activeSection === 'Writing') {
        setWritingContent(prev => ({ ...prev, [questionId]: value as string }));
    }
  };

  if (!exam) return <div className="h-screen flex items-center justify-center bg-[#080808] text-primary font-black italic uppercase tracking-widest">Target Repository Missing</div>;

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-12 font-sans selection:bg-primary selection:text-white">
         <Card className="max-w-4xl w-full border-none bg-[#111111] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[48px] overflow-hidden group">
            <CardHeader className="bg-primary p-16 text-primary-foreground text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               <div className="relative z-10 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-[32px] bg-white/10 backdrop-blur-xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                     <FileText className="h-12 w-12" />
                  </div>
                  <Badge className="bg-white/20 text-white font-black px-6 py-1.5 rounded-full uppercase text-[10px] tracking-[0.4em] mb-4 border-none backdrop-blur-md">Tactical Assessment Link</Badge>
                  <CardTitle className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-4">{exam.title}</CardTitle>
                  <CardDescription className="text-primary-foreground/50 font-black uppercase text-xs tracking-[0.3em]">
                     Ref: {exam.examCode} • {exam.ieltsCategory} Configuration
                  </CardDescription>
               </div>
            </CardHeader>
            <CardContent className="p-16 space-y-16">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(exam.sections).map(([key, config]) => (
                    config.included && (
                      <div key={key} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/[0.05] flex flex-col items-center text-center gap-4 group/item hover:bg-white/[0.06] hover:border-primary/20 transition-all duration-300">
                         <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover/item:scale-110 transition-transform">
                            {key === 'listening' && <Headphones className="h-6 w-6" />}
                            {key === 'reading' && <BookOpen className="h-6 w-6" />}
                            {key === 'writing' && <PenTool className="h-6 w-6" />}
                            {key === 'speaking' && <Mic2 className="h-6 w-6" />}
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em]">{key}</p>
                            <p className="text-lg font-black text-white italic">{config.timingMinutes} MINS</p>
                         </div>
                      </div>
                    )
                  ))}
               </div>
               
               <div className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                      <div className="h-2 w-10 bg-primary rounded-full" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Mission Protocols</h4>
                  </div>
                  <div className="text-sm font-bold leading-relaxed bg-white/[0.02] p-10 rounded-[40px] border-2 border-dashed border-white/5 text-muted-foreground/80 italic text-center max-w-2xl mx-auto">
                     {exam.instructions || "Maintain operational focus. Audio feeds will trigger automatically in synchronized sectors. Use the sidebar hierarchy to monitor progression. Finalize all segments before the timer cycles to zero."}
                  </div>
               </div>
            </CardContent>
            <CardFooter className="p-16 pt-0">
               <Button 
                onClick={() => {
                  setIsStarted(true);
                  const order: IeltsSectionType[] = ['Listening', 'Reading', 'Writing', 'Speaking'];
                  const first = order.find(t => exam.sections[t.toLowerCase() as keyof IeltsExam['sections']].included);
                  if (first) startSection(first);
                }}
                className="w-full h-20 rounded-[32px] shadow-2xl shadow-primary/30 font-black text-lg uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground group"
               >
                 Authorize Ingress
                 <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
               </Button>
            </CardFooter>
         </Card>
      </div>
    );
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const currentQuestion = sectionQuestions[currentQuestionIndex];
  const secKey = activeSection!.toLowerCase() as keyof IeltsExam['sections'];
  const curAnswers = attempt.sections![secKey]?.answers || {};

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Header HUB */}
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#0c0c0c]/80 backdrop-blur-2xl z-20">
         <div className="flex items-center gap-8">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
               {activeSection === 'Listening' && <Headphones className="h-7 w-7" />}
               {activeSection === 'Reading' && <BookOpen className="h-7 w-7" />}
               {activeSection === 'Writing' && <PenTool className="h-7 w-7" />}
               {activeSection === 'Speaking' && <Mic2 className="h-7 w-7" />}
            </div>
            <div>
               <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">{activeSection} Phase</h2>
                  <Badge variant="outline" className="h-5 px-3 rounded-full border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{exam.examCode}</Badge>
               </div>
               <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-1 italic">{exam.title}</p>
            </div>
         </div>

         <div className="flex items-center gap-10">
            <div className={`flex items-center gap-4 px-8 py-3 rounded-2xl font-black text-2xl tabular-nums border-2 ${timeLeft < 300 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-white/[0.03] text-white border-white/10 shadow-inner'}`}>
               <Clock className="h-6 w-6 opacity-40" />
               {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    onClick={skipSection}
                    className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] gap-3 hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
                >
                   <SkipForward className="h-4 w-4" />
                   Bypass
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => { if(confirm("Abort Mission?")) router.push('/exam-service/ielts/dashboard')}}
                    className="h-12 w-12 rounded-2xl hover:bg-red-500/10 hover:text-red-500 border border-white/5 hover:border-red-500/20"
                >
                   <LogOut className="h-5 w-5" />
                </Button>
            </div>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
          {/* Tactical Sidebar */}
          <aside className="w-96 border-r border-white/5 bg-[#080808] flex flex-col p-10 gap-10">
             <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Progression</h3>
                   <span className="text-[11px] font-black text-primary tracking-widest">{Math.round((Object.keys(curAnswers).length / sectionQuestions.length) * 100 || 0)}% Complete</span>
                </div>
                <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-0.5">
                   <div className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(var(--primary),0.5)]" style={{ width: `${(Object.keys(curAnswers).length / sectionQuestions.length) * 100}%` }} />
                </div>
                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Status Check</span>
                   <span className="text-xs font-black italic">{Object.keys(curAnswers).length} / {sectionQuestions.length} Elements Logged</span>
                </div>
             </div>

             <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="grid grid-cols-4 gap-3">
                   {sectionQuestions.map((q, i) => (
                     <button
                         key={q.id}
                         onClick={() => setCurrentQuestionIndex(i)}
                         className={`h-14 rounded-2xl text-[13px] font-black transition-all border-2 flex items-center justify-center ${
                             currentQuestionIndex === i 
                                 ? 'bg-primary text-primary-foreground border-primary shadow-[0_10px_20px_rgba(var(--primary),0.2)] scale-105 z-10' 
                                 : curAnswers[q.id] 
                                     ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                     : 'bg-white/[0.03] border-white/[0.05] text-muted-foreground/50 hover:border-white/20'
                         }`}
                     >
                         {String(i + 1).padStart(2, '0')}
                     </button>
                   ))}
                </div>
             </ScrollArea>

             <Button onClick={moveToNextSection} className="h-16 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 gap-4 group bg-primary text-primary-foreground">
                Finalize Phase
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
             </Button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden flex flex-col bg-[#050505]">
             {activeSection === 'Reading' && passage && isReadingSplit ? (
                <div className="flex-1 flex overflow-hidden">
                   {/* Passage Pane */}
                   <div className="w-1/2 border-r border-white/5 overflow-y-auto p-12 bg-[#070707]">
                      <div className="max-w-2xl mx-auto space-y-8">
                         <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">Reading Segment Content</Badge>
                            <Button variant="ghost" size="sm" onClick={() => setIsReadingSplit(false)} className="text-[10px] font-black uppercase text-muted-foreground hover:text-white">Full View</Button>
                         </div>
                         <div 
                            className="prose prose-invert prose-lg max-w-none text-muted-foreground/90 font-medium leading-[1.8] italic selection:bg-violet-500/30"
                            dangerouslySetInnerHTML={{ __html: passage }}
                         />
                      </div>
                   </div>
                   {/* Question Pane */}
                   <div className="w-1/2 overflow-y-auto p-12 bg-[#050505]">
                      <div className="max-w-xl mx-auto">
                         {renderQuestionCard()}
                      </div>
                   </div>
                </div>
             ) : (
                <ScrollArea className="flex-1 p-16">
                   <div className="max-w-4xl mx-auto">
                      {activeSection === 'Listening' && (
                         <div className="mb-12 bg-white/[0.03] border border-white/10 p-8 rounded-[40px] flex items-center justify-between shadow-2xl">
                             <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-3xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                                   <Play className="h-8 w-8 ml-1" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-1">Incoming Signal Feed</p>
                                   <h4 className="text-xl font-black uppercase italic tracking-tighter">Audio Stream Active</h4>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <div className="h-1 bg-primary/20 w-48 rounded-full overflow-hidden mt-4">
                                   <div className="h-full bg-primary w-1/3 animate-pulse" />
                                </div>
                             </div>
                         </div>
                      )}
                      {renderQuestionCard()}
                   </div>
                </ScrollArea>
             )}
          </main>
      </div>
    </div>
  );

  function renderQuestionCard() {
    if (!currentQuestion) return (
      <div className="h-[600px] flex flex-col items-center justify-center space-y-8 bg-white/[0.02] rounded-[56px] border-2 border-dashed border-white/5">
         <div className="h-28 w-28 rounded-[40px] bg-red-500/5 flex items-center justify-center text-red-500/20 border border-red-500/10">
            <AlertCircle className="h-12 w-12 animate-pulse" />
         </div>
         <div className="text-center space-y-3">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Data Link Severed</h3>
            <p className="text-sm font-bold text-muted-foreground/60 max-w-md mx-auto leading-relaxed uppercase tracking-widest">Unable to synchronize with the requested question asset from the repository.</p>
         </div>
         <Button onClick={moveToNextSection} variant="outline" className="h-16 px-10 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] border-white/10 hover:bg-white/5 text-primary">
            Engage Next Sector
         </Button>
      </div>
    );

    return (
      <Card className="border-white/[0.05] bg-[#111111] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] rounded-[48px] overflow-hidden">
         <CardHeader className="p-12 border-b border-white/[0.05] bg-[#141414]">
            <div className="flex justify-between items-center mb-8">
               <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-6 py-2 rounded-full uppercase text-[11px] tracking-[0.2em] shadow-inner">ITEM {currentQuestionIndex + 1}</Badge>
               <div className="flex gap-3">
                  <Badge variant="outline" className="border-white/10 text-muted-foreground/40 font-black uppercase text-[10px] px-4 py-1.5 rounded-xl">{currentQuestion.type}</Badge>
                  {currentQuestion.difficulty && <Badge className={`${currentQuestion.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} font-black uppercase text-[10px] px-4 py-1.5 rounded-xl border`}>{currentQuestion.difficulty}</Badge>}
               </div>
            </div>
            <h3 className="text-3xl font-black leading-tight text-white tracking-tight italic" dangerouslySetInnerHTML={{ __html: currentQuestion.text || '' }} />
            {currentQuestion.explanation && <p className="mt-8 text-sm font-bold text-muted-foreground/50 border-l-4 border-primary/20 pl-6 italic leading-relaxed">{currentQuestion.explanation}</p>}
         </CardHeader>
         <CardContent className="p-12">
            {currentQuestion.image && (
                <div className="mb-12 rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl">
                    <img src={currentQuestion.image} alt="Ref Image" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
            )}
            
            <div className="space-y-8">
              {activeSection === 'Writing' ? (
                <div className="space-y-6">
                   <div className="flex items-center justify-between items-center mb-2 px-2">
                       <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Operational Payload Response</Label>
                       <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest">{writingContent[currentQuestion.id]?.split(/\s+/).filter(x => x).length || 0} WORDS</span>
                   </div>
                   <Textarea 
                     value={writingContent[currentQuestion.id] || ''}
                     onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                     placeholder="Commence transmission..."
                     className="min-h-[450px] text-xl font-bold rounded-[40px] p-10 border-white/10 focus-visible:ring-primary/20 bg-white/[0.02] text-white placeholder:text-white/5 leading-relaxed selection:bg-primary/30"
                   />
                </div>
              ) : currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                   {currentQuestion.options.map((opt, idx) => (
                     <button
                         key={idx}
                         onClick={() => handleAnswerChange(currentQuestion.id, opt.text || '')}
                         className={`group p-8 rounded-[32px] border-2 text-left transition-all flex items-center gap-8 ${
                             curAnswers[currentQuestion.id] === opt.text
                                 ? 'bg-primary/10 border-primary shadow-2xl shadow-primary/10 scale-[1.01]'
                                 : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.05] hover:border-white/10'
                         }`}
                     >
                         <div className={`h-10 w-10 rounded-2xl border-4 flex items-center justify-center transition-all ${
                             curAnswers[currentQuestion.id] === opt.text ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/40' : 'border-white/10 group-hover:border-white/20'
                         }`}>
                            {curAnswers[currentQuestion.id] === opt.text ? (
                                <CheckCircle className="h-6 w-6" />
                            ) : (
                                <span className="text-xs font-black opacity-40">{String.fromCharCode(65 + idx)}</span>
                            )}
                         </div>
                         <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 ${curAnswers[currentQuestion.id] === opt.text ? 'text-primary' : 'text-muted-foreground/30'}`}>Option {String.fromCharCode(65 + idx)}</span>
                            <span className={`text-xl font-black ${curAnswers[currentQuestion.id] === opt.text ? 'text-white' : 'text-muted-foreground/70'}`}>{opt.text}</span>
                         </div>
                     </button>
                   ))}
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="flex items-center gap-3 mb-2 px-2">
                      <div className="h-4 w-1 bg-primary rounded-full" />
                      <Label className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Direct Input Field</Label>
                   </div>
                   <Input 
                     value={curAnswers[currentQuestion.id] as string || ''}
                     onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                     placeholder="Type required response..."
                     className="h-20 text-2xl font-black rounded-[28px] px-10 border-white/10 focus-visible:ring-primary/20 bg-white/[0.02] text-white placeholder:text-white/5 shadow-inner italic"
                   />
                </div>
              )}
            </div>
         </CardContent>
         <CardFooter className="p-10 bg-[#141414] flex justify-between border-t border-white/[0.05]">
            <Button 
             variant="ghost" 
             disabled={currentQuestionIndex === 0}
             onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
             className="h-14 rounded-2xl font-black gap-4 text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 px-8"
            >
               <ChevronLeft className="h-5 w-5" /> Previous Signal
            </Button>
            <Button 
             disabled={currentQuestionIndex === sectionQuestions.length - 1}
             onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
             className="h-14 rounded-2xl font-black gap-4 px-12 text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/10 bg-primary text-primary-foreground group"
            >
               Forward Stream <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
         </CardFooter>
      </Card>
    );
  }
}
