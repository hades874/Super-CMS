'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  CalendarDays, 
  Trash2, 
  Plus, 
  Link as LinkIcon, 
  MessageSquare, 
  ShieldCheck, 
  FileVideo,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { ParsedClass } from '@/types/class-creation';

const mappingSchema = z.object({
  type: z.string().min(1, 'Required'),
  program: z.string().min(1, 'Required'),
  course: z.string().min(1, 'Required'),
  subject: z.string().min(1, 'Required'),
});

const formSchema = z.object({
  title: z.string().min(1, 'Name is required'),
  classType: z.string().min(1, 'Type is required'),
  classDate: z.string().min(1, 'Start date is required'),
  classEndDate: z.string().optional(),
  description: z.string().optional(),
  previewUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  doubtSolve: z.enum(['Teacher Inbox', 'TenTen']),
  classDiscussion: z.boolean(),
  status: z.enum(['Private', 'Public']),
  generateTranscription: z.boolean(),
  mappings: z.array(mappingSchema).min(1, 'At least one mapping is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClassDialogProps {
  cls: ParsedClass | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClass: ParsedClass) => void;
}

export function EditClassDialog({ cls, isOpen, onClose, onUpdate }: EditClassDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      classType: '',
      classDate: '',
      classEndDate: '',
      description: '',
      previewUrl: '',
      downloadUrl: '',
      doubtSolve: 'Teacher Inbox',
      classDiscussion: true,
      status: 'Private',
      generateTranscription: false,
      mappings: [{ type: 'k12', program: '', course: '', subject: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'mappings',
  });

  useEffect(() => {
    if (cls && isOpen) {
      form.reset({
        title: cls.title || '',
        classType: cls.classType || 'Live',
        classDate: cls.classDate || '',
        classEndDate: cls.classEndDate || cls.classDate || '',
        description: cls.description || cls.caption || '',
        previewUrl: cls.previewUrl || '',
        downloadUrl: cls.downloadUrl || '',
        doubtSolve: cls.doubtSolve || 'Teacher Inbox',
        classDiscussion: cls.classDiscussion ?? true,
        status: cls.status || 'Private',
        generateTranscription: cls.generateTranscription ?? false,
        startTime: cls.startTime || '',
        endTime: cls.endTime || '',
        mappings: cls.mappings && cls.mappings.length > 0 
          ? cls.mappings 
          : [{ 
              type: 'k12', 
              program: cls.programs[0] || '', 
              course: cls.course || '', 
              subject: cls.subject || '' 
            }],
      });
    }
  }, [cls, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    if (!cls) return;
    
    onUpdate({
      ...cls,
      ...values,
      // Update flat fields from the first mapping for backward compatibility if needed
      programs: values.mappings.map(m => m.program),
      course: values.mappings[0]?.course || cls.course,
      subject: values.mappings[0]?.subject || cls.subject,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-6 bg-muted/30 border-b">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Class Configuration</DialogTitle>
          <DialogDescription>Modify class parameters and curriculum mappings.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name & Type */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter class name" {...field} className="h-12 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Live">Live Class</SelectItem>
                        <SelectItem value="Recorded">Recorded Content</SelectItem>
                        <SelectItem value="Batch">Batch Specific</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="classDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-12 w-full pl-3 text-left font-normal rounded-xl justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? field.value : <span>Date</span>}
                                <CalendarDays className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Input placeholder="10:00 PM" {...field} className="h-12 rounded-xl" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">End</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="classEndDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-12 w-full pl-3 text-left font-normal rounded-xl justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? field.value : <span>Date</span>}
                                <CalendarDays className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Input placeholder="11:30 PM" {...field} className="h-12 rounded-xl" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description (Full width) */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description" 
                          {...field} 
                          className="min-h-[100px] rounded-2xl resize-none" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* URLs */}
              <FormField
                control={form.control}
                name="previewUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preview Lecture URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Preview lecture URL" {...field} className="h-12 pl-10 rounded-xl" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Download Lecture URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Download lecture URL" {...field} className="h-12 pl-10 rounded-xl" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bottom Row: Radios & Mappings */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 space-y-6 bg-muted/10 p-6 rounded-[2rem] border border-dashed">
                <FormField
                  control={form.control}
                  name="doubtSolve"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" /> Doubt Solve
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Teacher Inbox" />
                            </FormControl>
                            <FormLabel className="font-bold text-xs cursor-pointer">
                              Teacher Inbox
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="TenTen" />
                            </FormControl>
                            <FormLabel className="font-bold text-xs cursor-pointer">
                              TenTen
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classDiscussion"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Class Discussion (Comment Section)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val) => field.onChange(val === 'Yes')}
                          defaultValue={field.value ? 'Yes' : 'No'}
                          className="flex flex-row space-x-6"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Yes" />
                            </FormControl>
                            <FormLabel className="font-bold text-xs cursor-pointer">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="No" />
                            </FormControl>
                            <FormLabel className="font-bold text-xs cursor-pointer">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" /> Class Status
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Private" />
                            </FormControl>
                            <FormLabel className="font-bold text-xs cursor-pointer">Private</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Public" />
                            </FormControl>
                            <FormLabel className="font-bold text-xs cursor-pointer">Public</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generateTranscription"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs font-bold flex items-center gap-1.5">
                          <FileVideo className="h-3 w-3" /> Generate Video Transcription
                        </FormLabel>
                        <p className="text-[9px] text-muted-foreground">
                          (This will enable TenTen under recorded video)
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Curriculum Mappings</span>
                </div>
                
                <div className="space-y-3 p-6 bg-secondary/20 rounded-[2rem] border min-h-[200px]">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-center animate-in fade-in zoom-in-95 duration-200">
                      <FormField
                        control={form.control}
                        name={`mappings.${index}.type`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-10 w-[120px] rounded-xl bg-muted/20 border-muted-foreground/10">
                              <SelectValue placeholder="-- Select --" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="k12">k12</SelectItem>
                              <SelectItem value="skills">skills</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mappings.${index}.program`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Program" className="h-10 flex-1 rounded-xl bg-muted/20 border-muted-foreground/10" />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mappings.${index}.course`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Course" className="h-10 flex-1 rounded-xl bg-muted/20 border-muted-foreground/10" />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mappings.${index}.subject`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-10 flex-1 rounded-xl bg-muted/20 border-muted-foreground/10">
                              <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Math">Math</SelectItem>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-xl border-dashed h-10 w-full"
                    onClick={() => append({ type: 'k12', program: '', course: '', subject: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Mapping
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8 border-t">
              <Button type="submit" size="lg" className="h-14 px-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black uppercase tracking-tight hover:scale-[1.02] transition-transform">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
