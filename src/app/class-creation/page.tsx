
'use client';

import { useState, useMemo } from 'react';
import { parseClassData } from '@/lib/parse-class-data';
import { useClassCreation } from '@/context/ClassCreationContext';
import type { ParsedClass } from '@/types/class-creation';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Layers,
  Users,
  Monitor,
  BookOpen,
  Trash2,
  Search,
  ClipboardPaste,
  Sparkles,
  RotateCcw,
  GitMerge,
  Info,
  X,
} from 'lucide-react';

type Stage = 'input' | 'preview' | 'saved';

export default function ClassCreationPage() {
  const { classes, addClasses, deleteClass, clearClasses } = useClassCreation();
  const { toast } = useToast();

  const [stage, setStage] = useState<Stage>(classes.length > 0 ? 'saved' : 'input');
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedClass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  // ── Parse ──────────────────────────────────────────────────────────────────
  const handleParse = () => {
    const result = parseClassData(rawText);
    if (result.length === 0) {
      toast({ variant: 'destructive', title: 'No data found', description: 'Make sure you included the header row and the data is tab- or comma-separated.' });
      return;
    }
    setParsed(result);
    setStage('preview');
    toast({ title: `Parsed ${result.length} class${result.length !== 1 ? 'es' : ''}`, description: `${result.filter(c => c.isMultiDirectional).length} multi-directional detected.` });
  };

  // ── Confirm & Save ─────────────────────────────────────────────────────────
  const handleSave = () => {
    addClasses(parsed);
    toast({ title: `${parsed.length} class${parsed.length !== 1 ? 'es' : ''} saved`, description: 'Classes are now available in the saved view.' });
    setParsed([]);
    setRawText('');
    setStage('saved');
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
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
    setStage('input');
  };

  // ── Filtered saved classes ─────────────────────────────────────────────────
  const filteredClasses = useMemo(() => {
    if (!searchTerm.trim()) return classes;
    const q = searchTerm.toLowerCase();
    return classes.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.course.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.chapter.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      c.programs.some(p => p.toLowerCase().includes(q)) ||
      c.classCode.toLowerCase().includes(q)
    );
  }, [classes, searchTerm]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const multiCount = parsed.filter(c => c.isMultiDirectional).length;

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE: INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  if (stage === 'input') {
    return (
      <div className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
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
              Paste your Excel schedule data to create and manage classes.
            </p>
          </div>
          {classes.length > 0 && (
            <Button variant="outline" onClick={() => setStage('saved')} className="rounded-xl font-bold gap-2">
              <BookOpen className="h-4 w-4" />
              View Saved Classes ({classes.length})
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Paste Area */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Paste Excel Data</span>
            </div>
            <Textarea
              placeholder={`Paste your Excel data here (including the header row)...\n\nExample columns:\nClass Code\tMonth\tClass Date\tStart Time\tClass Time\tProgram\tCourse\tSubject\tChapter\tTopic\tTeacher 1\t...`}
              className="h-72 font-mono text-xs bg-muted/5 rounded-2xl border-muted-foreground/20 focus-visible:ring-primary/20 resize-none leading-relaxed"
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <Info className="h-3 w-3" />
              Copy directly from Excel — tab-separated format is auto-detected. Include the header row.
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="rounded-2xl border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Smart Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <GitMerge className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide">Multi-Directional</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-relaxed">
                        Rows sharing the same Course, Subject, Chapter & Topic are merged into one class with multiple programs.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Tab & CSV auto-detect</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Header row mapping</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Duplicate program merge</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> localStorage persistence</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    onClick={handleParse}
                    disabled={!rawText.trim()}
                    className="w-full h-12 rounded-xl font-black text-sm shadow-lg shadow-primary/20 gap-2"
                  >
                    Parse Data
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {rawText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRawText('')}
                      className="w-full text-[10px] font-bold uppercase text-muted-foreground gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Clear Input
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expected columns reference */}
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expected Columns</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {['Class Code', 'Month', 'Class Date', 'Start Time', 'Class Time', 'Program', 'Course', 'Subject', 'Chapter', 'Topic', 'Teacher 1', 'Teacher 2/DS 1', 'Teacher 3/DS 2', 'Platform', 'Title', 'Caption', 'Content Developer', 'Remarks'].map(col => (
                    <Badge key={col} variant="secondary" className="text-[9px] font-bold py-0 px-1.5 rounded-md">{col}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE: PREVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (stage === 'preview') {
    return (
      <div className="flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl border" onClick={() => setStage('input')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">Pre-Flight Verification</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                Review parsed classes before saving
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="h-12 px-8 rounded-xl font-black gap-2 shadow-lg shadow-primary/20"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm & Save All ({parsed.length})
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-2xl border shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-primary">{parsed.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Classes</span>
          </Card>
          <Card className="rounded-2xl border shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-violet-600">{multiCount}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Multi-Directional</span>
          </Card>
          <Card className="rounded-2xl border shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-emerald-600">{parsed.length - multiCount}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Single Program</span>
          </Card>
        </div>

        {/* Multi-directional info banner */}
        {multiCount > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
            <GitMerge className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-violet-700 uppercase tracking-tight">
                {multiCount} Multi-Directional Class{multiCount !== 1 ? 'es' : ''} Detected
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                These rows shared identical Course, Subject, Chapter & Topic values across different Programs and have been merged into single class entries.
              </p>
            </div>
          </div>
        )}

        {/* Preview Table */}
        <Card className="rounded-2xl border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/5 border-b pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight">Parsed Classes</CardTitle>
            <CardDescription className="text-xs">All {parsed.length} classes ready to be saved.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest w-28">Code</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Programs</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Course / Subject</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Chapter / Topic</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Teachers</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Platform</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((cls) => (
                    <TableRow
                      key={cls.id}
                      className={`border-b last:border-0 ${cls.isMultiDirectional ? 'bg-violet-500/[0.03] hover:bg-violet-500/[0.06]' : 'hover:bg-muted/5'}`}
                    >
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <p className="font-black text-xs">{cls.classCode || '—'}</p>
                          {cls.isMultiDirectional && (
                            <Badge className="bg-violet-500 text-white text-[8px] h-4 px-1.5 font-black gap-1">
                              <GitMerge className="h-2.5 w-2.5" /> MULTI
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {cls.programs.map(p => (
                            <Badge key={p} variant="outline" className="text-[9px] py-0 px-1.5 font-bold">{p}</Badge>
                          ))}
                          {cls.programs.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
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
                        <div className="space-y-0.5">
                          {cls.teacher1 && <p className="text-[10px] font-bold">{cls.teacher1}</p>}
                          {cls.teacher2 && <p className="text-[10px] text-muted-foreground">{cls.teacher2}</p>}
                          {cls.teacher3 && <p className="text-[10px] text-muted-foreground">{cls.teacher3}</p>}
                          {!cls.teacher1 && <span className="text-[10px] text-muted-foreground">—</span>}
                        </div>
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

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setStage('input')} className="rounded-xl font-bold gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Input
          </Button>
          <Button onClick={handleSave} className="h-12 px-10 rounded-xl font-black gap-2 shadow-lg shadow-primary/20">
            <CheckCircle className="h-4 w-4" />
            Confirm & Save All ({parsed.length})
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE: SAVED
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
              Class Studio
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Saved Classes
          </h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            {classes.length} class{classes.length !== 1 ? 'es' : ''} in repository
          </p>
        </div>
        <div className="flex gap-3">
          {classes.length > 0 && (
            <Button variant="outline" onClick={() => setConfirmClearOpen(true)} className="rounded-xl font-bold gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
          )}
          <Button onClick={() => setStage('input')} className="rounded-xl font-bold gap-2 shadow-sm">
            <CalendarDays className="h-4 w-4" /> Create New Classes
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {classes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-primary">{classes.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Classes</span>
          </Card>
          <Card className="rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-violet-600">{classes.filter(c => c.isMultiDirectional).length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Multi-Directional</span>
          </Card>
          <Card className="rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-sky-600">{new Set(classes.flatMap(c => c.programs)).size}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Programs</span>
          </Card>
          <Card className="rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-emerald-600">{new Set(classes.map(c => c.course)).size}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Courses</span>
          </Card>
        </div>
      )}

      {/* Search */}
      {classes.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-9 h-10 rounded-xl text-sm bg-background"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
          <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="text-lg font-black uppercase tracking-tight text-muted-foreground/50">No Classes Yet</p>
          <p className="text-sm text-muted-foreground/40 font-medium mt-1 mb-6">Paste your Excel data to create classes.</p>
          <Button onClick={() => setStage('input')} className="rounded-xl font-bold gap-2">
            <CalendarDays className="h-4 w-4" /> Get Started
          </Button>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm font-bold text-muted-foreground uppercase">No classes match your search.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClasses.map(cls => (
            <ClassCard key={cls.id} cls={cls} onDelete={() => setClassToDelete(cls.id)} />
          ))}
        </div>
      )}

      {/* Delete single confirm */}
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

      {/* Clear all confirm */}
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Classes?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete all {classes.length} saved classes from your local repository. This cannot be undone.</AlertDialogDescription>
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

// ── Class Card Component ──────────────────────────────────────────────────────
function ClassCard({ cls, onDelete }: { cls: ParsedClass; onDelete: () => void }) {
  return (
    <Card className={`rounded-2xl border shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200 ${cls.isMultiDirectional ? 'ring-2 ring-violet-500/20' : ''}`}>
      <CardContent className="p-5 space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {cls.classCode && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cls.classCode}</span>
              )}
              {cls.isMultiDirectional && (
                <Badge className="bg-violet-500 text-white text-[8px] h-4 px-1.5 font-black gap-1">
                  <GitMerge className="h-2.5 w-2.5" /> MULTI
                </Badge>
              )}
            </div>
            <p className="font-black text-sm leading-tight line-clamp-2">{cls.title || `${cls.subject} — ${cls.topic}`}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Programs */}
        <div className="flex flex-wrap gap-1.5">
          {cls.programs.map(p => (
            <Badge key={p} variant="outline" className="text-[9px] py-0 px-2 font-bold rounded-full">{p}</Badge>
          ))}
        </div>

        <Separator />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Course</p>
            <p className="text-[11px] font-bold truncate">{cls.course || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subject</p>
            <p className="text-[11px] font-bold truncate">{cls.subject || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Chapter</p>
            <p className="text-[11px] font-bold truncate">{cls.chapter || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Topic</p>
            <p className="text-[11px] font-bold truncate">{cls.topic || '—'}</p>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            <span>{cls.classDate || '—'} {cls.startTime ? `· ${cls.startTime}` : ''}</span>
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
