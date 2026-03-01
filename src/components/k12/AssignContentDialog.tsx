'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ContentAssignment, ContentItem } from '@/context/AssignmentContext';
import { useAssignment } from '@/context/AssignmentContext';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

type StagedAssignment = {
  id: string;
  type: 'program' | 'course' | 'chapter';
  name: string;
};

export function AssignContentDialog() {
  const { 
    isDialogOpen, 
    closeDialog, 
    contentToAssign, 
    allPrograms, 
    allCourses, 
    allChapters,
    getAssignmentsForContent,
    saveAssignments 
  } = useAssignment();

  const [stagedAssignments, setStagedAssignments] = useState<StagedAssignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  
  useEffect(() => {
    if (isDialogOpen && contentToAssign.length > 0) {
      // Initialize with existing assignments for the first item
      const firstItem = contentToAssign[0];
      const existingAssignments = getAssignmentsForContent(firstItem.id, firstItem.contentType);
      
      const staged: StagedAssignment[] = existingAssignments.map(a => {
        let name = '';
        if (a.assignmentType === 'program') {
          name = allPrograms.find(p => p.id === a.assignmentId)?.name || 'Unknown Program';
        } else if (a.assignmentType === 'course') {
          name = allCourses.find(c => c.id === a.assignmentId)?.name || 'Unknown Course';
        } else if (a.assignmentType === 'chapter') {
          name = allChapters.find(ch => ch.id === a.assignmentId)?.name || 'Unknown Chapter';
        }
        return { id: a.assignmentId, type: a.assignmentType, name };
      }).filter(a => a.name);

      setStagedAssignments(staged);
    } else {
      setStagedAssignments([]);
      setSelectedProgram(null);
      setSelectedCourse(null);
      setSelectedChapter(null);
    }
  }, [isDialogOpen, contentToAssign, getAssignmentsForContent, allPrograms, allCourses, allChapters]);

  const availableCourses = useMemo(() => {
    if (!selectedProgram) return [];
    return allCourses.filter(c => c.programId === selectedProgram);
  }, [selectedProgram, allCourses]);

  const availableChapters = useMemo(() => {
    if (!selectedCourse) return [];
    return allChapters.filter(c => c.courseId === selectedCourse);
  }, [selectedCourse, allChapters]);

  useEffect(() => {
    setSelectedCourse(null);
  }, [selectedProgram]);

  useEffect(() => {
    setSelectedChapter(null);
  }, [selectedCourse]);


  const handleAddAssignment = () => {
    let assignmentToAdd: StagedAssignment | null = null;
    if (selectedChapter) {
      const chapter = allChapters.find(c => c.id === selectedChapter);
      if(chapter) assignmentToAdd = { id: chapter.id, type: 'chapter', name: chapter.name };
    } else if (selectedCourse) {
      const course = allCourses.find(c => c.id === selectedCourse);
      if(course) assignmentToAdd = { id: course.id, type: 'course', name: course.name };
    } else if (selectedProgram) {
      const program = allPrograms.find(p => p.id === selectedProgram);
      if(program) assignmentToAdd = { id: program.id, type: 'program', name: program.name };
    }

    if (assignmentToAdd && !stagedAssignments.some(a => a.id === assignmentToAdd!.id && a.type === assignmentToAdd!.type)) {
      setStagedAssignments(prev => [...prev, assignmentToAdd!]);
    }
  };

  const removeStagedAssignment = (assignmentId: string, type: string) => {
    setStagedAssignments(prev => prev.filter(a => !(a.id === assignmentId && a.type === type)));
  };

  const handleSave = () => {
    if (contentToAssign.length === 0) return;

    const newAssignments: Omit<ContentAssignment, 'contentId' | 'contentType'>[] = stagedAssignments.map(a => ({
      assignmentId: a.id,
      assignmentType: a.type,
    }));

    saveAssignments(contentToAssign, newAssignments);
    closeDialog();
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Content</DialogTitle>
          <DialogDescription>
            Assigning {contentToAssign.length > 1 ? `${contentToAssign.length} items` : `"${contentToAssign[0]?.name}"`} to programs, courses, or chapters.
          </DialogDescription>
           {contentToAssign.length > 1 && (
            <div className="pt-2">
                <Badge variant="secondary">Editing assignments for multiple items</Badge>
            </div>
           )}
        </DialogHeader>
        
        <div className="space-y-4">
            <div>
              <Label>Select Curriculum Path</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <Select onValueChange={setSelectedProgram} value={selectedProgram || ''}>
                      <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                      <SelectContent>{allPrograms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedCourse} value={selectedCourse || ''} disabled={availableCourses.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                      <SelectContent>{availableCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={setSelectedChapter} value={selectedChapter || ''} disabled={availableChapters.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger>
                      <SelectContent>{availableChapters.map(ch => <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>)}</SelectContent>
                  </Select>
              </div>
            </div>
            <Button onClick={handleAddAssignment} className="w-full" variant="outline" disabled={!selectedProgram}>
              <Workflow className="mr-2 h-4 w-4" /> Add Assignment Path
            </Button>
        </div>

        <Separator className="my-4"/>

        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="font-semibold mb-2">Staged Assignments ({stagedAssignments.length})</h4>
          <ScrollArea className="border rounded-md h-48">
            <div className="p-4 space-y-2">
              {stagedAssignments.length > 0 ? stagedAssignments.map(a => (
                <div key={`${a.type}-${a.id}`} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                  <span className="flex-1">{a.name} <Badge variant="secondary" className="ml-2">{a.type}</Badge></span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStagedAssignment(a.id, a.type)}>
                    <X className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No assignments added yet.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
