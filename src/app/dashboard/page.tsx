'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Question, QuestionSet, Exam } from '@/types';
import { StatCard } from '@/components/dashboard/StatCard';
import { ContentChart } from '@/components/dashboard/ContentChart';
import { BookCopy, Layers, Video, Clapperboard, Users, BrainCircuit, Activity, Settings, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type FbLiveContent = { id: string; };
type Resource = { id: string; };

export default function DashboardPage() {
  const [allQuestions] = useLocalStorage<Question[]>('allQuestions', []);
  const [savedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8"><div className="h-64 bg-muted animate-pulse rounded-3xl" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-10 text-primary-foreground">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back, Admin</h1>
                <p className="text-primary-foreground/80 max-w-md text-base">
                    The platform is optimally synced. You have {savedExams.length} active exams ready for deployment.
                </p>
            </div>
            <BrainCircuit className="absolute right-12 top-1/2 -translate-y-1/2 h-24 w-24 text-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Questions" value={allQuestions.length} icon={BookCopy} color="text-primary" />
            <StatCard title="Exams" value={savedExams.length} icon={Activity} color="text-primary" />
            <StatCard title="Active Users" value={1248} icon={Users} color="text-primary" />
            <StatCard title="Health" value={99} icon={Settings} color="text-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Content Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ContentChart data={[
                        { name: 'MCQ', value: allQuestions.filter(q => q.type === 'mcq').length },
                        { name: 'CQ', value: allQuestions.filter(q => q.type === 'cq').length },
                        { name: 'IELTS', value: allQuestions.filter(q => q.type?.startsWith('ielts')).length }
                    ]} />
                </CardContent>
            </Card>

            <Card className="border shadow-sm rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Recent Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3 text-sm items-center py-2 border-b last:border-0">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold text-xs">Platform Synchronization Completed</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{i} hour ago</p>
                            </div>
                        </div>
                    ))}
                    <Link href="/question-bank/mcq-questions" className="block pt-4">
                        <Button variant="outline" className="w-full rounded-xl text-xs font-bold">VIEW ALL DATA</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
