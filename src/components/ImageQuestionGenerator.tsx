
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, Plus, Image as ImageIcon, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import { generateQuestionsFromImage } from '@/ai/flows/generate-questions-from-image';

const generatedOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text cannot be empty.'),
  isCorrect: z.boolean(),
});

const generatedQuestionSchema = z.object({
  question: z.string().min(1, 'Question text cannot be empty.'),
  options: z.array(generatedOptionSchema).min(2, 'Must have at least two options.'),
  correctOptionIndex: z.number(), // Store index to manage radio group
  subject: z.string().optional(),
  topic: z.string().optional(),
  class: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

const formSchema = z.object({
  questions: z.array(generatedQuestionSchema),
});

type ImageQuestionGeneratorProps = {
  children: React.ReactNode;
  addImportedQuestionsAction: (newQuestions: Omit<Question, 'id'>[]) => void;
};

export function ImageQuestionGenerator({ children, addImportedQuestionsAction }: ImageQuestionGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageFile(file);
        setGenerated(false);
        methods.reset({ questions: [] });
      };
      reader.readAsDataURL(file);
    }
  };
  
  async function generateQuestions() {
    if (!imagePreview) {
        toast({ variant: 'destructive', title: 'No image selected.'});
        return;
    }
    setIsLoading(true);
    setGenerated(false);
    try {
      const result = await generateQuestionsFromImage({
        photoDataUri: imagePreview
      });
      
      const questionsWithDefaults = result.generatedQuestions.map((q, i) => {
        const correctIndex = q.options.findIndex(opt => opt.isCorrect);
        return {
          ...q,
          options: q.options.map((opt, j) => ({...opt, id: `q${i}-opt${j}`})),
          correctOptionIndex: correctIndex === -1 ? 0 : correctIndex, // default to first if none marked correct
          subject: '',
          topic: '',
          class: '',
          difficulty: 'Medium' as const,
        }
      });

      methods.reset({ questions: questionsWithDefaults as any });
      setGenerated(true);

    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Question Generation Failed',
        description: 'Could not generate questions from the image. Please try again.',
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
        subject: rest.subject || 'Misc',
        topic: rest.topic || 'Misc',
        class: rest.class || 'Misc',
        difficulty: rest.difficulty,
        type: 'm1' as any,
      };
    });
    addImportedQuestionsAction(questionsToAdd);
    setIsOpen(false);
    resetState();
  };

  const resetState = () => {
    setImagePreview(null);
    setImageFile(null);
    setGenerated(false);
    setIsLoading(false);
    methods.reset({ questions: [] });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetState(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Questions from Image</DialogTitle>
          <DialogDescription>
            Upload an image of a document, and the AI will attempt to extract questions from it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-1">
          <div className="flex flex-col gap-4">
             <div className="space-y-2">
                <Label htmlFor="image-upload">Image File</Label>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
             </div>
             {imagePreview && (
                <div className="relative border rounded-md p-2 flex-1">
                    <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" />
                </div>
             )}
              <Button onClick={generateQuestions} disabled={isLoading || !imagePreview}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Questions
              </Button>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
            <h4 className="font-semibold mb-2">Extracted Questions</h4>
            <ScrollArea className="flex-1 -mx-4">
              <div className="px-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && !generated && (
                 <div className="flex items-center justify-center h-full text-center text-muted-foreground text-sm">
                  <p>Generated questions will appear here for review and tagging.</p>
                </div>
              )}
              {generated && (
                <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                       <FormField
                          control={methods.control}
                          name={`questions.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question {index + 1}</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="mt-2">
                            <FormLabel>Options</FormLabel>
                             <RadioGroup 
                                value={methods.watch(`questions.${index}.correctOptionIndex`).toString()}
                                onValueChange={(value) => methods.setValue(`questions.${index}.correctOptionIndex`, parseInt(value))}
                                className="mt-1"
                            >
                                {(field as any).options.map((opt: any, optIndex: number) => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                        <FormControl>
                                            <RadioGroupItem value={optIndex.toString()} id={`q${index}-opt${optIndex}`} />
                                        </FormControl>
                                        <FormField
                                            control={methods.control}
                                            name={`questions.${index}.options.${optIndex}.text`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                           <FormField
                            control={methods.control}
                            name={`questions.${index}.subject`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g. Physics" {...field} /></FormControl></FormItem>
                            )}
                            />
                             <FormField
                            control={methods.control}
                            name={`questions.${index}.topic`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g. Kinematics" {...field} /></FormControl></FormItem>
                            )}
                            />
                              <FormField
                            control={methods.control}
                            name={`questions.${index}.class`}
                            render={({ field }) => (
                                <FormItem><FormLabel>Class</FormLabel><FormControl><Input placeholder="e.g. 9th Grade" {...field} /></FormControl></FormItem>
                            )}
                            />
                             <FormField control={methods.control} name={`questions.${index}.difficulty`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Difficulty</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
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
          </div>
        </div>
        <DialogFooter>
          {generated && fields.length > 0 && (
            <Button onClick={methods.handleSubmit(onSubmit)} variant="success"><Plus className="mr-2 h-4 w-4"/>Add {fields.length} Questions to Bank</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
