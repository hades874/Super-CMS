
'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IeltsHeader } from '@/components/ielts/IeltsHeader';
import { IeltsFooter } from '@/components/ielts/IeltsFooter';
import { ReadingSection } from '@/components/ielts/ReadingSection';
import { ListeningSection } from '@/components/ielts/ListeningSection';
import { WritingSection } from '@/components/ielts/WritingSection';
import { academicTest1 } from '@/data/mock-data';
import type { Answer, QuestionStatus } from '@/types';

export default function IeltsTestPage() {
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});

  useEffect(() => {
    // Initialize statuses
    const initialStatuses: Record<number, QuestionStatus> = {};
    for (let i = 1; i <= 40; i++) {
      initialStatuses[i] = 'unanswered';
    }
    setQuestionStatuses(initialStatuses);

    // Initialize answers
    const initialAnswers: Answer[] = [];
    for(let i=1; i<=40; i++){
        initialAnswers.push({questionNumber: i, value: null});
    }
    setAnswers(initialAnswers);

  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit logic here
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (questionNumber: number, value: string | string[]) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionNumber === questionNumber ? { ...ans, value } : ans
      )
    );
    setQuestionStatuses(prev => ({
        ...prev,
        [questionNumber]: prev[questionNumber] === 'review' ? 'review' : 'answered'
    }));
  };

  const toggleReview = (questionNumber: number) => {
    setQuestionStatuses(prev => {
        const currentStatus = prev[questionNumber];
        if (currentStatus === 'review') {
            return {...prev, [questionNumber]: 'answered'};
        }
        return {...prev, [questionNumber]: 'review'};
    });
  }

  return (
    <div className="flex h-screen flex-col bg-muted/40">
      <IeltsHeader testTitle={academicTest1.title} timeLeft={timeLeft} />
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="reading" className="h-full flex flex-col">
          <div className="px-4 py-2 border-b">
            <TabsList>
              <TabsTrigger value="listening">Listening</TabsTrigger>
              <TabsTrigger value="reading">Reading</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="listening" className="flex-1 overflow-auto p-1">
            <ListeningSection />
          </TabsContent>
          <TabsContent value="reading" className="flex-1 overflow-auto h-full m-0">
             <ReadingSection 
                section={academicTest1.readingSection}
                answers={answers}
                onAnswerChangeAction={handleAnswerChange}
             />
          </TabsContent>
          <TabsContent value="writing" className="flex-1 overflow-auto p-1">
            <WritingSection tasks={academicTest1.writingSection.tasks} />
          </TabsContent>
        </Tabs>
      </div>
      <IeltsFooter statuses={questionStatuses} onToggleReview={toggleReview} />
    </div>
  );
}
