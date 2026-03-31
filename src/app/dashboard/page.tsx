'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useClassCreation } from '@/context/ClassCreationContext';
import type { Question } from '@/types';
import type { ParsedClass } from '@/types/class-creation';
import { format, isToday, isBefore, isAfter, parseISO, isValid, startOfToday } from 'date-fns';
import {
  BookCopy, PenSquare, FileQuestion, Upload,
  ArrowRight, GraduationCap, CalendarDays,
  Clock, Monitor, Users, Radio, History,
  Sunrise, LayoutGrid, ChevronRight,
  TrendingUp, BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type AnyExam = { id: string };

// ── date helpers ──────────────────────────────────────────────────────────────
function parseClassDate(s: string): Date | null {
  if (!s) return null;
  const iso = parseISO(s);
  if (isValid(iso)) return iso;
  const d = new Date(s);
  return isValid(d) ? d : null;
}

type ClassStatus = 'today' | 'upcoming' | 'past';
function getClassStatus(cls: ParsedClass): ClassStatus {
  const d = parseClassDate(cls.classDate);
  if (!d) return 'upcoming';
  const tod = startOfToday();
  if (isToday(d)) return 'today';
  if (isBefore(d, tod)) return 'past';
  return 'upcoming';
}

// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [allQuestions] = useLocalStorage<Question[]>('allQuestions', []);
  const [mcqExams]     = useLocalStorage<AnyExam[]>('examServiceMcq', []);
  const [cqExams]      = useLocalStorage<AnyExam[]>('examServiceCq', []);
  const { classes }    = useClassCreation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const mcqCount   = allQuestions.filter(q => q.type === 'mcq' || q.type === 'm1').length;
  const cqCount    = allQuestions.filter(q => q.type === 'cq').length;
  const ieltsCount = allQuestions.filter(q => q.type?.startsWith('ielts')).length;

  const todayClasses    = useMemo(() => classes.filter(c => getClassStatus(c) === 'today'), [classes]);
  const upcomingClasses = useMemo(() =>
    classes
      .filter(c => getClassStatus(c) === 'upcoming')
      .sort((a, b) => {
        const da = parseClassDate(a.classDate)?.getTime() ?? 0;
        const db = parseClassDate(b.classDate)?.getTime() ?? 0;
        return da - db;
      }),
    [classes]
  );
  const pastClasses = useMemo(() => classes.filter(c => getClassStatus(c) === 'past'), [classes]);

  const nextFive = upcomingClasses.slice(0, 5);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' :
    now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-6 border-b">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="text-3xl font-black tracking-tighter uppercase">{greeting}</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {todayClasses.length > 0
              ? `You have ${todayClasses.length} class${todayClasses.length !== 1 ? 'es' : ''} scheduled today.`
              : upcomingClasses.length > 0
              ? `Next class in ${format(parseClassDate(upcomingClasses[0].classDate)!, 'MMM d')} — ${upcomingClasses[0].title || upcomingClasses[0].subject}`
              : 'No upcoming classes. Add a schedule in Class Creation.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/class-creation">
            <Button variant="outline" className="rounded-xl font-bold gap-2 h-9 text-xs">
              <CalendarDays className="h-3.5 w-3.5" /> Class Studio
            </Button>
          </Link>
          <Link href="/question-bank/bulk-upload">
            <Button className="rounded-xl font-bold gap-2 h-9 text-xs shadow-sm shadow-primary/20">
              <Upload className="h-3.5 w-3.5" /> Upload Questions
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Class stats */}
        {[
          { label: 'Today',    value: todayClasses.length,    color: 'text-emerald-600', dot: 'bg-emerald-500', pulse: true },
          { label: 'Upcoming', value: upcomingClasses.length, color: 'text-sky-600',     dot: 'bg-sky-500',     pulse: false },
          { label: 'Past',     value: pastClasses.length,     color: 'text-muted-foreground', dot: 'bg-muted-foreground/40', pulse: false },
          { label: 'Classes',  value: classes.length,         color: 'text-primary',     dot: 'bg-primary',     pulse: false },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border shadow-none col-span-1">
            <CardContent className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  {s.pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${s.dot}`} />
                </span>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
        {/* Separator — hidden on small */}
        <div className="hidden lg:flex items-center justify-center col-span-1">
          <div className="h-12 w-px bg-border" />
        </div>
        {/* Content stats */}
        {[
          { label: 'Questions', value: allQuestions.length, color: 'text-blue-600',   dot: 'bg-blue-500' },
          { label: 'MCQ Exams', value: mcqExams.length,     color: 'text-violet-600', dot: 'bg-violet-500' },
          { label: 'CQ Exams',  value: cqExams.length,      color: 'text-amber-600',  dot: 'bg-amber-500' },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border shadow-none col-span-1">
            <CardContent className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex rounded-full h-2 w-2 ${s.dot}`} />
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Today's Live ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <Sunrise className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-black uppercase tracking-widest">Today's Live</span>
          </div>
          <Link href="/class-creation">
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-1 h-7 text-muted-foreground hover:text-foreground">
              View all <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {todayClasses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/5 py-10 flex flex-col items-center gap-2 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">No classes today</p>
            {upcomingClasses.length > 0 && (
              <p className="text-[11px] text-muted-foreground/50 font-medium">
                Next up: <span className="font-bold">{upcomingClasses[0].title || upcomingClasses[0].subject}</span> on {format(parseClassDate(upcomingClasses[0].classDate)!, 'MMM d')}
              </p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {todayClasses.map(cls => (
              <TodayCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </section>

      {/* ── Main two-column area ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* Left — Upcoming + Question breakdown */}
        <div className="lg:col-span-7 space-y-6">

          {/* Upcoming schedule */}
          <Card className="rounded-2xl border shadow-none overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600" />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Upcoming Schedule</CardTitle>
                <Badge variant="outline" className="text-[9px] font-black bg-sky-500/10 text-sky-700 border-sky-500/20 px-2 py-0">
                  {upcomingClasses.length}
                </Badge>
              </div>
              <Link href="/class-creation">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-1 h-7 text-muted-foreground">
                  All <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {nextFive.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-center">
                  <Clock className="h-7 w-7 text-muted-foreground/20" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">No upcoming classes</p>
                  <Link href="/class-creation">
                    <Button variant="outline" size="sm" className="mt-2 rounded-xl text-xs font-bold gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> Add Classes
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {nextFive.map((cls, i) => {
                    const d = parseClassDate(cls.classDate);
                    return (
                      <div key={cls.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                        {/* Date block */}
                        <div className="shrink-0 w-10 text-center">
                          {d ? (
                            <>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{format(d, 'MMM')}</p>
                              <p className="text-xl font-black leading-none">{format(d, 'd')}</p>
                            </>
                          ) : (
                            <p className="text-[10px] text-muted-foreground font-bold">—</p>
                          )}
                        </div>

                        <div className="w-px h-8 bg-border shrink-0" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black truncate leading-tight">
                            {cls.title || `${cls.subject}${cls.topic ? ` — ${cls.topic}` : ''}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {cls.programs.slice(0, 2).map(p => (
                              <span key={p} className="text-[9px] font-bold text-muted-foreground truncate max-w-[140px]">{p}</span>
                            ))}
                            {cls.programs.length > 2 && (
                              <span className="text-[9px] font-bold text-muted-foreground">+{cls.programs.length - 2}</span>
                            )}
                          </div>
                        </div>

                        {/* Right meta */}
                        <div className="shrink-0 text-right space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {cls.startTime || '—'}
                          </p>
                          <Badge variant="secondary" className="text-[8px] font-bold py-0 px-1.5 gap-1">
                            <Monitor className="h-2 w-2" />{cls.platform || '—'}
                          </Badge>
                        </div>

                        {i === 0 && (
                          <Badge className="shrink-0 bg-sky-500/10 text-sky-700 border border-sky-500/20 text-[8px] font-black px-1.5 py-0">
                            Next
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  {upcomingClasses.length > 5 && (
                    <div className="px-5 py-3 text-center">
                      <Link href="/class-creation">
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-1 text-muted-foreground">
                          +{upcomingClasses.length - 5} more classes <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question bank snapshot */}
          {allQuestions.length > 0 && (
            <Card className="rounded-2xl border shadow-none overflow-hidden">
              <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Question Bank</CardTitle>
                </div>
                <Link href="/question-bank/mcq-questions">
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-1 h-7 text-muted-foreground">
                    Browse <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <Separator />
              <CardContent className="px-5 py-4 space-y-3">
                {/* Progress bars */}
                {[
                  { label: 'MCQ',   count: mcqCount,   total: allQuestions.length, color: 'bg-blue-500',   text: 'text-blue-600' },
                  { label: 'CQ',    count: cqCount,    total: allQuestions.length, color: 'bg-violet-500', text: 'text-violet-600' },
                  { label: 'IELTS', count: ieltsCount, total: allQuestions.length, color: 'bg-amber-500',  text: 'text-amber-600' },
                ].map(row => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{row.label}</span>
                      <span className={`text-[10px] font-black ${row.text}`}>{row.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.color} transition-all duration-700`}
                        style={{ width: row.total > 0 ? `${(row.count / row.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Quick access */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Access</p>
          <div className="space-y-2">
            {[
              {
                label: 'Class Studio',
                desc: 'Create and manage live class schedules',
                href: '/class-creation',
                icon: CalendarDays,
                count: classes.length,
                countLabel: 'classes',
                accent: 'text-emerald-600',
                bg: 'bg-emerald-500/8',
                dot: 'bg-emerald-500',
              },
              {
                label: 'MCQ Exam Service',
                desc: 'Build and publish MCQ exams',
                href: '/exam-service/mcq',
                icon: PenSquare,
                count: mcqExams.length,
                countLabel: 'exams',
                accent: 'text-blue-600',
                bg: 'bg-blue-500/8',
                dot: 'bg-blue-500',
              },
              {
                label: 'CQ Exam Service',
                desc: 'Create constructed question exams',
                href: '/exam-service/cq',
                icon: FileQuestion,
                count: cqExams.length,
                countLabel: 'exams',
                accent: 'text-violet-600',
                bg: 'bg-violet-500/8',
                dot: 'bg-violet-500',
              },
              {
                label: 'IELTS Center',
                desc: 'Manage IELTS exams and questions',
                href: '/exam-service/ielts/dashboard',
                icon: GraduationCap,
                count: ieltsCount,
                countLabel: 'questions',
                accent: 'text-amber-600',
                bg: 'bg-amber-500/8',
                dot: 'bg-amber-500',
              },
              {
                label: 'MCQ Question Bank',
                desc: 'Browse and manage MCQ questions',
                href: '/question-bank/mcq-questions',
                icon: BookCopy,
                count: mcqCount,
                countLabel: 'questions',
                accent: 'text-sky-600',
                bg: 'bg-sky-500/8',
                dot: 'bg-sky-500',
              },
              {
                label: 'Bulk Upload',
                desc: 'Import questions from CSV',
                href: '/question-bank/bulk-upload',
                icon: Upload,
                count: null,
                countLabel: '',
                accent: 'text-slate-600',
                bg: 'bg-muted/40',
                dot: 'bg-slate-400',
              },
            ].map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border hover:shadow-sm transition-all cursor-pointer group hover:border-border/80 ${link.bg}`}>
                    <div className="shrink-0 h-8 w-8 rounded-xl bg-background border flex items-center justify-center shadow-sm">
                      <Icon className={`h-4 w-4 ${link.accent}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-tight truncate">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{link.desc}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {link.count !== null ? (
                        <p className={`text-sm font-black ${link.accent}`}>{link.count}</p>
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      )}
                      {link.count !== null && (
                        <p className="text-[9px] text-muted-foreground font-bold">{link.countLabel}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Past classes summary */}
          {pastClasses.length > 0 && (
            <Card className="rounded-2xl border shadow-none overflow-hidden">
              <CardContent className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center">
                    <History className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Past Live</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{pastClasses.length} completed class{pastClasses.length !== 1 ? 'es' : ''}</p>
                  </div>
                </div>
                <Link href="/class-creation">
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-1 h-7 text-muted-foreground">
                    View <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Today class card ──────────────────────────────────────────────────────────
function TodayCard({ cls }: { cls: ParsedClass }) {
  return (
    <Card className="rounded-2xl border-2 border-emerald-500/25 shadow-sm overflow-hidden bg-gradient-to-br from-emerald-500/[0.04] to-transparent hover:shadow-md transition-all">
      <CardContent className="p-5 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge className="bg-emerald-500 text-white text-[8px] h-4 px-2 font-black gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE TODAY
              </Badge>
              {cls.isMultiDirectional && (
                <Badge className="bg-violet-500/10 text-violet-700 border border-violet-500/20 text-[8px] h-4 px-1.5 font-black">
                  MULTI
                </Badge>
              )}
            </div>
            <p className="font-black text-sm leading-tight line-clamp-2">
              {cls.title || `${cls.subject}${cls.topic ? ` — ${cls.topic}` : ''}`}
            </p>
          </div>
          {/* Placeholder live button */}
          <div className="shrink-0 h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center" title="Go Live (coming soon)">
            <Radio className="h-3.5 w-3.5 text-emerald-600" />
          </div>
        </div>

        {/* Time + platform */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-sm">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            {cls.startTime || '—'}{cls.endTime ? ` – ${cls.endTime}` : ''}
          </div>
          <Badge variant="secondary" className="text-[9px] font-bold gap-1">
            <Monitor className="h-2.5 w-2.5" /> {cls.platform || '—'}
          </Badge>
        </div>

        <Separator />

        {/* Programs */}
        {cls.programs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cls.programs.slice(0, 3).map(p => (
              <Badge key={p} variant="outline" className="text-[9px] py-0 px-1.5 font-bold rounded-full truncate max-w-[160px]">{p}</Badge>
            ))}
            {cls.programs.length > 3 && (
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-bold rounded-full">+{cls.programs.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Teachers */}
        {cls.teacher1 && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">{[cls.teacher1, cls.teacher2].filter(Boolean).join(' · ')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
