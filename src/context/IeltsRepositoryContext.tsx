

'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Question } from '@/types';
import type { IeltsExam, IeltsExamAttempt } from '@/types/ielts-exam';
import { mockQuestions } from '@/data/mock-questions';

interface IeltsRepositoryContextType {
  questions: Question[];
  allQuestions: Question[];
  addQuestions: (newQuestions: Question[]) => void;
  updateQuestion: (updatedQuestion: Question) => void;
  updateMultipleQuestions: (updatedQuestions: Question[]) => void;
  deleteQuestion: (id: string, isGeneral?: boolean) => void;
  deleteMultipleQuestions: (ids: string[], isGeneral?: boolean) => void;
  setAllQuestions: (questions: Question[] | ((prev: Question[]) => Question[])) => void;
  clearRepository: () => void;
  exportData: () => void;
  importData: (json: string) => void;
  // Exam Management
  exams: IeltsExam[];
  addExam: (exam: IeltsExam) => void;
  updateExam: (exam: IeltsExam) => void;
  deleteExam: (id: string) => void;
  // Attempt Management
  attempts: IeltsExamAttempt[];
  addAttempt: (attempt: IeltsExamAttempt) => void;
  updateAttempt: (attempt: IeltsExamAttempt) => void;
}

const IeltsRepositoryContext = createContext<IeltsRepositoryContextType | undefined>(undefined);

export function IeltsRepositoryProvider({ children }: { children: ReactNode }) {
  // We use the same keys to maintain compatibility with existing data
  const [questions, setQuestions] = useLocalStorage<Question[]>('ieltsQuestions', []);
  const [allQuestions, setAllQuestionsDirect] = useLocalStorage<Question[]>('allQuestions', []);
  const [exams, setExams] = useLocalStorage<IeltsExam[]>('ieltsExams', []);
  const [attempts, setAttempts] = useLocalStorage<IeltsExamAttempt[]>('ieltsAttempts', []);

  const addQuestions = useCallback((newQuestions: Question[]) => {
    setQuestions(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const filteredNew = newQuestions.filter(q => !existingIds.has(q.id));
        return [...prev, ...filteredNew];
    });
  }, [setQuestions]);

  const updateQuestion = useCallback((updatedQuestion: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    setAllQuestionsDirect(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  }, [setQuestions, setAllQuestionsDirect]);

  const updateMultipleQuestions = useCallback((updatedQuestions: Question[]) => {
    const updatedIds = new Set(updatedQuestions.map(q => q.id));
    const updateMap = new Map(updatedQuestions.map(q => [q.id, q]));
    
    setQuestions(prev => prev.map(q => updatedIds.has(q.id) ? updateMap.get(q.id)! : q));
    setAllQuestionsDirect(prev => prev.map(q => updatedIds.has(q.id) ? updateMap.get(q.id)! : q));
  }, [setQuestions, setAllQuestionsDirect]);

  const deleteQuestion = useCallback((id: string, isGeneral: boolean = false) => {
    if (isGeneral) {
      setAllQuestionsDirect(prev => prev.filter(q => q.id !== id));
    } else {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  }, [setQuestions, setAllQuestionsDirect]);

  const deleteMultipleQuestions = useCallback((ids: string[], isGeneral: boolean = false) => {
    if (isGeneral) {
      setAllQuestionsDirect(prev => prev.filter(q => !ids.includes(q.id)));
    } else {
      setQuestions(prev => prev.filter(q => !ids.includes(q.id)));
    }
  }, [setQuestions, setAllQuestionsDirect]);

  const setAllQuestions = useCallback((value: Question[] | ((prev: Question[]) => Question[])) => {
    setAllQuestionsDirect(value);
  }, [setAllQuestionsDirect]);

  const addExam = useCallback((exam: IeltsExam) => {
    setExams(prev => [...prev, exam]);
  }, [setExams]);

  const updateExam = useCallback((exam: IeltsExam) => {
    setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
  }, [setExams]);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  }, [setExams]);

  const addAttempt = useCallback((attempt: IeltsExamAttempt) => {
    setAttempts(prev => [...prev, attempt]);
  }, [setAttempts]);

  const updateAttempt = useCallback((attempt: IeltsExamAttempt) => {
    setAttempts(prev => prev.map(a => a.id === attempt.id ? attempt : a));
  }, [setAttempts]);

  const clearRepository = useCallback(() => {
    console.log("Clearing IELTS Repository...");
    setQuestions([]);
    setAllQuestionsDirect([]);
    setExams([]);
    setAttempts([]);
    // Direct removal for robustness - set to explicit empty array
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ieltsQuestions', '[]');
      window.localStorage.setItem('allQuestions', '[]');
      window.localStorage.setItem('ieltsExams', '[]');
      window.localStorage.setItem('ieltsAttempts', '[]');
      window.dispatchEvent(new Event("local-storage"));
    }
  }, [setQuestions, setAllQuestionsDirect, setExams, setAttempts]);

  const exportData = useCallback(() => {
    const data = {
        ieltsQuestions: questions,
        allQuestions: allQuestions,
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms-cache-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [questions, allQuestions]);

  const importData = useCallback((json: string) => {
    try {
        const data = JSON.parse(json);
        if (data.ieltsQuestions) setQuestions(data.ieltsQuestions);
        if (data.allQuestions) setAllQuestionsDirect(data.allQuestions);
    } catch (e) {
        console.error("Failed to import cache data", e);
        throw new Error("Invalid backup file format.");
    }
  }, [setQuestions, setAllQuestionsDirect]);

  return (
    <IeltsRepositoryContext.Provider value={{ 
      questions, 
      allQuestions,
      addQuestions, 
      updateQuestion,
      updateMultipleQuestions,
      deleteQuestion, 
      deleteMultipleQuestions,
      setAllQuestions,
      clearRepository,
      exportData,
      importData,
      exams,
      addExam,
      updateExam,
      deleteExam,
      attempts,
      addAttempt,
      updateAttempt
    }}>
      {children}
    </IeltsRepositoryContext.Provider>
  );
}

export function useIeltsRepository() {
  const context = useContext(IeltsRepositoryContext);
  if (context === undefined) {
    throw new Error('useIeltsRepository must be used within an IeltsRepositoryProvider');
  }
  return context;
}
