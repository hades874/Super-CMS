
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IeltsHeader } from '@/components/ielts/IeltsHeader';
import { IeltsFooter } from '@/components/ielts/IeltsFooter';
import { ReadingSection } from '@/components/ielts/ReadingSection';
import { ListeningSection } from '@/components/ielts/ListeningSection';
import { WritingSection } from '@/components/ielts/WritingSection';
import { useExamRepository } from '@/context/ExamRepositoryContext';
import type { Answer, QuestionStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DynamicExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { getExam } = useExamRepository();
  
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});

  useEffect(() => {
    // Fetch exam from repository
    const fetchedExam = getExam(examId);
    
    if (!fetchedExam) {
      setLoading(false);
      return;
    }

    // Only allow published exams to be taken
    if (fetchedExam.status !== 'published') {
      setLoading(false);
      return;
    }

    setExam(fetchedExam);
    setTimeLeft(fetchedExam.duration * 60); // Convert minutes to seconds
    
    // Initialize statuses and answers
    // For now, we'll use a fixed number of questions (40)
    // In a real implementation, this would be calculated from the exam sections
    const initialStatuses: Record<number, QuestionStatus> = {};
    const initialAnswers: Answer[] = [];
    
    for (let i = 1; i <= 40; i++) {
      initialStatuses[i] = 'unanswered';
      initialAnswers.push({ questionNumber: i, value: null });
    }
    
    setQuestionStatuses(initialStatuses);
    setAnswers(initialAnswers);
    setLoading(false);
  }, [examId, getExam]);

  useEffect(() => {
    if (!exam || timeLeft === 0) return;

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
  }, [exam, timeLeft]);

  const handleAnswerChange = (questionNumber: number, value: string | string[]) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.questionNumber === questionNumber ? { ...ans, value } : ans
      )
    );
    setQuestionStatuses((prev) => ({
      ...prev,
      [questionNumber]: 'answered',
    }));
  };

  const handleStatusChange = (questionNumber: number, status: QuestionStatus) => {
    setQuestionStatuses((prev) => ({
      ...prev,
      [questionNumber]: status,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-bold">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Exam not found or not published
  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="max-w-md p-8 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase">Exam Not Found</h2>
            <p className="text-muted-foreground font-medium">
              The exam you're looking for doesn't exist or is not available for taking.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/exams/ielts">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exams
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <IeltsHeader
        testTitle={exam.title}
        timeLeft={timeLeft}
      />
      <div className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="listening" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl h-14">
            <TabsTrigger value="listening" className="rounded-lg font-bold">
              Listening
            </TabsTrigger>
            <TabsTrigger value="reading" className="rounded-lg font-bold">
              Reading
            </TabsTrigger>
            <TabsTrigger value="writing" className="rounded-lg font-bold">
              Writing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listening">
            {exam.listeningSection && exam.listeningSection.parts && exam.listeningSection.parts.length > 0 ? (
              <ListeningSection />
            ) : (
              <Card className="p-12 text-center border-2 border-dashed">
                <p className="text-muted-foreground font-bold">
                  No listening section configured for this exam.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reading">
            {exam.readingSection && exam.readingSection.passages && exam.readingSection.passages.length > 0 ? (
              <ReadingSection
                section={exam.readingSection}
                answers={answers}
                onAnswerChangeAction={(q, v) => handleAnswerChange(q, v)}
              />
            ) : (
              <Card className="p-12 text-center border-2 border-dashed">
                <p className="text-muted-foreground font-bold">
                  No reading section configured for this exam.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="writing">
            {exam.writingSection && exam.writingSection.tasks && exam.writingSection.tasks.length > 0 ? (
              <WritingSection
                tasks={exam.writingSection.tasks}
              />
            ) : (
              <Card className="p-12 text-center border-2 border-dashed">
                <p className="text-muted-foreground font-bold">
                  No writing section configured for this exam.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <IeltsFooter 
        statuses={questionStatuses} 
        onToggleReview={(q) => handleStatusChange(q, 'review')}
      />
    </div>
  );
}
