
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Program } from '@/app/content-management/programs/page';
import type { Course } from '@/app/content-management/courses/page';
import type { Chapter } from '@/app/content-management/chapters/page';
import useLocalStorage from '@/hooks/useLocalStorage';

export type ContentItem = {
  id: string;
  name: string;
  contentType: 'exam' | 'fb-live' | 'zoom-class' | 'live-class' | 'resource';
};

export type ContentAssignment = {
  contentId: string;
  contentType: ContentItem['contentType'];
  assignmentId: string;
  assignmentType: 'program' | 'course' | 'chapter';
};

type AssignmentContextType = {
  isDialogOpen: boolean;
  openDialog: (items: ContentItem[]) => void;
  closeDialog: () => void;
  contentToAssign: ContentItem[];
  allPrograms: Program[];
  allCourses: Course[];
  allChapters: Chapter[];
  getAssignmentsForContent: (contentId: string, contentType: ContentItem['contentType']) => ContentAssignment[];
  saveAssignments: (items: ContentItem[], newAssignments: Omit<ContentAssignment, 'contentId' | 'contentType'>[]) => void;
};

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const AssignmentProvider = ({ children }: { children: ReactNode }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentToAssign, setContentToAssign] = useState<ContentItem[]>([]);
  
  const [programs] = useLocalStorage<Program[]>('k12-programs', []);
  const [courses] = useLocalStorage<Course[]>('k12-courses', []);
  const [chapters] = useLocalStorage<Chapter[]>('k12-chapters', []);
  const [assignments, setAssignments] = useLocalStorage<ContentAssignment[]>('content-assignments', []);

  const openDialog = (items: ContentItem[]) => {
    if (items.length > 0) {
      setContentToAssign(items);
      setIsDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setContentToAssign([]);
  };
  
  const getAssignmentsForContent = (contentId: string, contentType: ContentItem['contentType']) => {
    return assignments.filter(a => a.contentId === contentId && a.contentType === contentType);
  };

  const saveAssignments = (items: ContentItem[], newRawAssignments: Omit<ContentAssignment, 'contentId' | 'contentType'>[]) => {
    const itemIds = items.map(i => i.id);

    // Remove old assignments for the items being updated
    const remainingAssignments = assignments.filter(a => !itemIds.includes(a.contentId));

    // Create new assignment records for each item
    const newAssignments: ContentAssignment[] = items.flatMap(item => 
      newRawAssignments.map(raw => ({
        ...raw,
        contentId: item.id,
        contentType: item.contentType,
      }))
    );

    setAssignments([...remainingAssignments, ...newAssignments]);
  };

  return (
    <AssignmentContext.Provider value={{ 
      isDialogOpen, 
      openDialog, 
      closeDialog, 
      contentToAssign,
      allPrograms: programs,
      allCourses: courses,
      allChapters: chapters,
      getAssignmentsForContent,
      saveAssignments
    }}>
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
};
