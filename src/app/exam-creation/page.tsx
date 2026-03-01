
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Eye, Save, Trash2, Home } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { QuestionComposition } from '@/components/QuestionComposition';
import type { Question, Exam } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function ExamCreationPage() {
  const [examType, setExamType] = useState('');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examName, setExamName] = useState('');
  const [examSlug, setExamSlug] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState(60);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [totalMark, setTotalMark] = useState(100);
  const [passPercentage, setPassPercentage] = useState(40);

  const [savedExams, setSavedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const { toast } = useToast();
  const router = useRouter();

  const handleExamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setExamName(name);
    setExamSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const saveExam = () => {
    if (!examName) {
      toast({ variant: 'destructive', title: 'Exam title is required.' });
      return;
    }
    if (examQuestions.length === 0) {
      toast({ variant: 'destructive', title: 'At least one question is required.' });
      return;
    }
    if (!startDate || !endDate) {
      toast({ variant: 'destructive', title: 'Start and end dates are required.' });
      return;
    }
    
    const newExam: Exam = {
      id: examSlug || `exam-${Date.now()}`,
      name: examName,
      questions: examQuestions,
      duration: duration,
      negativeMarking: negativeMarks,
      windowStart: startDate.toISOString(),
      windowEnd: endDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    setSavedExams([...savedExams, newExam]);
    toast({ title: 'Exam saved as draft!', description: 'You can view it in the exams list.'});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create New Exam</h1>
          <p className="text-muted-foreground">Configure exam settings based on exam type</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/exams')}><Eye className="mr-2"/> View Saved Exams</Button>
          <Button variant="outline" onClick={saveExam}><Save className="mr-2"/> Save as Draft</Button>
          <Button>Publish Exam</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <Label htmlFor="exam-type">Exam Type *</Label>
            <Select onValueChange={setExamType} value={examType}>
              <SelectTrigger id="exam-type">
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="practice-question">Practice Question</SelectItem>
                <SelectItem value="cq">CQ</SelectItem>
                <SelectItem value="ielts-academic-reading">IELTS ACADEMIC READING</SelectItem>
                <SelectItem value="ielts-general-reading">IELTS GENERAL READING</SelectItem>
                <SelectItem value="ielts-listening">IELTS LISTENING</SelectItem>
                <SelectItem value="ielts-speaking">IELTS SPEAKING</SelectItem>
                <SelectItem value="ielts-academic-writing">IELTS ACADEMIC WRITING</SelectItem>
                <SelectItem value="ielts-general-writing">IELTS GENERAL WRITING</SelectItem>
                <SelectItem value="ielts-mock-test">IELTS MOCK TEST</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">Select the type to load relevant fields</p>
          </div>
        </CardContent>
      </Card>

      {examType === 'mcq' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Exam Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="exam-title">Exam Title *</Label>
                        <Input id="exam-title" placeholder="Enter exam title" value={examName} onChange={handleExamNameChange}/>
                    </div>
                    <div>
                        <Label htmlFor="exam-slug">Exam Slug *</Label>
                        <Input id="exam-slug" value={examSlug} readOnly />
                        <p className="text-sm text-muted-foreground mt-2">Auto-generated from title</p>
                    </div>
                    <div>
                        <Label htmlFor="start-date">Start Date & Time</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="end-date">End Date & Time</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input id="duration" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="total-questions">Total Number of Questions *</Label>
                        <Input id="total-questions" value={examQuestions.length} readOnly />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Scoring & Grading</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="negative-marks">Per Question Negative Marks</Label>
                        <Input id="negative-marks" type="number" value={negativeMarks} onChange={e => setNegativeMarks(parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="total-mark">Total Mark</Label>
                        <Input id="total-mark" type="number" value={totalMark} onChange={e => setTotalMark(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="pass-percentage">Pass Percentage</Label>
                        <Input id="pass-percentage" type="number" value={passPercentage} onChange={e => setPassPercentage(parseInt(e.target.value))} />
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Attempt & Accessibility</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="live-attempt">Per User Live Attempt *</Label>
                        <Input id="live-attempt" defaultValue="1" />
                    </div>
                    <div>
                        <Label htmlFor="retake-attempt">Per User Retake Attempt</Label>
                        <Input id="retake-attempt" defaultValue="0" />
                    </div>
                    <div className="space-y-3">
                         <div className="flex items-center space-x-2">
                            <Checkbox id="accessible" />
                            <Label htmlFor="accessible" className="font-normal">Accessible (Available to users)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="show-solution" />
                            <Label htmlFor="show-solution" className="font-normal">Show solution tab</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="show-result" />
                            <Label htmlFor="show-result" className="font-normal">Show result tab</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="show-leaderboard" />
                            <Label htmlFor="show-leaderboard" className="font-normal">Leaderboard</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <QuestionComposition 
              selectedQuestions={examQuestions}
              setSelectedQuestionsAction={setExamQuestions}
            />
          </div>
        </div>
      )}

      {examType === 'cq' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>CQ Exam Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="exam-title-cq">Exam Title *</Label>
                        <Input id="exam-title-cq" placeholder="Enter exam title" value={examName} onChange={handleExamNameChange}/>
                    </div>
                    <div>
                        <Label htmlFor="exam-slug-cq">Exam Slug *</Label>
                        <Input id="exam-slug-cq" value={examSlug} readOnly />
                        <p className="text-sm text-muted-foreground mt-2">Auto-generated from title</p>
                    </div>
                    <div>
                        <Label htmlFor="start-date-cq">Start Date & Time</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="end-date-cq">End Date & Time</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="duration-cq">Duration (minutes) *</Label>
                        <Input id="duration-cq" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="total-mark-cq">Total Mark</Label>
                        <Input id="total-mark-cq" type="number" value={totalMark} onChange={e => setTotalMark(parseInt(e.target.value))} />
                    </div>
                     <div className="flex items-center space-x-2 pt-4">
                        <Checkbox id="show-leaderboard-cq" />
                        <Label htmlFor="show-leaderboard-cq" className="font-normal">Leaderboard</Label>
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <QuestionComposition 
              selectedQuestions={examQuestions}
              setSelectedQuestionsAction={setExamQuestions}
            />
          </div>
        </div>
      )}

      {examType === 'practice-question' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Practice Question Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="exam-title">Exam Title *</Label>
                            <Input id="exam-title" placeholder="Enter exam title" value={examName} onChange={handleExamNameChange}/>
                        </div>
                        <div>
                            <Label htmlFor="exam-slug">Exam Slug *</Label>
                            <Input id="exam-slug" value={examSlug} readOnly />
                            <p className="text-sm text-muted-foreground mt-2">Auto-generated from title</p>
                        </div>
                        <div>
                            <Label htmlFor="start-date">Start Date & Time</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label htmlFor="end-date">End Date & Time</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label htmlFor="total-questions">Total Number of Questions *</Label>
                            <Input id="total-questions" value={examQuestions.length} readOnly />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <QuestionComposition 
                    selectedQuestions={examQuestions}
                    setSelectedQuestionsAction={setExamQuestions}
                />
            </div>
        </div>
      )}
    </div>
  );
}
