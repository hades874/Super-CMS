'use client';

import React, { useState, useMemo } from 'react';
import { parseClassData } from '@/lib/parse-class-data';
import { useClassCreation } from '@/context/ClassCreationContext';
import type { ParsedClass } from '@/types/class-creation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { startOfToday, isToday, isBefore, parseISO, isValid } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Monitor,
  Trash2,
  Search,
  ClipboardPaste,
  Sparkles,
  RotateCcw,
  GitMerge,
  Info,
  X,
  Edit2,
  Radio,
  Clock,
  History,
  Sunrise,
  Users,
  LayoutGrid,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { EditClassDialog } from '@/components/k12/EditClassDialog';
import { cn } from '@/lib/utils';

// ── Date helpers ──────────────────────────────────────────────────────────────
function parseClassDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const iso = parseISO(dateStr);
  if (isValid(iso)) return iso;
  const d = new Date(dateStr);
  if (isValid(d)) return d;
  return null;
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

type PreviewStage = 'input' | 'preview';
type FilterStatus = 'all' | 'upcoming' | 'past';

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClassCreationPage() {
  const { classes, addClasses, updateClass, deleteClass, clearClasses } = useClassCreation();
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<'create' | 'classes'>('create');

  // Create-tab internal stage
  const [createStage, setCreateStage] = useState<PreviewStage>('input');
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedClass[]>([]);

  // Classes-tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<ParsedClass | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleParse = () => {
    const result = parseClassData(rawText);
    if (result.length === 0) {
      toast({ variant: 'destructive', title: 'No data found', description: 'Make sure you included the header row and the data is tab- or comma-separated.' });
      return;
    }
    setParsed(result);
    setCreateStage('preview');
    toast({
      title: `Parsed ${result.length} class${result.length !== 1 ? 'es' : ''}`,
      description: `${result.filter(c => c.isMultiDirectional).length} multi-directional detected.`,
    });
  };

  const handleSave = () => {
    addClasses(parsed);
    toast({ title: `${parsed.length} class${parsed.length !== 1 ? 'es' : ''} saved` });
    setParsed([]);
    setRawText('');
    setCreateStage('input');
    setActiveTab('classes');
  };

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      deleteClass(classToDelete);
      toast({ title: 'Class deleted' });
      setClassToDelete(null);
    }
  };

  const handleClearAll = () => {
    clearClasses();
    toast({ title: 'All classes cleared' });
    setConfirmClearOpen(false);
  };

  const handleUpdateClass = (updated: ParsedClass) => {
    updateClass(updated);
    toast({ title: 'Class updated successfully' });
  };

  const openEdit = (cls: ParsedClass) => {
    setEditingClass(cls);
    setIsEditOpen(true);
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const multiCount = parsed.filter(c => c.isMultiDirectional).length;

  const todayClasses    = useMemo(() => classes.filter(c => getClassStatus(c) === 'today'),    [classes]);
  const upcomingClasses = useMemo(() => classes.filter(c => getClassStatus(c) === 'upcoming'), [classes]);
  const pastClasses     = useMemo(() => classes.filter(c => getClassStatus(c) === 'past'),     [classes]);

  const filteredUpcoming = useMemo(() => {
    const base = filterStatus === 'past' ? [] : upcomingClasses;
    if (!searchTerm.trim()) return base;
    return base.filter(c => matchesSearch(c, searchTerm));
  }, [upcomingClasses, searchTerm, filterStatus]);

  const filteredPast = useMemo(() => {
    const base = filterStatus === 'upcoming' ? [] : pastClasses;
    if (!searchTerm.trim()) return base;
    return base.filter(c => matchesSearch(c, searchTerm));
  }, [pastClasses, searchTerm, filterStatus]);

  const filteredToday = useMemo(() => {
    if (!searchTerm.trim()) return todayClasses;
    return todayClasses.filter(c => matchesSearch(c, searchTerm));
  }, [todayClasses, searchTerm]);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
              Class Studio
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Class Creation
          </h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Bulk-create and manage your live class schedule.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />{todayClasses.length} Today</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500 inline-block" />{upcomingClasses.length} Upcoming</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40 inline-block" />{pastClasses.length} Past</span>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'create' | 'classes')} className="flex-1 flex flex-col">
        <TabsList className="w-fit mb-8 h-11 rounded-2xl bg-muted/40 p-1 gap-1">
          <TabsTrigger
            value="create"
            className="rounded-xl px-5 font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Classes
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="rounded-xl px-5 font-black text-xs uppercase tracking-widest gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            My Classes
            {classes.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {classes.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: CREATE                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="create" className="flex-1 mt-0 animate-in fade-in duration-300">
          {createStage === 'input' ? (
            /* ── Input stage ─────────────────────────────────────────────── */
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <ClipboardPaste className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Paste Excel Data</span>
                </div>
                <Textarea
                  placeholder={`Paste your Excel data here (including the header row)...\n\nExample:\nClass Code\tMonth\tClass Date\tStart Time\tClass Time\tProgram\tCourse\tSubject\tChapter\tTopic\tTeacher 1\t...`}
                  className="h-80 font-mono text-xs bg-muted/5 rounded-2xl border-muted-foreground/20 focus-visible:ring-primary/20 resize-none leading-relaxed"
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                />
                <p className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  <Info className="h-3 w-3" />
                  Copy directly from Excel — tab-separated format is auto-detected. Include the header row.
                </p>
              </div>

              <div className="lg:col-span-4 space-y-4">
                {/* Smart detection card */}
                <Card className="rounded-2xl border shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/10 border-b pb-4">
                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Smart Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <GitMerge className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wide">Multi-Directional</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-relaxed">
                          Rows sharing the same Course, Subject, Chapter &amp; Topic are merged into one class with multiple programs.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {['Tab & CSV auto-detect', 'Header row mapping', 'Duplicate program merge', 'Joining URL support'].map(f => (
                        <p key={f} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" /> {f}
                        </p>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button
                        onClick={handleParse}
                        disabled={!rawText.trim()}
                        className="w-full h-12 rounded-xl font-black text-sm shadow-lg shadow-primary/20 gap-2"
                      >
                        Parse Data <ArrowRight className="h-4 w-4" />
                      </Button>
                      {rawText && (
                        <Button variant="ghost" size="sm" onClick={() => setRawText('')}
                          className="w-full text-[10px] font-bold uppercase text-muted-foreground gap-1">
                          <RotateCcw className="h-3 w-3" /> Clear Input
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Expected columns */}
                <Card className="rounded-2xl border shadow-sm">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expected Columns</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {['Class Code','Month','Class Date','Start Time','Class Time','Program','Course','Subject','Chapter','Topic','Teacher 1','Teacher 2/DS 1','Teacher 3/DS 2','Platform','Title','Caption','Content Developer','Remarks','Joining URL'].map(col => (
                        <Badge key={col} variant="secondary" className="text-[9px] font-bold py-0 px-1.5 rounded-md">{col}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* ── Preview stage ───────────────────────────────────────────── */
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Preview header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-xl border h-9 w-9" onClick={() => setCreateStage('input')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">Pre-Flight Verification</h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Review {parsed.length} parsed classes before saving</p>
                  </div>
                </div>
                <Button onClick={handleSave} className="h-11 px-8 rounded-xl font-black gap-2 shadow-lg shadow-primary/20">
                  <CheckCircle className="h-4 w-4" />
                  Save All ({parsed.length})
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Classes', value: parsed.length, color: 'text-primary' },
                  { label: 'Multi-Directional', value: multiCount, color: 'text-violet-600' },
                  { label: 'Single Program', value: parsed.length - multiCount, color: 'text-emerald-600' },
                ].map(s => (
                  <Card key={s.label} className="rounded-2xl border shadow-sm p-5 flex flex-col items-center text-center">
                    <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{s.label}</span>
                  </Card>
                ))}
              </div>

              {multiCount > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                  <GitMerge className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-violet-700 uppercase tracking-tight">
                      {multiCount} Multi-Directional Class{multiCount !== 1 ? 'es' : ''} Detected
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      These rows shared identical Course, Subject, Chapter &amp; Topic values and have been merged into single class entries.
                    </p>
                  </div>
                </div>
              )}

              {/* Preview table */}
              <Card className="rounded-2xl border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/5 border-b py-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-tight">Parsed Classes</CardTitle>
                  <CardDescription className="text-xs">All {parsed.length} classes ready to be saved.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[420px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
                        <TableRow className="hover:bg-transparent">
                          {['Code','Programs','Course / Subject','Chapter / Topic','Date','Teachers','Platform'].map(h => (
                            <TableHead key={h} className="text-[10px] font-black uppercase tracking-widest">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsed.map(cls => (
                          <TableRow key={cls.id} className={cls.isMultiDirectional ? 'bg-violet-500/[0.03] hover:bg-violet-500/[0.06]' : 'hover:bg-muted/5'}>
                            <TableCell className="py-3">
                              <p className="font-black text-xs">{cls.classCode || '—'}</p>
                              {cls.isMultiDirectional && (
                                <Badge className="bg-violet-500 text-white text-[8px] h-4 px-1.5 font-black gap-1 mt-1">
                                  <GitMerge className="h-2.5 w-2.5" /> MULTI
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {cls.programs.length === 0
                                  ? <span className="text-[10px] text-muted-foreground">—</span>
                                  : cls.programs.map(p => <Badge key={p} variant="outline" className="text-[9px] py-0 px-1.5 font-bold">{p}</Badge>)
                                }
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="font-bold text-xs">{cls.course}</p>
                              <p className="text-[10px] text-muted-foreground">{cls.subject}</p>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="font-bold text-xs">{cls.chapter}</p>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{cls.topic}</p>
                            </TableCell>
                            <TableCell className="py-3">
                              <p className="text-xs font-bold">{cls.classDate || '—'}</p>
                              <p className="text-[10px] text-muted-foreground">{cls.startTime}</p>
                            </TableCell>
                            <TableCell className="py-3">
                              {cls.teacher1 ? <p className="text-[10px] font-bold">{cls.teacher1}</p> : <span className="text-[10px] text-muted-foreground">—</span>}
                              {cls.teacher2 && <p className="text-[10px] text-muted-foreground">{cls.teacher2}</p>}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge variant="secondary" className="text-[9px] font-bold py-0 px-1.5">{cls.platform || '—'}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCreateStage('input')} className="rounded-xl font-bold gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Input
                </Button>
                <Button onClick={handleSave} className="h-11 px-10 rounded-xl font-black gap-2 shadow-lg shadow-primary/20">
                  <CheckCircle className="h-4 w-4" /> Save All ({parsed.length})
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: MY CLASSES                                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="classes" className="flex-1 mt-0 animate-in fade-in duration-300">
          {classes.length === 0 ? (
            /* ── Empty state ─────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-muted-foreground/50">No Classes Yet</p>
              <p className="text-sm text-muted-foreground/40 font-medium mt-1 mb-6">Paste your Excel data in the Create tab to get started.</p>
              <Button onClick={() => setActiveTab('create')} className="rounded-xl font-bold gap-2">
                <Plus className="h-4 w-4" /> Create Classes
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">

              {/* ── Today's Live ─────────────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <Sunrise className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-black uppercase tracking-widest">Today's Live</span>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>

                {todayClasses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/5 p-8 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-muted-foreground/50 uppercase tracking-tight">No classes scheduled for today</p>
                      <p className="text-xs text-muted-foreground/40 font-medium mt-0.5">Check the upcoming section below for your next sessions.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {todayClasses.map(cls => (
                      <TodayClassCard
                        key={cls.id}
                        cls={cls}
                        onDelete={() => setClassToDelete(cls.id)}
                        onEdit={() => openEdit(cls)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <Separator />

              {/* ── Search & Filter ───────────────────────────────────────── */}
              <section className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, program, course, teacher..."
                    className="pl-9 h-10 rounded-xl text-sm bg-background"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex rounded-xl border bg-muted/20 p-1 gap-1">
                    {(['all', 'upcoming', 'past'] as FilterStatus[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilterStatus(f)}
                        className={cn(
                          'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                          filterStatus === f
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmClearOpen(true)}
                    className="text-[10px] font-bold uppercase text-destructive/70 hover:text-destructive hover:bg-destructive/5 gap-1 h-9 px-3 rounded-xl"
                  >
                    <Trash2 className="h-3 w-3" /> Clear All
                  </Button>
                </div>
              </section>

              {/* ── Upcoming ─────────────────────────────────────────────── */}
              {filterStatus !== 'past' && (
                <section>
                  <SectionHeader
                    icon={<Clock className="h-4 w-4 text-sky-600" />}
                    label="Upcoming"
                    count={filteredUpcoming.length}
                    total={upcomingClasses.length}
                    color="sky"
                  />
                  {filteredUpcoming.length === 0 ? (
                    <EmptySection message={searchTerm ? 'No upcoming classes match your search.' : 'No upcoming classes.'} />
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                      {filteredUpcoming.map(cls => (
                        <ClassCard
                          key={cls.id}
                          cls={cls}
                          status="upcoming"
                          onDelete={() => setClassToDelete(cls.id)}
                          onEdit={() => openEdit(cls)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── Past Live ────────────────────────────────────────────── */}
              {filterStatus !== 'upcoming' && (
                <section>
                  <SectionHeader
                    icon={<History className="h-4 w-4 text-muted-foreground" />}
                    label="Past Live"
                    count={filteredPast.length}
                    total={pastClasses.length}
                    color="muted"
                  />
                  {filteredPast.length === 0 ? (
                    <EmptySection message={searchTerm ? 'No past classes match your search.' : 'No past classes.'} />
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                      {filteredPast.map(cls => (
                        <ClassCard
                          key={cls.id}
                          cls={cls}
                          status="past"
                          onDelete={() => setClassToDelete(cls.id)}
                          onEdit={() => openEdit(cls)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <EditClassDialog
        cls={editingClass}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={handleUpdateClass}
      />

      <AlertDialog open={!!classToDelete} onOpenChange={open => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the class from your local repository.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Classes?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete all {classes.length} saved classes. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function matchesSearch(c: ParsedClass, q: string): boolean {
  const s = q.toLowerCase();
  return (
    (c.title || '').toLowerCase().includes(s) ||
    (c.course || '').toLowerCase().includes(s) ||
    (c.subject || '').toLowerCase().includes(s) ||
    (c.chapter || '').toLowerCase().includes(s) ||
    (c.topic || '').toLowerCase().includes(s) ||
    (c.teacher1 || '').toLowerCase().includes(s) ||
    (c.teacher2 || '').toLowerCase().includes(s) ||
    c.programs.some(p => p.toLowerCase().includes(s)) ||
    (c.classCode || '').toLowerCase().includes(s)
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-muted-foreground/15 bg-muted/5 py-8 flex items-center justify-center">
      <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">{message}</p>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon, label, count, total, color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: 'sky' | 'muted';
}) {
  const styles = {
    sky:  { border: 'border-sky-500/30',  badge: 'bg-sky-500/10 text-sky-700 border-sky-500/20' },
    muted:{ border: 'border-muted-foreground/20', badge: 'bg-muted/30 text-muted-foreground border-muted-foreground/20' },
  }[color];

  return (
    <div className={`flex items-center gap-3 pb-3 border-b ${styles.border}`}>
      {icon}
      <span className="text-sm font-black uppercase tracking-widest">{label}</span>
      <Badge variant="outline" className={`text-[10px] font-black px-2 py-0 ${styles.badge}`}>{count}</Badge>
      {count !== total && (
        <span className="text-[10px] text-muted-foreground font-bold">of {total}</span>
      )}
    </div>
  );
}

// ── Today class card (featured / larger) ──────────────────────────────────────
function TodayClassCard({ cls, onDelete, onEdit }: { cls: ParsedClass; onDelete: () => void; onEdit: () => void }) {
  return (
    <Card className={cn(
      'rounded-2xl border-2 shadow-md overflow-hidden group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-emerald-500/[0.03] to-transparent',
      cls.isMultiDirectional ? 'border-violet-500/30' : 'border-emerald-500/25'
    )}>
      <CardContent className="p-5 space-y-4">
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge className="bg-emerald-500 text-white text-[8px] h-4 px-2 font-black gap-1">
                <span className="relative flex h-1.5 w-1.5 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE TODAY
              </Badge>
              {cls.isMultiDirectional && (
                <Badge className="bg-violet-500 text-white text-[8px] h-4 px-1.5 font-black gap-1">
                  <GitMerge className="h-2.5 w-2.5" /> MULTI
                </Badge>
              )}
              {cls.classCode && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cls.classCode}</span>
              )}
            </div>
            <p className="font-black text-sm leading-tight line-clamp-2">{cls.title || `${cls.subject} — ${cls.topic}`}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Live button — placeholder */}
            <Button variant="ghost" size="icon"
              className="h-7 w-7 rounded-lg text-emerald-600 hover:bg-emerald-50"
              title="Go Live (coming soon)" type="button">
              <Radio className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Programs */}
        {cls.programs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cls.programs.map(p => (
              <Badge key={p} variant="outline" className="text-[9px] py-0 px-2 font-bold rounded-full">{p}</Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Time + Platform */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>{cls.startTime || '—'}{cls.endTime ? ` – ${cls.endTime}` : ''}</span>
          </div>
          <Badge variant="secondary" className="text-[9px] font-bold gap-1">
            <Monitor className="h-2.5 w-2.5" /> {cls.platform || '—'}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
          <div><span className="font-black uppercase text-muted-foreground tracking-widest">Course </span><span className="font-bold">{cls.course || '—'}</span></div>
          <div><span className="font-black uppercase text-muted-foreground tracking-widest">Subject </span><span className="font-bold">{cls.subject || '—'}</span></div>
          {cls.teacher1 && (
            <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground font-bold">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">{[cls.teacher1, cls.teacher2].filter(Boolean).join(' · ')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Regular class card ────────────────────────────────────────────────────────
function ClassCard({
  cls, status, onDelete, onEdit,
}: {
  cls: ParsedClass;
  status: ClassStatus;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const statusBadge = {
    today:    { label: 'Today',       cls: 'bg-emerald-500 text-white' },
    upcoming: { label: 'Unscheduled', cls: 'bg-muted text-muted-foreground border' },
    past:     { label: 'Past Live',   cls: 'bg-rose-500/10 text-rose-600 border border-rose-500/20' },
  }[status];

  return (
    <Card className={cn(
      'rounded-2xl border shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200',
      cls.isMultiDirectional && 'ring-2 ring-violet-500/20',
      status === 'past' && 'opacity-75 hover:opacity-100'
    )}>
      <CardContent className="p-5 space-y-3">
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {cls.classCode && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cls.classCode}</span>
              )}
              {cls.isMultiDirectional && (
                <Badge className="bg-violet-500 text-white text-[8px] h-4 px-1.5 font-black gap-1">
                  <GitMerge className="h-2.5 w-2.5" /> MULTI
                </Badge>
              )}
              <Badge className={`text-[8px] h-4 px-1.5 font-black ${statusBadge.cls}`}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="font-black text-sm leading-tight line-clamp-2">{cls.title || `${cls.subject} — ${cls.topic}`}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {status !== 'past' && (
              <Button variant="ghost" size="icon"
                className="h-7 w-7 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-default"
                title="Go Live (coming soon)" type="button">
                <Radio className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Programs */}
        {cls.programs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cls.programs.map(p => (
              <Badge key={p} variant="outline" className="text-[9px] py-0 px-2 font-bold rounded-full">{p}</Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[['Course', cls.course], ['Subject', cls.subject], ['Chapter', cls.chapter], ['Topic', cls.topic]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{k}</p>
              <p className="text-[11px] font-bold truncate">{v || '—'}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            <span>{cls.classDate || '—'}{cls.startTime ? ` · ${cls.startTime}` : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Monitor className="h-3 w-3" />
            <span>{cls.platform || '—'}</span>
          </div>
        </div>

        {(cls.teacher1 || cls.teacher2) && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">{[cls.teacher1, cls.teacher2, cls.teacher3].filter(Boolean).join(' · ')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
