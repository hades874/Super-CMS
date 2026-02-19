
'use client';
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle, Save, X, Edit3, Settings2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Question } from '@/types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text cannot be empty.'),
  isCorrect: z.boolean(),
});

const stringOrStringArray = z.union([z.string(), z.array(z.string())]);

const questionFormSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  subject: stringOrStringArray.optional(),
  topic: stringOrStringArray.optional(),
  class: stringOrStringArray.optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  options: z.array(optionSchema).min(2, 'Must have at least two options.'),
  correctOption: z.string().min(1, "Must select a correct option."),
  explanation: z.string().optional(),
  program: stringOrStringArray.optional(),
  paper: stringOrStringArray.optional(),
  chapter: stringOrStringArray.optional(),
  board: stringOrStringArray.optional(),
});

type EditQuestionDialogProps = {
  question: Question;
  isOpen: boolean;
  onOpenChangeAction: (isOpen: boolean) => void;
  onSaveAction: (updatedQuestion: Question) => void;
};

const formatForInput = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value.join(', ');
    return value || '';
}

const parseFromInput = (value: string): string | string[] => {
    const parts = value.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length <= 1) return parts[0] || '';
    return parts;
}

export function EditQuestionDialog({ question, isOpen, onOpenChangeAction, onSaveAction }: EditQuestionDialogProps) {
  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  useEffect(() => {
    if (isOpen) {
        form.reset({
            text: question.text || '',
            subject: formatForInput(question.subject),
            topic: formatForInput(question.topic),
            class: formatForInput(question.class),
            difficulty: question.difficulty || 'Medium',
            options: question.options || [{ id: '1', text: '', isCorrect: false }, { id: '2', text: '', isCorrect: false }],
            correctOption: question.options?.findIndex(o => o.isCorrect).toString() || '0',
            explanation: question.explanation || '',
            program: formatForInput(question.program),
            paper: formatForInput(question.paper),
            chapter: formatForInput(question.chapter),
            board: formatForInput(question.board),
        });
    }
  }, [question, isOpen, form]);

  const onSubmit = (values: z.infer<typeof questionFormSchema>) => {
    const updatedOptions = values.options.map((opt, index) => ({
        ...opt,
        isCorrect: index.toString() === values.correctOption,
    }));

    const updatedQuestion: Question = {
      ...question,
      text: values.text,
      subject: parseFromInput(values.subject as string),
      topic: parseFromInput(values.topic as string),
      class: parseFromInput(values.class as string),
      difficulty: values.difficulty,
      options: updatedOptions,
      explanation: values.explanation,
      program: parseFromInput(values.program as string),
      paper: parseFromInput(values.paper as string),
      chapter: parseFromInput(values.chapter as string),
      board: parseFromInput(values.board as string),
    };
    onSaveAction(updatedQuestion);
  };
  
  const AttributeInput = ({ name, label }: { name: "subject" | "topic" | "class" | "program" | "paper" | "chapter" | "board", label: string }) => (
     <FormField control={form.control} name={name} render={({ field }) => (
        <FormItem className="space-y-1.5">
            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</FormLabel>
            <FormControl><Input {...field} className="rounded-xl h-10 border-muted-foreground/10 focus-visible:ring-primary/20 bg-muted/5 font-bold" /></FormControl>
            <FormMessage className="text-[10px]" />
        </FormItem>
    )}/>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-[2.5rem] border-none shadow-2xl overflow-hidden ring-1 ring-black/5 bg-background">
        <DialogHeader className="bg-foreground p-8 text-background">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white font-black text-[10px] uppercase tracking-widest border-none">EDITOR MODE</Badge>
                </div>
                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <Edit3 className="h-6 w-6 text-primary" /> CALIBRATE ASSET
                </DialogTitle>
                <DialogDescription className="text-background/60 font-medium italic">
                    Precision adjustments to the core data node.
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-8 overflow-y-auto">
                <div className="space-y-10">
                    <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="h-1.5 w-8 bg-primary rounded-full" />
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">PRIMARY PAYLOAD</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Textarea {...field} className="rounded-[2rem] min-h-[140px] p-6 text-lg font-bold border-2 border-dashed border-muted-foreground/20 focus-visible:ring-primary/20 bg-muted/5 shadow-inner" placeholder="Question string..." />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-8 bg-emerald-500 rounded-full" />
                                <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">RESPONSE MATRIX</h3>
                            </div>
                            <Button type="button" variant="outline" size="sm" className="rounded-xl h-8 font-black uppercase text-[10px] tracking-widest border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => append({ id: `new-${Date.now()}`, text: '', isCorrect: false })}>
                                <PlusCircle className="mr-2 h-3.5 w-3.5" /> Extend Matrix
                            </Button>
                        </div>
                        
                        <RadioGroup 
                          value={form.watch('correctOption')}
                          onValueChange={(value) => form.setValue('correctOption', value)}
                          className="grid sm:grid-cols-2 gap-4"
                        >
                            {fields.map((field, index) => (
                                <div key={field.id} className={cn(
                                    "relative flex items-center gap-4 p-5 rounded-2xl border transition-all shadow-sm group",
                                    form.watch('correctOption') === index.toString() ? "bg-emerald-50 border-emerald-200 ring-4 ring-emerald-500/5" : "bg-card border-muted-foreground/10"
                                )}>
                                    <div className="flex flex-col flex-1 gap-1">
                                        <FormField
                                            control={form.control}
                                            name={`options.${index}.text`}
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input {...field} placeholder={`Option ${index + 1}`} className="border-none bg-transparent shadow-none p-0 h-auto font-bold text-sm focus-visible:ring-0 placeholder:text-muted-foreground/30" />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <FormControl>
                                            <RadioGroupItem value={index.toString()} id={`correct-opt-${index}`} className="h-5 w-5 border-emerald-500 text-emerald-500" />
                                        </FormControl>
                                        <FormLabel htmlFor={`correct-opt-${index}`} className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-emerald-700">Valid</FormLabel>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                        <FormMessage>{form.formState.errors.options?.message || form.formState.errors.correctOption?.message}</FormMessage>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-8 bg-amber-500 rounded-full" />
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">LOGIC SHIELD</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name="explanation"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Textarea {...field} className="rounded-2xl min-h-[100px] border-amber-200 bg-amber-50/30 text-sm font-bold p-5 italic focus-visible:ring-amber-200" placeholder="Heuristic explanation for the correct node..." />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-8 bg-sky-500 rounded-full" />
                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground">SYSTEM METADATA</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/5 p-8 rounded-[2rem] border border-muted-foreground/10 ring-4 ring-muted/5">
                            <AttributeInput name="subject" label="Subject" />
                            <AttributeInput name="topic" label="Topic Anchor" />
                            <AttributeInput name="class" label="Class Rank" />
                            <FormField control={form.control} name="difficulty" render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Intensity</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger className="rounded-xl h-10 border-muted-foreground/10 bg-muted/5 font-bold focus:ring-primary/20">
                                            <SelectValue placeholder="Intensity" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="Easy" className="rounded-lg">Easy</SelectItem>
                                            <SelectItem value="Medium" className="rounded-lg">Medium</SelectItem>
                                            <SelectItem value="Hard" className="rounded-lg">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}/>
                            <AttributeInput name="program" label="Program" />
                            <AttributeInput name="paper" label="Paper No" />
                            <AttributeInput name="chapter" label="Chapter ID" />
                            <AttributeInput name="board" label="Regulatory" />
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="p-8 bg-muted/10 border-t flex flex-col sm:flex-row gap-4">
                <Button type="button" variant="outline" className="rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-muted-foreground/20 px-8" onClick={() => onOpenChangeAction(false)}>
                    <X className="mr-3 h-4 w-4" /> ABORT EDITS
                </Button>
                <Button type="submit" className="rounded-2xl h-14 font-black uppercase tracking-widest text-xs px-12 shadow-2xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 hover:scale-105 transition-transform active:scale-95 text-white border-none">
                    <Save className="mr-3 h-4 w-4" /> COMMIT ALL CHANGES
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
