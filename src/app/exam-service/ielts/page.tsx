
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function IeltsPage() {
  const modules = [
    {
      title: "Exam Builder",
      description: "Compose complete IELTS exams by combining Listening, Reading, and Writing sections.",
      icon: <Layers className="h-6 w-6" />,
      href: "/exam-service/ielts/builder",
      status: "Operational",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      disabled: false,
      featured: true
    },
    {
      title: "Listening Mapper",
      description: "Associate audio payloads with question streams for all 4 Listening parts.",
      icon: <Headphones className="h-6 w-6" />,
      href: "/exam-service/ielts/listening-mapper",
      status: "Operational",
      color: "text-sky-500",
      bg: "bg-sky-500/10"
    },
    {
      title: "Reading Mapper",
      description: "Map complex passages to multiple question sets and structural types.",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/exam-service/ielts/reading-mapper",
      status: "Operational",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      disabled: false
    },
    {
       title: "Writing Studio",
       description: "Configure Task 1 visual prompts and Task 2 analytical essays.",
       icon: <PenTool className="h-6 w-6" />,
       href: "/exam-service/ielts/writing-mapper",
       status: "Operational",
       color: "text-emerald-500",
       bg: "bg-emerald-500/10"
    },
    {
        title: "Speaking Module",
        description: "Set up interactive cue cards and part-by-part speaking interview flows.",
        icon: <Mic2 className="h-6 w-6" />,
        href: "#",
        status: "Planned",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        disabled: true
    }
  ];

  return (
    <div className="flex-1 flex flex-col gap-8 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-dashed pb-8 border-muted">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                Mission Control
            </Badge>
            <div className="h-1 w-8 bg-muted rounded-full" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">IELTS Exam Service v1.2</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase flex items-center gap-4">
            <Globe className="h-10 w-10 text-primary" />
            STRATEGIC IELTS STUDIO
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Configure and deploy high-stakes testing modules through integrated content pipelines.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-card border p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-tighter">System Health</span>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold">STABLE</span>
                </div>
            </div>
             <div className="bg-card border p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-tighter">Active Syncs</span>
                <span className="text-xl font-black text-primary">04</span>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card key={index} className={`border-none shadow-xl rounded-3xl overflow-hidden group transition-all duration-300 ring-4 ring-transparent ${module.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:ring-primary/10 hover:shadow-2xl hover:-translate-y-1'} ${module.featured ? 'lg:col-span-3 md:col-span-2' : ''}`}>
            <CardHeader className="p-6 pb-0">
               <div className={`h-14 w-14 rounded-2xl ${module.bg} ${module.color} flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                 {module.icon}
               </div>
               <div className="flex items-center justify-between mb-1">
                 <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest h-5 px-2 ${module.disabled ? 'bg-muted text-muted-foreground' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {module.status}
                 </Badge>
                 {module.featured && (
                   <Badge className="text-[9px] font-black uppercase tracking-widest h-5 px-2 bg-indigo-500">
                     NEW
                   </Badge>
                 )}
               </div>
               <CardTitle className="text-xl font-black uppercase tracking-tight">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <CardDescription className="text-sm font-medium leading-relaxed mb-6 h-12 line-clamp-2">
                 {module.description}
               </CardDescription>
               
               {module.disabled ? (
                  <Button disabled variant="outline" className="w-full h-12 rounded-xl border-2 font-bold opacity-50">
                    ACCESS RESTRICTED
                  </Button>
               ) : (
                  <Link href={module.href} className="block">
                    <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-black tracking-tight group-hover:gap-4 transition-all">
                      INITIALIZE MODULE
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
               )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-3xl bg-muted/10 p-2 overflow-hidden">
            <div className="bg-card border-2 border-dashed border-primary/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 ring-8 ring-primary/5">
                    <Zap className="h-10 w-10 fill-primary" />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">INTELLIGENT CONTENT PIPELINE</h3>
                    <p className="text-muted-foreground font-medium mb-4 pr-8">Our AI-driven mapper automatically suggests question pairings based on audio transcript analysis and passage complexity indexing.</p>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="secondary" className="bg-white dark:bg-muted font-bold text-[10px] h-6 px-3 rounded-full border">TRANSCRIPT SYNC</Badge>
                        <Badge variant="secondary" className="bg-white dark:bg-muted font-bold text-[10px] h-6 px-3 rounded-full border">BLOOM'S INDEXING</Badge>
                        <Badge variant="secondary" className="bg-white dark:bg-muted font-bold text-[10px] h-6 px-3 rounded-full border">TAG AUTO-STREAM</Badge>
                    </div>
                </div>
            </div>
        </Card>
        
        <Card className="border-none shadow-2xl rounded-3xl p-8 bg-primary flex flex-col justify-center text-primary-foreground relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <ShieldCheck className="h-32 w-32" />
            </div>
            <h4 className="text-xl font-black uppercase italic mb-2">Audit Logs</h4>
            <p className="text-primary-foreground/80 font-medium text-sm mb-6">Track all configuration changes and deployment transactions across the IELTS ecosystem.</p>
            <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-black h-12 rounded-xl">
                VIEW REPOSITORY LOGS
            </Button>
        </Card>
      </div>
    </div>
  );
}
