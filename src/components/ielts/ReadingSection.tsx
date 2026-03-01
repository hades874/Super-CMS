
'use client';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ReadingSection as ReadingSectionType, Answer, Question as QuestionType } from '@/types';

type ReadingSectionProps = {
  section: ReadingSectionType;
  answers: Answer[];
  onAnswerChangeAction: (questionNumber: number, value: string) => void;
};

const Question = ({ question, answer, onAnswerChange }: { question: QuestionType; answer: string | string[] | null; onAnswerChange: (value: string) => void }) => {
    switch(question.type) {
        case 'multiple-choice':
            return (
                <RadioGroup value={answer as string} onValueChange={onAnswerChange} className="space-y-2">
                    {question.options?.map(opt => (
                         <div key={opt.id || opt.text} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.id || opt.text || ''} id={opt.id || opt.text} />
                            <Label htmlFor={opt.id || opt.text}>{opt.text}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
        case 'short-answer':
            return (
                <Input 
                    value={answer as string || ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    className="max-w-sm"
                />
            )
        case 'true-false-not-given':
             return (
                <RadioGroup value={answer as string} onValueChange={onAnswerChange} className="space-y-2">
                    {['True', 'False', 'Not Given'].map(opt => (
                         <div key={opt} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt} id={`${question.id}-${opt}`} />
                            <Label htmlFor={`${question.id}-${opt}`}>{opt}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
        default:
            return <p className="text-red-500">Question type not supported yet.</p>
    }
}


export function ReadingSection({ section, answers, onAnswerChangeAction }: ReadingSectionProps) {
  const [activePassage, setActivePassage] = useState(section.passages[0]);

  return (
    <div className="grid grid-cols-2 h-full gap-1">
      <ScrollArea className="bg-card p-4">
        <h2 className="text-xl font-bold mb-4">{activePassage.title}</h2>
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans">
            {activePassage.content}
        </div>
      </ScrollArea>
      <ScrollArea className="bg-card p-4">
        <h3 className="text-lg font-semibold mb-4">Questions</h3>
         <div className="space-y-6">
            {activePassage.questions.map(q => {
                const currentAnswer = answers.find(a => a.questionNumber === q.questionNumber)?.value;
                return (
                    <div key={q.id}>
                        <p className="font-semibold mb-2">{q.questionNumber}. {q.text}</p>
                        <Question 
                            question={q}
                            answer={currentAnswer || null}
                            onAnswerChange={(value) => q.questionNumber && onAnswerChangeAction(q.questionNumber, value)}
                        />
                    </div>
                )
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
