'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Program } from '../programs/page';
import { AddCourseDialog } from '@/components/k12/AddCourseDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Course = {
  id: string;
  name: string;
  programId: string;
};

export default function CoursesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [programs] = useLocalStorage<Program[]>('k12-programs', []);
  const [courses, setCourses] = useLocalStorage<Course[]>('k12-courses', []);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddCourse = (newCourse: Omit<Course, 'id'>) => {
    const courseWithId = { ...newCourse, id: `course-${Date.now()}` };
    setCourses(prev => [...prev, courseWithId]);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };
  
  if (!mounted) {
    return null;
  }

  const coursesForSelectedProgram = selectedProgram ? courses.filter(c => c.programId === selectedProgram) : [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage courses within programs.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedProgram} value={selectedProgram || ''}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)} disabled={!selectedProgram}>
                <PlusCircle className="mr-2" />
                Add Course
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses in &quot;{programs.find(p=>p.id === selectedProgram)?.name || '... '}&quot;</CardTitle>
          <CardDescription>A list of all courses for the selected program.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedProgram && coursesForSelectedProgram.length > 0 ? (
              coursesForSelectedProgram.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{course.name}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {selectedProgram ? 'No courses found for this program.' : 'Please select a program to view its courses.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {selectedProgram && (
        <AddCourseDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleAddCourse}
          programId={selectedProgram}
        />
      )}
    </>
  );
}
