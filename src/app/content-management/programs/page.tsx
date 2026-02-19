'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { AddProgramDialog } from '@/components/k12/AddProgramDialog';

export type Program = {
  id: string;
  name: string;
};

export default function ProgramsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [programs, setPrograms] = useLocalStorage<Program[]>('k12-programs', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddProgram = (newProgram: Omit<Program, 'id'>) => {
    const programWithId = { ...newProgram, id: `prog-${Date.now()}` };
    setPrograms(prev => [...prev, programWithId]);
  };

  const handleDeleteProgram = (programId: string) => {
    // Note: In a real app, you'd also want to handle orphaned courses.
    setPrograms(prev => prev.filter(p => p.id !== programId));
  };
  
  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Create and manage educational programs.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2" />
          Add Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>A list of all created programs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programs.length > 0 ? (
              programs.map(program => (
                <div key={program.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{program.name}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProgram(program.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No programs created yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AddProgramDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddProgram}
      />
    </>
  );
}
