
'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { ParsedClass } from '@/types/class-creation';

interface ClassCreationContextType {
  classes: ParsedClass[];
  addClass: (c: ParsedClass) => void;
  addClasses: (cs: ParsedClass[]) => void;
  updateClass: (c: ParsedClass) => void;
  deleteClass: (id: string) => void;
  clearClasses: () => void;
}

const ClassCreationContext = createContext<ClassCreationContextType | undefined>(undefined);

export function ClassCreationProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useLocalStorage<ParsedClass[]>('cms-classes', []);

  const addClass = useCallback((c: ParsedClass) => {
    setClasses(prev => [...prev, c]);
  }, [setClasses]);

  const addClasses = useCallback((cs: ParsedClass[]) => {
    setClasses(prev => [...prev, ...cs]);
  }, [setClasses]);

  const updateClass = useCallback((c: ParsedClass) => {
    setClasses(prev => prev.map(existing => existing.id === c.id ? c : existing));
  }, [setClasses]);

  const deleteClass = useCallback((id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  }, [setClasses]);

  const clearClasses = useCallback(() => {
    setClasses([]);
  }, [setClasses]);

  return (
    <ClassCreationContext.Provider value={{
      classes,
      addClass,
      addClasses,
      updateClass,
      deleteClass,
      clearClasses,
    }}>
      {children}
    </ClassCreationContext.Provider>
  );
}

export function useClassCreation() {
  const ctx = useContext(ClassCreationContext);
  if (!ctx) throw new Error('useClassCreation must be used within ClassCreationProvider');
  return ctx;
}
