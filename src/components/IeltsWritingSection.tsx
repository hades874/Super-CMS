
'use client';
import { useState, useMemo } from 'react';
import type { Question } from '@/types';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { placeholderImages } from '@/app/lib/images';

type IeltsWritingSectionProps = {
  questions: Question[];
};

export function IeltsWritingSection({ questions }: IeltsWritingSectionProps) {
  const [task1Response, setTask1Response] = useState('');
  const [task2Response, setTask2Response] = useState('');

  const task1 = useMemo(() => questions.find(q => q.type?.includes('task-1')), [questions]);
  const task2 = useMemo(() => questions.find(q => q.type?.includes('task-2')), [questions]);
  
  const writingImage = placeholderImages.ielts.writingTask1;

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const WritingTask = ({ task, response, setResponse, taskNumber }: { task: Question | undefined, response: string, setResponse: (value: string) => void, taskNumber: number }) => {
    if (!task) return (
        <div className="p-4 rounded-lg border bg-muted/50">
            <p className="font-semibold">Writing Task {taskNumber}</p>
            <p className="text-muted-foreground mt-2">Task not loaded.</p>
        </div>
    );
    
    return (
        <div className="p-4 rounded-lg border">
            <h3 className="font-semibold text-lg">Writing Task {taskNumber}</h3>
            <p className="mt-2 text-muted-foreground">{taskNumber === 1 ? 'You should spend about 20 minutes on this task.' : 'You should spend about 40 minutes on this task.'}</p>
            <Separator className="my-4"/>
            <p className="mb-4 whitespace-pre-wrap">{task.text}</p>
            {task.image && (
                <div className="relative w-full rounded-md overflow-hidden mb-4" style={{ aspectRatio: `${writingImage.width}/${writingImage.height}` }}>
                    <Image 
                      src={writingImage.src} 
                      alt={writingImage.alt} 
                      fill 
                      className="object-contain"
                      data-ai-hint={writingImage.hint}
                    />
                </div>
            )}
            <Textarea
                placeholder={`Begin writing your response for Task ${taskNumber} here...`}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[250px] text-base"
            />
            <p className="text-right text-sm text-muted-foreground mt-2">Word Count: {getWordCount(response)}</p>
        </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-1">
        <h2 className="text-2xl font-bold mb-2">Writing Section</h2>
        <p className="text-muted-foreground mb-6">
          This section has two tasks. You have 60 minutes to complete both tasks.
        </p>
        <div className="space-y-8">
            <WritingTask task={task1} response={task1Response} setResponse={setTask1Response} taskNumber={1}/>
            <WritingTask task={task2} response={task2Response} setResponse={setTask2Response} taskNumber={2}/>
        </div>
      </div>
    </ScrollArea>
  );
}
