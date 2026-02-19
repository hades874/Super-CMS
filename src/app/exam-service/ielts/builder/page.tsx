
'use client';

import { useState, useMemo } from 'react';
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Settings, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Zap,
  Shield,
  Activity,
  Globe,
  Database,
  Layers,
  FlaskConical,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { IeltsExam, IeltsExamSectionConfig, IeltsSectionType } from '@/types/ielts-exam';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function IeltsExamBuilder() {
  const router = useRouter();
  const { toast } = useToast();
  const { questions: ieltsQuestions, allQuestions, addExam } = useIeltsRepository();
  
  const ieltsQuestionsBank = useMemo(() => {
    const combined = [...allQuestions, ...ieltsQuestions];
    // Remove duplicates
    const uniqueMap = new Map();
    combined.forEach(q => uniqueMap.set(q.id, q));
    return Array.from(uniqueMap.values()).filter((q: any) => {
        const subjects = Array.isArray(q.subject) ? q.subject : [String(q.subject)];
        const hasIeltsSubject = subjects.some((s: string) => s?.toUpperCase() === 'IELTS');
        return hasIeltsSubject || q.type === 'ielts' || String(q.type).startsWith('ielts');
    });
  }, [allQuestions, ieltsQuestions]);
  
  const [examData, setExamData] = useState<Partial<IeltsExam>>({
    id: `exam-${Date.now()}`,
    examCode: `IELTS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    title: '',
    type: 'Full',
    ieltsCategory: 'Academic',
    status: 'Draft',
    sections: {
      listening: { included: true, questionSetIds: [], timingMinutes: 40 },
      reading: { included: true, questionSetIds: [], timingMinutes: 60 },
      writing: { included: true, questionSetIds: [], timingMinutes: 60 },
      speaking: { included: false, questionSetIds: [], timingMinutes: 15 }
    }
  });

  const availableCodes = useMemo(() => {
    const codes: Record<IeltsSectionType, string[]> = {
      Listening: [], Reading: [], Writing: [], Speaking: []
    };

    ieltsQuestionsBank.forEach(q => {
      const subjects = Array.isArray(q.subject) ? q.subject : [String(q.subject || '')];
      const examSets = Array.isArray(q.exam_set) ? q.exam_set : [String(q.exam_set || '')];
      const topics = Array.isArray(q.topic) ? q.topic : [String(q.topic || '')];
      
      let code = subjects.find((s: string) => s?.includes('-SET-') || s?.match(/^[LRWS]-/)) || 
                 examSets.find((s: string) => s && s !== 'undefined' && s !== '') || 
                 topics.find((s: string) => s && s !== 'undefined' && s !== '');

      if (!code) {
          const part = subjects.find((s: string) => ['Listening', 'Reading', 'Writing', 'Speaking'].includes(s || ''));
          if (part) code = `${part.toUpperCase()}-GENERAL-POOL`;
      }

      if (code && code !== 'undefined') {
        let type: IeltsSectionType = 'Listening';
        const subjectStr = subjects.join(' ').toLowerCase();
        const codeLower = String(code).toLowerCase();
        
        if (codeLower.startsWith('r-') || subjectStr.includes('read')) type = 'Reading';
        else if (codeLower.startsWith('w-') || subjectStr.includes('writ')) type = 'Writing';
        else if (codeLower.startsWith('s-') || subjectStr.includes('speak')) type = 'Speaking';
        else if (codeLower.startsWith('l-') || subjectStr.includes('listen')) type = 'Listening';
        
        if (!codes[type].includes(code)) codes[type].push(code);
      }
    });
    return codes;
  }, [ieltsQuestionsBank]);

  const toggleSection = (section: keyof IeltsExam['sections']) => {
    setExamData(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [section]: { ...prev.sections![section], included: !prev.sections![section].included }
      }
    }));
  };

  const updateSectionSets = (section: keyof IeltsExam['sections'], setIds: string[]) => {
    setExamData(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [section]: { ...prev.sections![section], questionSetIds: setIds }
      }
    }));
  };

  const handleSave = (shouldTest = false) => {
    if (!examData.title) {
        toast({ title: "Title Required", variant: "destructive" });
        return;
    }
    const includedSectionsCount = Object.values(examData.sections!).filter((s: IeltsExamSectionConfig) => s.included).length;
    if (includedSectionsCount === 0) {
        toast({ title: "No Sections Included", variant: "destructive" });
        return;
    }
    
    const finalizedExam = {
        ...examData,
        createdAt: new Date().toISOString(),
        creator: 'Admin Agent'
    } as IeltsExam;
    
    addExam(finalizedExam);
    toast({ title: "Blueprint Finalized", description: `Mission ${finalizedExam.examCode} archived.` });
    
    if (shouldTest) {
        router.push(`/exam-service/ielts/take/${finalizedExam.id}`);
    } else {
        router.push('/exam-service/ielts/dashboard');
    }
  };

  const SectionTab = ({ type, codes }: { type: IeltsSectionType, codes: string[] }) => {
    const key = type.toLowerCase() as keyof IeltsExam['sections'];
    const config = examData.sections![key];

    return (
      <div className="space-y-8 pt-6">
        <div className="flex items-center justify-between p-6 rounded-[32px] bg-white/[0.03] border border-white/5 shadow-inner">
           <div className="flex items-center gap-4">
              <Checkbox 
                checked={config.included} 
                onCheckedChange={() => toggleSection(key)}
                className="h-6 w-6 rounded-xl border-2 border-primary/20 bg-black/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div>
                 <Label className="font-black text-xs uppercase tracking-[0.2em] text-white">Active Operational Segment</Label>
                 <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest mt-0.5">Include {type} phase in this sequence</p>
              </div>
           </div>
           {config.included && (
              <div className="flex items-center gap-4 bg-[#0a0a0a] px-5 py-2.5 rounded-2xl border border-white/5">
                 <Clock className="h-4 w-4 text-primary opacity-40" />
                 <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={config.timingMinutes} 
                      onChange={(e) => {
                        setExamData(prev => ({
                          ...prev,
                          sections: {
                            ...prev.sections!,
                            [key]: { ...prev.sections![key], timingMinutes: parseInt(e.target.value) || 0 }
                          }
                        }));
                      }}
                      className="h-8 w-14 rounded-lg bg-black/40 border-white/5 text-center font-black text-xs text-primary"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">MINS</span>
                 </div>
              </div>
           )}
        </div>

        {config.included && (
          <div className="space-y-6">
             <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                   <div className="h-4 w-1 bg-primary rounded-full" />
                   <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/60">Matrix Bank Discovery</Label>
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full">{codes.length} SETS AVAILABLE</Badge>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {codes.length > 0 ? codes.map(code => (
                  <button 
                    key={code}
                    onClick={() => {
                      const newSets = config.questionSetIds.includes(code)
                        ? config.questionSetIds.filter(id => id !== code)
                        : [...config.questionSetIds, code];
                      updateSectionSets(key, newSets);
                    }}
                    className={`group relative flex items-center justify-between p-5 rounded-[28px] border-2 transition-all overflow-hidden ${
                      config.questionSetIds.includes(code) 
                        ? 'bg-primary border-primary shadow-2xl shadow-primary/20 scale-[1.02]' 
                        : 'bg-[#111111] border-white/5 hover:border-white/10 hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex flex-col text-left relative z-10">
                       <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${config.questionSetIds.includes(code) ? 'text-white/60' : 'text-primary'}`}>{code.split('-')[0]} UNIT</span>
                       <span className={`text-sm font-black italic tracking-tight ${config.questionSetIds.includes(code) ? 'text-white' : 'text-muted-foreground'}`}>{code}</span>
                    </div>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all relative z-10 ${
                       config.questionSetIds.includes(code) 
                       ? 'bg-white/20 border-white/30 text-white' 
                       : 'bg-black/20 border-white/5 text-muted-foreground/20'
                    }`}>
                       <Plus className={`h-4 w-4 transition-transform ${config.questionSetIds.includes(code) ? 'rotate-45' : ''}`} />
                    </div>
                    {config.questionSetIds.includes(code) && (
                        <div className="absolute right-[-10px] top-[-10px] h-20 w-20 bg-white/5 rounded-full blur-2xl" />
                    )}
                  </button>
                )) : (
                  <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-white/[0.01] space-y-4">
                    <FlaskConical className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Zero Operational Data in Repository</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-10 max-w-7xl mx-auto w-full bg-[#080808] min-h-screen text-white font-sans selection:bg-primary selection:text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-6">
           <Link href="/exam-service/ielts/dashboard">
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[24px] border border-white/5 bg-[#111111] hover:bg-white/5 transition-all group">
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </Button>
           </Link>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Blueprint Architect</h1>
                 <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">v2.4.0</Badge>
              </div>
              <p className="text-[11px] font-black uppercase text-muted-foreground/40 tracking-[0.4em] mt-2">IELTS Assessment Configuration Engine</p>
           </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => router.back()} className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border-white/5 hover:bg-white/5">
              Discard Draft
           </Button>
           <div className="h-14 w-px bg-white/5 mx-2" />
           <Button onClick={() => handleSave(true)} className="h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-violet-600 hover:bg-violet-700 text-white shadow-2xl shadow-violet-500/20 gap-3 group">
              <Zap className="h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
              Test Sequence
           </Button>
           <Button onClick={() => handleSave(false)} className="h-14 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 gap-3">
              <Save className="h-4 w-4" />
              Finalize & Deploy
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
         {/* Metadata & Control Panel */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[48px] border-none bg-[#111111] shadow-2xl overflow-hidden p-10 space-y-10">
               <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                      <div className="h-4 w-1 bg-primary rounded-full" />
                      <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Mission Title</Label>
                  </div>
                  <Input 
                    placeholder="e.g., TACTICAL RECONNAISSANCE - ALPHA" 
                    value={examData.title}
                    onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-16 rounded-[24px] bg-black/40 border-white/5 focus-visible:ring-primary/20 text-xl font-black italic text-white placeholder:text-white/5 px-8"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Blueprint Class</Label>
                     <Select value={examData.ieltsCategory} onValueChange={(v) => setExamData(prev => ({ ...prev, ieltsCategory: v as any }))}>
                        <SelectTrigger className="h-14 rounded-2xl bg-black/40 border-white/5 font-black text-xs uppercase italic text-primary">
                           <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c0c0c] border-white/10 text-white rounded-2xl">
                           <SelectItem value="Academic" className="font-black text-xs uppercase transition-colors hover:text-primary">Academic</SelectItem>
                           <SelectItem value="General Training" className="font-black text-xs uppercase transition-colors hover:text-primary">General Training</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Operational Status</Label>
                     <Select value={examData.status} onValueChange={(v) => setExamData(prev => ({ ...prev, status: v as any }))}>
                        <SelectTrigger className="h-14 rounded-2xl bg-black/40 border-white/5 font-black text-xs uppercase italic text-emerald-400">
                           <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c0c0c] border-white/10 text-white rounded-2xl">
                           <SelectItem value="Draft" className="font-black text-xs uppercase">Draft</SelectItem>
                           <SelectItem value="Published" className="font-black text-xs uppercase text-emerald-400">Published</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="p-8 rounded-[40px] bg-black/40 border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Activity className="h-4 w-4 text-primary opacity-50" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Efficiency Metrics</span>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Runtime</span>
                          <span className="text-3xl font-black italic text-primary">{Object.values(examData.sections!).reduce((acc: number, s: IeltsExamSectionConfig) => acc + (s.included ? s.timingMinutes : 0), 0)} <span className="text-[10px] not-italic opacity-30">MIN</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Unit Coverage</span>
                          <div className="flex gap-1.5">
                             {Object.entries(examData.sections!).map(([k, s]: [string, IeltsExamSectionConfig]) => (
                                <div key={k} className={`h-2 w-2 rounded-full ${s.included ? 'bg-primary' : 'bg-white/5'}`} />
                             ))}
                          </div>
                      </div>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-6 rounded-[32px] bg-white/[0.02] border border-dashed border-white/10">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <p className="text-[10px] font-bold leading-relaxed text-muted-foreground/60 uppercase italic">
                     Verify all matrix sets before final deployment. Unauthorized signatures may disrupt performance metrics.
                  </p>
               </div>
            </Card>
         </div>

         {/* Phase Configuration Area */}
         <div className="lg:col-span-8">
            <Card className="rounded-[48px] border-none bg-[#111111] shadow-2xl h-full overflow-hidden flex flex-col">
                <CardContent className="p-10 flex-1 flex flex-col">
                    <Tabs defaultValue="listening" className="w-full flex-1 flex flex-col">
                       <TabsList className="w-full grid grid-cols-4 h-16 rounded-[24px] bg-[#0c0c0c] p-1.5 border border-white/5 shadow-inner">
                          <TabsTrigger value="listening" className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                             <Headphones className="h-4 w-4" /> <span className="hidden sm:inline">Listening</span>
                          </TabsTrigger>
                          <TabsTrigger value="reading" className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                             <BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">Reading</span>
                          </TabsTrigger>
                          <TabsTrigger value="writing" className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                             <PenTool className="h-4 w-4" /> <span className="hidden sm:inline">Writing</span>
                          </TabsTrigger>
                          <TabsTrigger value="speaking" className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                             <Mic2 className="h-4 w-4" /> <span className="hidden sm:inline">Speaking</span>
                          </TabsTrigger>
                       </TabsList>

                       <div className="mt-4 flex-1">
                          <TabsContent value="listening"><SectionTab type="Listening" codes={availableCodes.Listening} /></TabsContent>
                          <TabsContent value="reading"><SectionTab type="Reading" codes={availableCodes.Reading} /></TabsContent>
                          <TabsContent value="writing"><SectionTab type="Writing" codes={availableCodes.Writing} /></TabsContent>
                          <TabsContent value="speaking"><SectionTab type="Speaking" codes={availableCodes.Speaking} /></TabsContent>
                       </div>
                    </Tabs>

                    <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
                       <div className="flex items-center gap-3">
                           <Target className="h-4 w-4 text-primary opacity-50" />
                           <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Deployment Protocols (Candidate Instructions)</Label>
                       </div>
                       <textarea 
                         className="w-full min-h-[160px] rounded-[32px] bg-black/40 border border-white/5 p-8 text-sm font-bold text-muted-foreground/80 placeholder:text-white/5 focus-visible:ring-1 focus-visible:ring-primary/20 outline-none transition-all italic leading-[1.8] resize-none selection:bg-primary/20"
                         placeholder="Define tactical boundaries and engagement rules..."
                         value={examData.instructions}
                         onChange={(e) => setExamData(prev => ({ ...prev, instructions: e.target.value }))}
                       />
                    </div>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
