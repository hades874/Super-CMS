
'use client';
import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Question } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Pencil, CheckCircle, XCircle, Info, Zap, Hash, Database, ChevronRight, Layers, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

type QuestionDetailsDialogProps = {
  question: Question;
  allQuestions: Question[];
  isOpen: boolean;
  onOpenChangeAction: (isOpen: boolean) => void;
  onEditClickAction: (question: Question) => void;
};

const AttributeSection = ({ label, value, icon: Icon }: { label: string, value: string | string[] | number | undefined | null, icon: any }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const values = Array.isArray(value) ? value : [String(value)];

    return (
        <div className="space-y-2 group">
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <Icon className="h-3 w-3" />
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
                {values.map((val, index) => (
                    <Badge key={index} variant="outline" className="rounded-xl px-3 py-1 bg-muted/30 border-muted-foreground/10 font-bold text-xs shadow-sm hover:border-primary/30 transition-all">{val}</Badge>
                ))}
            </div>
        </div>
    );
};


export function QuestionDetailsDialog({ question, isOpen, onOpenChangeAction, onEditClickAction }: QuestionDetailsDialogProps) {
  if (!question) return null;
  const isCQ = question.type === 'cq';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden ring-1 ring-black/5 bg-background">
        <DialogHeader className="bg-primary p-8 text-primary-foreground">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white font-black text-[10px] uppercase tracking-widest border-none">STUDIO VIEW</Badge>
                    <Badge className="bg-white/10 hover:bg-white/20 text-white/80 font-mono text-[10px] border-none">ID: {question.id}</Badge>
                </div>
                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Asset Specification</DialogTitle>
                <DialogDescription className="text-primary-foreground/70 font-medium italic">
                    Review and calibrate the content payload.
                </DialogDescription>
            </div>
            <div className="h-16 w-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <Zap className="h-8 w-8 text-white shadow-xl" />
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-8 overflow-y-auto bg-card/10 backdrop-blur-sm">
            <div className="space-y-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-1.5 w-8 bg-primary rounded-full" />
                        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">CONTENT PAYLOAD</h3>
                    </div>
                    {isCQ ? (
                        <div className="space-y-6">
                            <div className="p-8 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted-foreground/10 shadow-inner">
                                <p className="text-lg leading-relaxed font-bold italic text-foreground whitespace-pre-wrap">{question.text}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-primary ml-2 flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3" /> Sub-content nodes
                                </h4>
                                <div className="grid gap-3">
                                    {question.options?.map((opt, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-card border shadow-sm group hover:border-primary/30 transition-all">
                                            <span className="font-black font-mono text-primary bg-primary/5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                                                {['ক', 'খ', 'গ', 'ঘ'][index] || index + 1}
                                            </span>
                                            <p className="font-bold text-sm text-foreground pt-1.5">{opt.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-8 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted-foreground/10 shadow-inner group transition-all hover:bg-muted/50">
                                <p className="text-xl leading-relaxed font-black italic text-foreground" dangerouslySetInnerHTML={{ __html: question.text || '' }} />
                            </div>

                            {question.options && question.options.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-primary ml-2 flex items-center gap-2">
                                        <ChevronRight className="h-3 w-3" /> Response Matrix
                                    </h4>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                    {question.options.map((opt, index) => (
                                        <div key={index} className={cn(
                                            "flex items-center gap-4 p-5 rounded-2xl border transition-all shadow-sm group",
                                            opt.isCorrect ? "bg-emerald-50/50 border-emerald-200 ring-4 ring-emerald-500/5 scale-[1.02]" : "bg-card border-muted-foreground/10 hover:border-primary/20"
                                        )}>
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                opt.isCorrect ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-muted text-muted-foreground"
                                            )}>
                                                {opt.isCorrect ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                            </div>
                                            <span className={cn("font-bold text-sm", opt.isCorrect ? "text-emerald-900" : "text-foreground")}>{opt.text}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {question.explanation && (
                    <div className="space-y-3">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="h-1.5 w-8 bg-amber-500 rounded-full" />
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-amber-600">LOGIC / EXPLANATION</h3>
                        </div>
                        <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-200 shadow-inner">
                            <p className="text-sm font-bold text-amber-900 leading-relaxed italic">{question.explanation}</p>
                        </div>
                    </div>
                )}

                <Separator className="opacity-50" />

                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1.5 w-8 bg-foreground rounded-full" />
                        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-foreground">METADATA MATRIX</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AttributeSection label="Vertical" value={question.vertical} icon={Layers} />
                        <AttributeSection label="Class" value={question.class} icon={Info} />
                        <AttributeSection label="Subject" value={question.subject} icon={Database} />
                        <AttributeSection label="Topic" value={question.topic} icon={Hash} />
                        <AttributeSection label="Difficulty" value={question.difficulty} icon={Zap} />
                        <AttributeSection label="Marks" value={question.marks} icon={PlusCircle} />
                        <AttributeSection label="Program" value={question.program} icon={Info} />
                        <AttributeSection label="Board" value={question.board} icon={Database} />
                    </div>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-muted-foreground/20 px-8" onClick={() => onOpenChangeAction(false)}>
                DISMISS
            </Button>
            <Button onClick={() => onEditClickAction(question)} className="rounded-2xl h-14 font-black uppercase tracking-widest text-xs px-10 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform active:scale-95">
                <Pencil className="mr-3 h-4 w-4"/>
                ACTIVATE HOT-KEY EDIT
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
