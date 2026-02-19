
'use client';

import { useMemo, useState } from 'react';
import { useIeltsRepository } from '@/context/IeltsRepositoryContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  FileText, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  ArrowRight,
  Eye,
  Settings,
  Clock,
  ClipboardList,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { IeltsSectionType } from '@/types/ielts-exam';

export default function IeltsExamDashboard() {
  const { questions, exams } = useIeltsRepository();
  const [searchTerm, setSearchTerm] = useState('');

  const questionSets = useMemo(() => {
    const sets: Record<string, { 
      code: string, 
      type: IeltsSectionType, 
      count: number, 
      lastUpload: string 
    }> = {};

    questions.forEach(q => {
      const subjects = Array.isArray(q.subject) ? q.subject : [q.subject];
      const code = subjects.find(s => s?.includes('-SET-') || s?.match(/^[LRWS]-/));
      
      if (code) {
        let type: IeltsSectionType = 'Listening';
        if (code.startsWith('R-') || String(q.subject).toLowerCase().includes('read')) type = 'Reading';
        if (code.startsWith('W-') || String(q.subject).toLowerCase().includes('writ')) type = 'Writing';
        if (code.startsWith('S-') || String(q.subject).toLowerCase().includes('speak')) type = 'Speaking';
        
        if (!sets[code]) {
          sets[code] = { code, type, count: 0, lastUpload: q.createdAt || new Date().toISOString() };
        }
        sets[code].count++;
      }
    });

    return Object.values(sets).sort((a, b) => b.lastUpload.localeCompare(a.lastUpload));
  }, [questions]);

  const filteredSets = questionSets.filter(s => 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSectionIcon = (type: IeltsSectionType) => {
    switch (type) {
      case 'Listening': return <Headphones className="h-4 w-4" />;
      case 'Reading': return <BookOpen className="h-4 w-4" />;
      case 'Writing': return <PenTool className="h-4 w-4" />;
      case 'Speaking': return <Mic2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">IELTS EXAM HUB</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage and deploy official IELTS exam structures.</p>
        </div>
        <Link href="/exam-service/ielts/builder">
          <Button className="h-11 px-6 rounded-xl gap-2 font-bold shadow-sm">
            <Plus className="h-4 w-4" />
            CREATE EXAM
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Side: Question Sets Browser */}
        <div className="lg:col-span-8">
           <Card className="border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 pb-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold">QUESTION BANK</CardTitle>
                  <CardDescription className="text-xs">Available sections for exam construction.</CardDescription>
                </div>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input 
                    placeholder="Search sets..." 
                    className="pl-9 h-9 w-full sm:w-64 rounded-lg bg-background text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <ScrollArea className="h-[550px]">
                 <div className="p-4 grid gap-2">
                    {filteredSets.length > 0 ? (
                      filteredSets.map(set => (
                        <div key={set.code} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all">
                              {getSectionIcon(set.type)}
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">{set.code}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                {set.type} • {set.count} Questions • {new Date(set.lastUpload).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold px-3 rounded-lg">Preview</Button>
                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold px-3 rounded-lg border-primary/20 hover:border-primary/40 text-primary">Use in Exam</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-muted-foreground text-center">
                        <Database className="h-10 w-10 opacity-10 mb-2" />
                        <p className="text-sm font-semibold opacity-50">No question sets found.</p>
                      </div>
                    )}
                 </div>
               </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Recent Exams */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="border shadow-sm rounded-2xl overflow-hidden h-full">
              <CardHeader className="bg-muted/10 p-5 border-b">
                <CardTitle className="text-base font-bold uppercase tracking-tight">Active Missions</CardTitle>
                <CardDescription className="text-xs">Exams ready for testing or deployment.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                 {exams.length > 0 ? (
                   exams.slice(0, 8).map(exam => (
                     <div key={exam.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer border-muted-foreground/10">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                           <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-xs truncate uppercase">{exam.title}</p>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">{exam.status} • {exam.examCode}</p>
                        </div>
                        <Link href={`/exam-service/ielts/take/${exam.id}`}>
                           <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                              <ArrowRight className="h-3.5 w-3.5" />
                           </Button>
                        </Link>
                     </div>
                   ))
                 ) : (
                   <div className="py-12 text-center">
                      <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/10 mb-3" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">System holds no records.</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
