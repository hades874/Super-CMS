
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { ReadingSection, ListeningSection, WritingSection } from '@/types';

export interface ExamConfiguration {
  id: string;
  title: string;
  type: 'Academic' | 'General Training';
  duration: number; // minutes
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string;
  listeningSection: ListeningSection;
  readingSection: ReadingSection;
  writingSection: WritingSection;
}

interface ExamRepositoryContextType {
  exams: ExamConfiguration[];
  addExam: (exam: Omit<ExamConfiguration, 'id' | 'createdAt'>) => string;
  updateExam: (id: string, updates: Partial<ExamConfiguration>) => void;
  deleteExam: (id: string) => void;
  getExam: (id: string) => ExamConfiguration | undefined;
  publishExam: (id: string) => void;
  exportExams: () => void;
  clearExams: () => void;
}

const ExamRepositoryContext = createContext<ExamRepositoryContextType | undefined>(undefined);

export function ExamRepositoryProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useLocalStorage<ExamConfiguration[]>('ielts-exams', []);

  const addExam = (examData: Omit<ExamConfiguration, 'id' | 'createdAt'>): string => {
    const newExam: ExamConfiguration = {
      ...examData,
      id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setExams([...exams, newExam]);
    return newExam.id;
  };

  const updateExam = (id: string, updates: Partial<ExamConfiguration>) => {
    setExams(exams.map((exam: ExamConfiguration) => exam.id === id ? { ...exam, ...updates } : exam));
  };

  const deleteExam = (id: string) => {
    setExams(exams.filter((exam: ExamConfiguration) => exam.id !== id));
  };

  const getExam = (id: string) => {
    return exams.find((exam: ExamConfiguration) => exam.id === id);
  };

  const publishExam = (id: string) => {
    setExams(exams.map((exam: ExamConfiguration) => 
      exam.id === id 
        ? { ...exam, status: 'published' as const, publishedAt: new Date().toISOString() }
        : exam
    ));
  };

  const exportExams = () => {
    const dataStr = JSON.stringify(exams, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ielts-exams-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearExams = () => {
    setExams([]);
  };

  return (
    <ExamRepositoryContext.Provider value={{
      exams,
      addExam,
      updateExam,
      deleteExam,
      getExam,
      publishExam,
      exportExams,
      clearExams
    }}>
      {children}
    </ExamRepositoryContext.Provider>
  );
}

export function useExamRepository() {
  const context = useContext(ExamRepositoryContext);
  if (!context) {
    throw new Error('useExamRepository must be used within ExamRepositoryProvider');
  }
  return context;
}
