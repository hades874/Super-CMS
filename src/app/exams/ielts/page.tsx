
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExamRepository } from '@/context/ExamRepositoryContext';
import { Clock, BookOpen, Headphones, PenTool, ArrowRight, Calendar, Globe } from 'lucide-react';
import Link from 'next/link';

export default function IeltsExamsPage() {
  const { exams } = useExamRepository();
  
  // Filter only published exams
  const publishedExams = exams.filter(exam => exam.status === 'published');
  
  // Separate by type
  const academicExams = publishedExams.filter(exam => exam.type === 'Academic');
  const generalExams = publishedExams.filter(exam => exam.type === 'General Training');

  const ExamCard = ({ exam }: { exam: any }) => {
    const totalQuestions = 
      (exam.listeningSection?.parts?.reduce((sum: number, part: any) => sum + (part.questions?.length || 0), 0) || 0) +
      (exam.readingSection?.passages?.reduce((sum: number, passage: any) => sum + (passage.questions?.length || 0), 0) || 0) +
      (exam.writingSection?.tasks?.length || 0);

    return (
      <Card className="border shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardHeader className="bg-muted/5 p-6 border-b">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[8px] uppercase tracking-[0.2em]">
              Online
            </Badge>
            <Badge variant="secondary" className="font-black text-[8px] uppercase tracking-widest bg-primary/10 text-primary border-none">
              {exam.type}
            </Badge>
          </div>
          <CardTitle className="text-lg font-black uppercase tracking-tight leading-tight">{exam.title}</CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
            System Component: {exam.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/5 border">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Duration</p>
                <p className="text-xs font-bold">{exam.duration}m</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/5 border">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Status</p>
                <p className="text-xs font-bold">Stable</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">Matrix Blueprint</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Headphones className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-[10px] uppercase">Listening</span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground">{exam.listeningSection?.parts?.length || 0} Modules</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-[10px] uppercase">Reading</span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground">{exam.readingSection?.passages?.length || 0} Passages</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-colors">
                <div className="flex items-center gap-2">
                  <PenTool className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-[10px] uppercase">Writing</span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground">{exam.writingSection?.tasks?.length || 0} Tasks</span>
              </div>
            </div>
          </div>

          <Link href={`/exam/${exam.id}`} className="block pt-2">
            <Button className="w-full h-11 rounded-xl shadow-sm font-black text-[10px] uppercase tracking-widest gap-2 group">
              Initialize Exam
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-6 border-b pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em]">
              Examination Node
            </Badge>
            <div className="h-px flex-1 bg-muted" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            IELTS Matrix Portal
          </h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-2 max-w-2xl leading-relaxed">
            Authorized access to standardized IELTS assessments. Select an operation point to begin the evaluation sequence.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-muted/5 border p-5 rounded-2xl flex flex-col min-w-[160px] shadow-sm">
            <span className="text-[9px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Global Capacity</span>
            <span className="text-3xl font-black tracking-tighter">{publishedExams.length}</span>
          </div>
          <div className="bg-muted/5 border p-5 rounded-2xl flex flex-col min-w-[160px] shadow-sm">
            <span className="text-[9px] font-black uppercase text-violet-500 mb-1 tracking-widest">Academic Track</span>
            <span className="text-3xl font-black tracking-tighter text-violet-600">{academicExams.length}</span>
          </div>
          <div className="bg-muted/5 border p-5 rounded-2xl flex flex-col min-w-[160px] shadow-sm">
            <span className="text-[9px] font-black uppercase text-emerald-500 mb-1 tracking-widest">General Track</span>
            <span className="text-3xl font-black tracking-tighter text-emerald-600">{generalExams.length}</span>
          </div>
        </div>
      </div>

      {publishedExams.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-20 text-center bg-muted/5">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/20 mx-auto flex items-center justify-center">
              <Globe className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
               <h3 className="text-xs font-black uppercase tracking-widest">No Active Nodes</h3>
               <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                 System is currently optimized but empty. Check back later for updates.
               </p>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-8">
             <TabsList className="bg-muted/20 p-1 rounded-xl h-11 border">
               <TabsTrigger value="all" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                 All Assets
               </TabsTrigger>
               <TabsTrigger value="academic" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                 Academic
               </TabsTrigger>
               <TabsTrigger value="general" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                 General
               </TabsTrigger>
             </TabsList>
             <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Matrix Stream
             </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="academic" className="mt-0">
            {academicExams.length === 0 ? (
              <div className="text-center p-20 border-2 border-dashed rounded-2xl bg-muted/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Academic Assets Available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {academicExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="general" className="mt-0">
            {generalExams.length === 0 ? (
              <div className="text-center p-20 border-2 border-dashed rounded-2xl bg-muted/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No General Assets Available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {generalExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
