'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Program } from '../programs/page';
import type { Course } from '../courses/page';
import { AddChapterDialog } from '@/components/k12/AddChapterDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Chapter = {
  id: string;
  name: string;
  courseId: string;
};

export default function ChaptersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [programs] = useLocalStorage<Program[]>('k12-programs', []);
  const [courses] = useLocalStorage<Course[]>('k12-courses', []);
  const [chapters, setChapters] = useLocalStorage<Chapter[]>('k12-chapters', []);
  
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddChapter = (newChapter: Omit<Chapter, 'id'>) => {
    const chapterWithId = { ...newChapter, id: `chap-${Date.now()}` };
    setChapters(prev => [...prev, chapterWithId]);
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const availableCourses = useMemo(() => {
    if (!selectedProgram) return [];
    return courses.filter(c => c.programId === selectedProgram);
  }, [selectedProgram, courses]);

  const chaptersForSelectedCourse = useMemo(() => {
    if (!selectedCourse) return [];
    return chapters.filter(c => c.courseId === selectedCourse);
  }, [selectedCourse, chapters]);


  // Reset selected course if the program changes and the current course is not in the new program
  useEffect(() => {
    if (selectedProgram && selectedCourse) {
        const programCourses = courses.filter(c => c.programId === selectedProgram);
        if(!programCourses.some(c => c.id === selectedCourse)) {
            setSelectedCourse(null);
        }
    } else if (!selectedProgram) {
        setSelectedCourse(null);
    }
  }, [selectedProgram, selectedCourse, courses]);
  
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chapters</h1>
          <p className="text-muted-foreground">Manage chapters within courses.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedProgram} value={selectedProgram || ''}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedCourse} value={selectedCourse || ''} disabled={!selectedProgram}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a Course" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedCourse}>
                <PlusCircle className="mr-2" />
                Add Chapter
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapters in &quot;{courses.find(c=>c.id === selectedCourse)?.name || '... '}&quot;</CardTitle>
          <CardDescription>A list of all chapters for the selected course.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedCourse ? (
              chaptersForSelectedCourse.length > 0 ? (
                chaptersForSelectedCourse.map(chapter => (
                  <div key={chapter.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{chapter.name}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteChapter(chapter.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No chapters found for this course.
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Please select a program and course to view chapters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {selectedCourse && (
        <AddChapterDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleAddChapter}
          courseId={selectedCourse}
        />
      )}
    </>
  );
}
