
'use client';

import { useMemo, useState } from 'react';
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Clock,
  LayoutDashboard,
  Eye,
  ArrowRight,
  Headphones,
  BookOpen,
  PenTool,
  Mic2,
  AlertCircle,
  FileText,
  ChevronRight,
  Layers,
  Search
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { IeltsExam, IeltsExamAttempt, IeltsSectionType } from '@/types/ielts-exam';
import type { Question } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function IeltsResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { exams, attempts, questions: ieltsQuestionsRepo, allQuestions } = useIeltsRepository();
  const [selectedWriting, setSelectedWriting] = useState<{question: Question, answer: string} | null>(null);
  
  const ieltsQuestionsBank = useMemo(() => {
    const combined = [...allQuestions, ...ieltsQuestionsRepo];
    // De-duplicate
    const uniqueMap = new Map();
    combined.forEach(q => uniqueMap.set(q.id, q));
    return Array.from(uniqueMap.values()).filter(q => {
        const subjects = Array.isArray(q.subject) ? q.subject : [String(q.subject)];
        const hasIeltsSubject = subjects.some(s => s?.toUpperCase() === 'IELTS');
        return hasIeltsSubject || q.type === 'ielts' || String(q.type).startsWith('ielts');
    });
  }, [allQuestions, ieltsQuestionsRepo]);

  const attempt = useMemo(() => attempts.find(a => a.id === id), [attempts, id]);
  const exam = useMemo(() => exams.find(e => e?.id === attempt?.examId), [exams, attempt]);

  const getBandScore = (raw: number, sectionType: IeltsSectionType) => {
    if (sectionType === 'Listening' || sectionType === 'Reading') {
       if (raw >= 39) return 9.0;
       if (raw >= 37) return 8.5;
       if (raw >= 35) return 8.0;
       if (raw >= 32) return 7.5;
       if (raw >= 30) return 7.0;
       if (raw >= 26) return 6.5;
       if (raw >= 23) return 6.0;
       if (raw >= 18) return 5.5;
       if (raw >= 15) return 5.0;
       if (raw >= 12) return 4.5;
       if (raw >= 10) return 4.0;
       return 0; // Logic for very low scores
    }
    return 0;
  };

  const results = useMemo(() => {
    if (!attempt || !exam) return null;

    const sectionsData: Record<string, {
      raw: number,
      total: number,
      band: number,
      skipped: boolean,
      timeTaken: string,
      type: IeltsSectionType,
      answers: Record<string, string | string[]>,
      questions: Question[]
    }> = {};

    let totalBandScore = 0;
    let includedSectionsCount = 0;

    Object.entries(attempt.sections).forEach(([key, section]) => {
      const sectionKey = key as keyof IeltsExam['sections'];
      const config = exam.sections[sectionKey];

      if (section.skipped) {
        sectionsData[key] = { raw: 0, total: 0, band: 0, skipped: true, timeTaken: 'Skipped', type: section.sectionType, answers: {}, questions: [] };
        return;
      }

      const sectionQuestions = ieltsQuestionsBank.filter(q => {
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

      let correct = 0;
      Object.entries(section.answers).forEach(([qid, ans]) => {
        const qData = sectionQuestions.find(q => q.id === qid);
        if (qData) {
            const isCorrect = String(qData.answer || '').toLowerCase().trim() === String(ans || '').toLowerCase().trim();
            if (isCorrect) correct++;
        }
      });

      const band = getBandScore(correct, section.sectionType);
      sectionsData[key] = {
        raw: correct,
        total: sectionQuestions.length,
        band,
        skipped: false,
        type: section.sectionType,
        answers: section.answers,
        questions: sectionQuestions,
        timeTaken: section.startTime && section.endTime ? 
            `${Math.max(1, Math.floor((new Date(section.endTime).getTime() - new Date(section.startTime).getTime()) / 60000))} mins` : 'N/A'
      };

      if (section.sectionType === 'Listening' || section.sectionType === 'Reading') {
          totalBandScore += band;
          includedSectionsCount++;
      }
    });

    return {
      sections: sectionsData,
      overallBand: includedSectionsCount > 0 ? (Math.round((totalBandScore / includedSectionsCount) * 2) / 2).toFixed(1) : "N/A",
      sectionCount: includedSectionsCount
    };
  }, [attempt, exam, ieltsQuestionsBank]);

  if (!attempt || !exam || !results) return (
    <div className="flex-1 flex flex-col items-center justify-center p-20 bg-[#080808] text-white">
        <div className="h-20 w-20 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-500/40 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Operational Data Corrupted</h2>
        <p className="text-sm text-muted-foreground/60 mt-2 font-bold uppercase tracking-widest">Unable to synchronize with attempt record: {id}</p>
        <Link href="/exam-service/ielts/dashboard" className="mt-12">
            <Button variant="outline" className="h-14 px-10 rounded-2xl border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/5">Return to Command Hub</Button>
        </Link>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col gap-10 p-12 max-w-6xl mx-auto bg-[#080808] min-h-screen font-sans selection:bg-primary selection:text-white">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div className="space-y-4">
            <Link href="/exam-service/ielts/dashboard">
               <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary/60 hover:text-primary gap-2 font-black text-[10px] tracking-[0.4em] mb-2 group transition-all">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" /> BACK TO COMMAND HUB
               </Button>
            </Link>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">After Action Report</h1>
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground/60 font-black px-4 py-1 rounded-full uppercase text-[9px] tracking-widest">{exam.examCode}</Badge>
                <p className="text-xs text-muted-foreground/40 font-black uppercase tracking-[0.3em]">{exam.title}</p>
            </div>
         </div>
         <div className="flex gap-4">
            <Button variant="outline" className="h-14 px-8 rounded-2xl font-black text-[10px] tracking-widest uppercase border-white/10 hover:bg-white/5 group bg-white/5">
               <Search className="h-4 w-4 mr-3 opacity-40 group-hover:scale-110 transition-transform" /> DEEP SCAN LOGS
            </Button>
            <Button className="h-14 px-10 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-2xl shadow-primary/20 bg-primary text-primary-foreground">
               <TrendingUp className="h-4 w-4 mr-3" /> ARCHIVE INTEL
            </Button>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-4 border-none bg-primary shadow-[0_40px_80px_-15px_rgba(var(--primary),0.3)] rounded-[56px] flex flex-col items-center justify-center p-16 text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px] opacity-40 group-hover:scale-150 transition-transform duration-1000" />
             <div className="h-20 w-20 rounded-[32px] bg-white/20 flex items-center justify-center mb-10 border border-white/30 backdrop-blur-xl shadow-xl group-hover:rotate-12 transition-transform">
                <Award className="h-10 w-10 text-white" />
             </div>
             <p className="border-b border-white/20 pb-4 mb-8 w-full text-[11px] font-black uppercase tracking-[0.5em] text-white/60">Estimated Overall Band</p>
             <h2 className="text-[140px] font-black tracking-tighter leading-none italic text-white drop-shadow-2xl">{results.overallBand}</h2>
             <div className="mt-10 flex flex-col gap-3">
                <Badge className="bg-black/20 text-white/80 font-black text-[10px] px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-black/10 backdrop-blur-md">Tactical Summary</Badge>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{results.sectionCount} Sectors Evaluated</p>
             </div>
          </Card>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
             {Object.entries(results.sections).map(([key, data]) => (
                <div key={key} className="bg-[#111111] border border-white/[0.05] p-8 rounded-[48px] flex flex-col justify-between group hover:bg-[#141414] hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden relative">
                   <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                      {data.type === 'Listening' && <Headphones className="h-32 w-32" />}
                      {data.type === 'Reading' && <BookOpen className="h-32 w-32" />}
                      {data.type === 'Writing' && <PenTool className="h-32 w-32" />}
                      {data.type === 'Speaking' && <Mic2 className="h-32 w-32" />}
                   </div>
                   
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-muted-foreground/30 border border-white/[0.05] group-hover:text-primary group-hover:border-primary/20 transition-all duration-500 shadow-inner">
                         {data.type === 'Listening' && <Headphones className="h-6 w-6" />}
                         {data.type === 'Reading' && <BookOpen className="h-6 w-6" />}
                         {data.type === 'Writing' && <PenTool className="h-6 w-6" />}
                         {data.type === 'Speaking' && <Mic2 className="h-6 w-6" />}
                      </div>
                      <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-2xl border-white/[0.05] ${data.skipped ? 'text-red-500 bg-red-500/5' : 'text-emerald-500 bg-emerald-500/5'}`}>
                         {data.skipped ? 'SKIPPED' : 'VAL-01'}
                      </Badge>
                   </div>
                   
                   <div className="space-y-6 relative z-10">
                      <div>
                         <p className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] mb-2 px-1">{data.type} SEGMENT</p>
                         <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-white italic tracking-tighter">{data.band > 0 ? data.band.toFixed(1) : (data.type === 'Writing' || data.type === 'Speaking' ? '???' : '0.0')}</span>
                            <span className="text-[11px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic">OPERATIONAL BAND</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white/[0.02] p-4 rounded-3xl border border-white/5 shadow-inner">
                            <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest mb-1.5">Raw Precision</p>
                            <p className="text-sm font-black text-white italic">{data.raw} <span className="text-[10px] opacity-30 not-italic">/ {data.total}</span></p>
                         </div>
                         <div className="bg-white/[0.02] p-4 rounded-3xl border border-white/5 shadow-inner">
                            <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest mb-1.5">Sector Time</p>
                            <p className="text-sm font-black text-white italic">{data.timeTaken}</p>
                         </div>
                      </div>

                      {data.type === 'Writing' && data.total > 0 && (
                        <Button 
                            variant="ghost" 
                            onClick={() => {
                                const qid = Object.keys(data.answers)[0];
                                const q = data.questions.find(q => q.id === qid);
                                if (q) setSelectedWriting({ question: q, answer: data.answers[qid] as string });
                            }}
                            className="w-full h-12 rounded-2xl mt-2 border border-white/5 bg-white/5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10"
                        >
                            <Eye className="h-4 w-4 mr-2" /> Inspect Transmission
                        </Button>
                      )}
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Writing Transcript Modal */}
       <Dialog open={!!selectedWriting} onOpenChange={() => setSelectedWriting(null)}>
          <DialogContent className="max-w-4xl bg-[#0c0c0c] border-white/10 rounded-[48px] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
             <DialogHeader className="p-12 bg-primary text-white pb-16">
                <div className="flex items-center gap-4 mb-4">
                    <PenTool className="h-8 w-8" />
                    <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter">Transmission Archive</DialogTitle>
                </div>
                <DialogDescription className="text-primary-foreground/60 font-medium italic text-base">Historical record of candidate writing payload.</DialogDescription>
             </DialogHeader>
             <div className="p-12 -mt-10">
                <Card className="bg-[#111111] border-white/[0.05] rounded-[40px] overflow-hidden shadow-2xl">
                    <CardHeader className="bg-white/[0.02] p-8 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-1.5 w-8 bg-primary rounded-full" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Operation Prompt</h4>
                        </div>
                        <p className="text-lg font-black text-white italic leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedWriting?.question.text || '' }} />
                    </CardHeader>
                    <ScrollArea className="h-[400px] p-10 bg-white/[0.01]">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Payload Content</span>
                                <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">{selectedWriting?.answer.split(/\s+/).filter(x => x).length || 0} Words Detected</span>
                            </div>
                            <p className="text-xl font-medium text-muted-foreground/80 italic leading-[1.8] whitespace-pre-wrap">
                                {selectedWriting?.answer}
                            </p>
                        </div>
                    </ScrollArea>
                    <CardFooter className="p-8 border-t border-white/[0.05] bg-white/[0.02] flex justify-end">
                        <Button onClick={() => setSelectedWriting(null)} className="h-12 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary text-white">Secure Log</Button>
                    </CardFooter>
                </Card>
             </div>
          </DialogContent>
       </Dialog>
    </div>
  );
}
