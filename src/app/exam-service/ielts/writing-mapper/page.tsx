
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  PenTool, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Image as ImageIcon,
  Type,
  Layout,
  FileText,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';
import type { WritingTask, WritingSection } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IeltsWritingMapperPage() {
  const { toast } = useToast();

  const [writingSection, setWritingSection] = useLocalStorage<WritingSection>('ielts-writing-section', {
    id: 'aw-s1',
    tasks: [
      { id: 'task-1', taskNumber: 1, type: 'task-1', text: '', image: '' },
      { id: 'task-2', taskNumber: 2, type: 'task-2', text: '', image: '' },
    ]
  });

  const [activeTaskIndex, setActiveTaskIndex] = useState(0);

  const handleUpdateTask = (index: number, updates: Partial<WritingTask>) => {
    setWritingSection(prev => ({
      ...prev,
      tasks: prev.tasks.map((t, i) => i === index ? { ...t, ...updates } : t)
    }));
  };

  const handleSave = () => {
    toast({
        title: "Writing Configuration Locked",
        description: "Task prompts and visual payloads have been synced to the core repository.",
    });
  };

  const activeTask = writingSection.tasks[activeTaskIndex];

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
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic text-emerald-600">
              <PenTool className="h-8 w-8" />
              WRITING STUDIO
            </h1>
            <p className="text-muted-foreground font-medium">Configure Task 1 visual prompts and Task 2 analytical essay parameters.</p>
          </div>
        </div>
        <Button onClick={handleSave} className="h-12 px-8 rounded-xl shadow-xl shadow-emerald-500/20 gap-2 font-bold hover:scale-[1.02] transition-transform bg-emerald-600 hover:bg-emerald-700 text-white">
          <Save className="h-5 w-5" />
          SYNC STUDIO DATA
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar Task Selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-4 bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-2xl mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Writing Pipeline</span>
            <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 px-3 h-6 rounded-full font-black text-[10px]">SECTION 01</Badge>
                <Badge variant="outline" className="bg-muted text-muted-foreground px-3 h-6 rounded-full font-black text-[10px]">v1.0.0</Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            {writingSection.tasks.map((task, index) => (
              <button
                key={task.id}
                onClick={() => setActiveTaskIndex(index)}
                className={cn(
                  "w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center justify-between group relative overflow-hidden",
                  activeTaskIndex === index 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" 
                  : "bg-card border-border hover:border-emerald-500/40 hover:bg-emerald-500/5"
                )}
              >
                <div className="flex items-center gap-4 relative z-10 font-black">
                  <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0",
                      activeTaskIndex === index ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {task.taskNumber}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-tight">
                        {task.type === 'task-1' ? 'Tactical Report' : 'Analytical Essay'}
                    </p>
                    <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        activeTaskIndex === index ? "text-white/70" : "text-muted-foreground"
                    )}>
                        TASK {task.taskNumber}
                    </p>
                  </div>
                </div>
                {activeTaskIndex === index && (
                    <div className="absolute -right-2 -bottom-2 opacity-15">
                        <Target className="h-16 w-16" />
                    </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-card border rounded-3xl space-y-4 shadow-sm">
             <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Parameters</span>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Total Word Count</span>
                    <span>{activeTask.type === 'task-1' ? '150+' : '250+'} words</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Time Allowance</span>
                    <span>{activeTask.type === 'task-1' ? '20 mins' : '40 mins'}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Focused Work Area */}
        <div className="lg:col-span-3 space-y-6">
           <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] ring-4 ring-emerald-500/5">
                <CardHeader className="bg-muted/30 p-8 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-black italic uppercase tracking-tight flex items-center gap-3">
                                {activeTask.type === 'task-1' ? (
                                    <><Layout className="h-8 w-8 text-emerald-600" /> TASK 1: VISUAL SYNTHESIS</>
                                ) : (
                                    <><FileText className="h-8 w-8 text-emerald-600" /> TASK 2: ARGUMENTATIVE ESSAY</>
                                )}
                            </CardTitle>
                            <CardDescription className="text-base font-medium mt-1">Configure the prompt payload and visual assets for this task.</CardDescription>
                        </div>
                        <Badge variant="outline" className="h-10 px-6 rounded-2xl bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-black tracking-widest text-xs">
                            {activeTask.type.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                    {/* Visual Asset Section (Task 1 only) */}
                    {activeTask.type === 'task-1' && (
                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">VISUAL DATA PAYLOAD (IMAGE URL)</Label>
                            <div className="relative group">
                                <Input 
                                    placeholder="e.g., https://storage.googleapis.com/ielts-assets/bar-chart-01.png" 
                                    className="h-16 pl-14 rounded-2xl border-2 border-muted bg-muted/5 group-focus-within:border-emerald-500/50 transition-all font-mono text-sm"
                                    value={activeTask.image}
                                    onChange={(e) => handleUpdateTask(activeTaskIndex, { image: e.target.value })}
                                />
                                <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                            </div>
                            {activeTask.image && (
                                <div className="mt-4 p-4 bg-muted/5 rounded-3xl border-2 border-dashed border-muted overflow-hidden flex justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                    <img src={activeTask.image} alt="Task 1 Visual" className="max-h-64 rounded-xl shadow-lg border bg-white" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prompt Text Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">PROMPT SPECIFICATION (HTML/MARKDOWN)</Label>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold text-[9px] h-5">TAG: {activeTask.type === 'task-1' ? 'REPORT' : 'ESSAY'}</Badge>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold text-[9px] h-5">ENCODING: UTF-8</Badge>
                            </div>
                        </div>
                        <div className="relative group">
                            <Textarea 
                                placeholder="Enter the writing prompt text here..." 
                                className="min-h-[300px] p-8 rounded-[2rem] border-2 border-muted bg-muted/5 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 transition-all font-bold leading-relaxed text-lg shadow-inner resize-none"
                                value={activeTask.text}
                                onChange={(e) => handleUpdateTask(activeTaskIndex, { text: e.target.value })}
                            />
                            <div className="absolute right-6 bottom-6 opacity-5 group-focus-within:opacity-20 transition-opacity">
                                <PenTool className="h-24 w-24" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Target className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black uppercase italic text-emerald-800">Mission Parameters Checklist</h4>
                            <p className="text-xs text-emerald-700 font-medium">Ensure the prompt contains clear instructions on word count and the specific requirement (e.g., "Summarize the information", "To what extent do you agree?").</p>
                        </div>
                        <Button variant="outline" className="bg-white border-emerald-200 text-emerald-700 font-black h-12 rounded-xl h-11 px-6 shadow-sm">
                            PREVIEW PROMPT
                        </Button>
                    </div>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
