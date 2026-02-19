
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, FileText, Plus, Trash2, CheckCircle, XCircle, FileUp, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import type { Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { processIeltsFile } from '@/app/actions/ielts-actions';
import { cn } from '@/lib/utils';

const generatedOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text cannot be empty.'),
  isCorrect: z.boolean(),
});

const generatedQuestionSchema = z.object({
  question: z.string().min(1, 'Question text cannot be empty.'),
  options: z.array(generatedOptionSchema).min(2, 'Must have at least two options.'),
  correctOptionIndex: z.number(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  class: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const formSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});

type IeltsFileExtractorProps = {
  children: React.ReactNode;
  addImportedQuestionsAction: (newQuestions: Omit<Question, 'id'>[]) => void;
};

export function IeltsFileExtractor({ children, addImportedQuestionsAction }: IeltsFileExtractorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questions: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'questions',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
        setGenerated(false);
        methods.reset({ questions: [] });
      };
      reader.readAsDataURL(file);
    }
  };
  
  async function startExtraction() {
    if (!fileBase64 || !fileName) {
        toast({ variant: 'destructive', title: 'No file selected.'});
        return;
    }
    setIsLoading(true);
    setGenerated(false);
    try {
      const result = await processIeltsFile(fileBase64, fileName);
      
      const questionsWithDefaults = result.generatedQuestions.map((q: any, i: number) => {
        const correctIndex = q.options.findIndex((opt: any) => opt.isCorrect);
        return {
          ...q,
          options: q.options.map((opt: any, j: number) => ({...opt, id: `f${i}-opt${j}`})),
          correctOptionIndex: correctIndex === -1 ? 0 : correctIndex,
          subject: q.subject || 'IELTS',
          topic: q.topic || '',
          class: '',
          difficulty: (q.difficulty as any) || 'Medium',
        }
      });

      methods.reset({ questions: questionsWithDefaults as any });
      setGenerated(true);
      toast({ title: 'Extraction Complete', description: `Parsed ${result.generatedQuestions.length} questions from ${fileName}.` });

    } catch (error) {
      console.error('File extraction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Could not parse the document. Ensure it is a valid PDF or DOCX.',
      });
    }
    setIsLoading(false);
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const questionsToAdd = values.questions.map(q => {
      const { correctOptionIndex, ...rest } = q;
      const finalOptions = q.options.map((opt, index) => ({
        ...opt,
        isCorrect: index === correctOptionIndex
      }));

      return {
        text: rest.question,
        options: finalOptions,
        subject: rest.subject || 'IELTS',
        topic: rest.topic || 'General',
        class: rest.class || 'N/A',
        difficulty: rest.difficulty,
        type: 'ielts' as any,
      };
    });
    addImportedQuestionsAction(questionsToAdd as any);
    setIsOpen(false);
    resetState();
  };

  const resetState = () => {
    setFileName(null);
    setFileBase64(null);
    setGenerated(false);
    setIsLoading(false);
    methods.reset({ questions: [] });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetState(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
        <DialogHeader className="p-8 bg-primary text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Languages className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">IELTS Document Intel</DialogTitle>
              <DialogDescription className="text-primary-foreground/70 font-medium">
                Advanced AI ingestion for PDF and DOCX test papers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden bg-card">
          <div className="w-full md:w-1/3 p-8 border-r bg-muted/5 space-y-8">
             <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Source Asset</Label>
                <div 
                  className={cn(
                    "h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group",
                    fileName ? "border-primary/40 bg-primary/5" : "border-muted-foreground/20 bg-muted/5 hover:border-primary/20"
                  )}
                  onClick={() => document.getElementById('ielts-file-upload')?.click()}
                >
                    {fileName ? (
                      <>
                        <FileText className="h-12 w-12 text-primary mb-4" />
                        <span className="text-sm font-black text-foreground px-6 text-center line-clamp-2">{fileName}</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="h-12 w-12 text-muted-foreground/30 mb-4 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center px-8">Upload PDF or DOCX</span>
                      </>
                    )}
                    <Input id="ielts-file-upload" type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                </div>
             </div>

              <Button 
                onClick={startExtraction} 
                disabled={isLoading || !fileBase64}
                className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 font-black tracking-tight text-md hover:scale-[1.02] transition-transform"
              >
                {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <div className="mr-3 h-2 w-2 rounded-full bg-white animate-pulse" />}
                {isLoading ? 'ANALYZING MATRIX...' : 'COMMENCE EXTRACTION'}
              </Button>

              <div className="p-6 rounded-2xl bg-muted/30 border space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Protocols</h5>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><CheckCircle className="h-3 w-3 text-emerald-500" /> FULL-TEXT OCR</li>
                  <li className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><CheckCircle className="h-3 w-3 text-emerald-500" /> IELTS SCHEMA MAPPING</li>
                  <li className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><CheckCircle className="h-3 w-3 text-emerald-500" /> NEUTRAL TONE VERIFICATION</li>
                </ul>
              </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            <ScrollArea className="flex-1">
              <div className="p-8 pb-32">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="h-20 w-20 rounded-full border-8 border-muted border-t-primary animate-spin" />
                    <p className="font-black text-xl uppercase tracking-widest text-primary animate-pulse italic">Interpreting Content Stream...</p>
                  </div>
                )}
                {!isLoading && !generated && (
                   <div className="flex flex-col items-center justify-center py-32 text-center opacity-30 grayscale">
                    <Languages className="h-24 w-24 mb-6" />
                    <p className="font-black text-2xl uppercase tracking-tighter">Ready for Signal Ingestion</p>
                    <p className="text-sm font-medium mt-2">Parsed questions will be optimized for the IELTS Question Bank.</p>
                  </div>
                )}
                {generated && (
                  <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="font-black text-sm uppercase tracking-[0.3em] text-muted-foreground">Extracted Fragments ({fields.length})</h3>
                    </div>
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-8 relative rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-xl hover:bg-rose-50 text-rose-500" onClick={() => remove(index)}>
                              <Trash2 className="h-5 w-5"/>
                          </Button>
                         <FormField
                            control={methods.control}
                            name={`questions.${index}.question`}
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">QUESTION {index + 1}</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="min-h-[100px] rounded-2xl border-muted-foreground/10 focus-visible:ring-primary/20 font-bold leading-relaxed italic" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="mt-8 space-y-4">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">OPTIONS CONFIGURATION</FormLabel>
                               <RadioGroup 
                                  value={methods.watch(`questions.${index}.correctOptionIndex`).toString()}
                                  onValueChange={(value) => methods.setValue(`questions.${index}.correctOptionIndex`, parseInt(value))}
                                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                              >
                                  {(field as any).options.map((opt: any, optIndex: number) => (
                                      <div key={opt.id} className={cn(
                                        "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                                        methods.watch(`questions.${index}.correctOptionIndex`) === optIndex ? "bg-primary/5 border-primary shadow-sm" : "bg-muted/5 border-muted-foreground/10"
                                      )}>
                                          <FormControl>
                                              <RadioGroupItem value={optIndex.toString()} id={`f${index}-opt${optIndex}`} className="h-5 w-5 border-2" />
                                          </FormControl>
                                          <FormField
                                              control={methods.control}
                                              name={`questions.${index}.options.${optIndex}.text`}
                                              render={({ field }) => (
                                                  <FormItem className="flex-1">
                                                  <FormControl>
                                                      <Input {...field} className="h-9 border-none bg-transparent font-bold p-0 focus-visible:ring-0" />
                                                  </FormControl>
                                                  </FormItem>
                                              )}
                                          />
                                          {methods.watch(`questions.${index}.correctOptionIndex`) === optIndex && <CheckCircle className="h-4 w-4 text-primary" />}
                                      </div>
                                  ))}
                              </RadioGroup>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 p-6 bg-muted/10 rounded-2xl border border-dashed">
                             <FormField
                              control={methods.control}
                              name={`questions.${index}.subject`}
                              render={({ field }) => (
                                  <FormItem><FormLabel className="text-[9px] font-black">SUBJECT</FormLabel><FormControl><Input {...field} className="h-8 rounded-lg bg-white font-bold" /></FormControl></FormItem>
                              )}
                              />
                               <FormField
                              control={methods.control}
                              name={`questions.${index}.topic`}
                              render={({ field }) => (
                                  <FormItem><FormLabel className="text-[9px] font-black">TOPIC/TAG</FormLabel><FormControl><Input {...field} placeholder="e.g. Listening Part 1" className="h-8 rounded-lg bg-white font-bold" /></FormControl></FormItem>
                              )}
                              />
                               <FormField control={methods.control} name={`questions.${index}.difficulty`} render={({ field }) => (
                                  <FormItem>
                                      <FormLabel className="text-[9px] font-black">LEVEL</FormLabel>
                                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl><SelectTrigger className="h-8 rounded-lg bg-white font-bold"><SelectValue /></SelectTrigger></FormControl>
                                          <SelectContent className="rounded-xl">
                                              <SelectItem value="Easy" className="rounded-lg">Easy</SelectItem>
                                              <SelectItem value="Medium" className="rounded-lg">Medium</SelectItem>
                                              <SelectItem value="Hard" className="rounded-lg">Hard</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </FormItem>
                              )}/>
                          </div>
                      </Card>
                    ))}
                  </form>
                  </FormProvider>
                )}
              </div>
            </ScrollArea>
            
            {generated && fields.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/80 backdrop-blur-md border-t flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payload Target</span>
                    <span className="text-xl font-black">{fields.length} Questions</span>
                 </div>
                 <Button onClick={methods.handleSubmit(onSubmit)} className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 text-lg font-black tracking-tight hover:scale-105 transition-transform active:scale-95">
                    <Plus className="mr-3 h-6 w-6"/> INTEGRATE TO REPOSITORY
                 </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
