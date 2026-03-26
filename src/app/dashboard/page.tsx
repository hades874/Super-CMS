'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Question } from '@/types';
import {
  BookCopy, PenSquare, FileQuestion, Upload,
  ArrowRight, GraduationCap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type AnyExam = { id: string };

export default function DashboardPage() {
  const [allQuestions] = useLocalStorage<Question[]>('allQuestions', []);
  const [mcqExams] = useLocalStorage<AnyExam[]>('examServiceMcq', []);
  const [cqExams] = useLocalStorage<AnyExam[]>('examServiceCq', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const mcqCount = allQuestions.filter(q => q.type === 'mcq' || q.type === 'm1').length;
  const cqCount = allQuestions.filter(q => q.type === 'cq').length;
  const ieltsCount = allQuestions.filter(q => q.type?.startsWith('ielts')).length;
  const otherCount = allQuestions.length - mcqCount - cqCount - ieltsCount;

  const stats = [
    { label: 'Total Questions', value: allQuestions.length, accent: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'MCQ', value: mcqCount, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'CQ', value: cqCount, accent: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'IELTS', value: ieltsCount, accent: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const quickLinks = [
    {
      label: 'MCQ Questions',
      description: 'Browse and manage your MCQ question bank',
      href: '/question-bank/mcq-questions',
      icon: BookCopy,
      count: mcqCount,
      accent: 'text-blue-600',
    },
    {
      label: 'CQ Questions',
      description: 'Browse and manage your CQ question bank',
      href: '/question-bank/cq-questions',
      icon: FileQuestion,
      count: cqCount,
      accent: 'text-violet-600',
    },
    {
      label: 'MCQ Exam Service',
      description: 'Create and configure MCQ exams',
      href: '/exam-service/mcq',
      icon: PenSquare,
      count: mcqExams.length,
      accent: 'text-emerald-600',
    },
    {
      label: 'CQ Exam Service',
      description: 'Create and configure CQ exams',
      href: '/exam-service/cq',
      icon: PenSquare,
      count: cqExams.length,
      accent: 'text-amber-600',
    },
    {
      label: 'Bulk Upload',
      description: 'Import questions from CSV files',
      href: '/question-bank/bulk-upload',
      icon: Upload,
      count: null,
      accent: 'text-slate-600',
    },
    {
      label: 'IELTS Center',
      description: 'Manage IELTS exams and question bank',
      href: '/exam-service/ielts/dashboard',
      icon: GraduationCap,
      count: ieltsCount,
      accent: 'text-rose-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {allQuestions.length === 0
            ? 'No questions in bank yet. Start by uploading questions.'
            : `${allQuestions.length.toLocaleString()} question${allQuestions.length !== 1 ? 's' : ''} across ${[mcqCount > 0, cqCount > 0, ieltsCount > 0, otherCount > 0].filter(Boolean).length} type${[mcqCount > 0, cqCount > 0, ieltsCount > 0, otherCount > 0].filter(Boolean).length !== 1 ? 's' : ''} in the question bank.`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(stat => (
          <Card key={stat.label} className="border shadow-none rounded-2xl">
            <CardContent className="pt-5 pb-5 px-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question breakdown bar */}
      {allQuestions.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Question Breakdown</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {mcqCount > 0 && (
              <div
                className="bg-blue-500 rounded-l-full"
                style={{ width: `${(mcqCount / allQuestions.length) * 100}%` }}
                title={`MCQ: ${mcqCount}`}
              />
            )}
            {cqCount > 0 && (
              <div
                className="bg-violet-500"
                style={{ width: `${(cqCount / allQuestions.length) * 100}%` }}
                title={`CQ: ${cqCount}`}
              />
            )}
            {ieltsCount > 0 && (
              <div
                className="bg-amber-500"
                style={{ width: `${(ieltsCount / allQuestions.length) * 100}%` }}
                title={`IELTS: ${ieltsCount}`}
              />
            )}
            {otherCount > 0 && (
              <div
                className="bg-slate-300 rounded-r-full"
                style={{ width: `${(otherCount / allQuestions.length) * 100}%` }}
                title={`Other: ${otherCount}`}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: 'MCQ', count: mcqCount, color: 'bg-blue-500' },
              { label: 'CQ', count: cqCount, color: 'bg-violet-500' },
              { label: 'IELTS', count: ieltsCount, color: 'bg-amber-500' },
              { label: 'Other', count: otherCount, color: 'bg-slate-300' },
            ].filter(t => t.count > 0).map(t => (
              <div key={t.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${t.color} shrink-0`} />
                <span className="text-[10px] text-muted-foreground font-medium">{t.label} ({t.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick access */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Quick Access</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="border shadow-none rounded-2xl hover:bg-muted/40 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-5 pb-5 px-5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 shrink-0 ${link.accent}`} />
                        <p className="text-sm font-semibold truncate">{link.label}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">{link.description}</p>
                      {link.count !== null && (
                        <p className={`text-xs font-bold mt-2 ${link.accent}`}>
                          {link.count} {link.count === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
