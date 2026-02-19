
'use client';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Exam } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { format } from 'date-fns';
import { mockExams } from '@/data/exam-data';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Workflow } from 'lucide-react';
import { useAssignment } from '@/context/AssignmentContext';

export default function ExamContentPage() {
  const [savedExams, setSavedExams] = useLocalStorage<Exam[]>('savedExams', mockExams);
  const [selected, setSelected] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { openDialog } = useAssignment();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAssign = () => {
    const itemsToAssign = savedExams
      .filter(exam => selected.includes(exam.id))
      .map(exam => ({ id: exam.id, name: exam.name, contentType: 'exam' as const }));
    openDialog(itemsToAssign);
  };

  const getStatus = (start: string, end: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return { text: 'Upcoming', variant: 'outline' };
    if (now > endDate) return { text: 'Window Closed', variant: 'secondary' };
    return { text: 'Active', variant: 'default' };
  };
  
  if (!mounted) {
    return null; // Or a loading spinner
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelected(savedExams.map(e => e.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const isAllSelected = selected.length > 0 && selected.length === savedExams.length;
  const isPartiallySelected = selected.length > 0 && selected.length < savedExams.length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Exams</h1>
          <p className="text-muted-foreground">Manage all created exams.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
          <CardDescription>A list of all exams created on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                   <Checkbox
                    checked={isAllSelected ? true : (isPartiallySelected ? 'indeterminate' : false)}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedExams.length > 0 ? savedExams.map(exam => {
                const status = getStatus(exam.windowStart, exam.windowEnd);
                return (
                  <TableRow key={exam.id} data-state={selected.includes(exam.id) && 'selected'}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(exam.id)}
                          onCheckedChange={() => handleSelectOne(exam.id)}
                          aria-label={`Select row for ${exam.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>{format(new Date(exam.windowStart), 'yyyy-MM-dd h:mm a')}</TableCell>
                      <TableCell>{format(new Date(exam.windowEnd), 'yyyy-MM-dd h:mm a')}</TableCell>
                      <TableCell>
                          <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No exams found. Create one from the Exam Creation page.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selected.length > 0 ? `${selected.length} of ${savedExams.length} row(s) selected.` : `${savedExams.length} total exams.`}
            </div>
            <div className="flex items-center gap-4">
              {selected.length > 0 && (
                <Button variant="outline" onClick={handleAssign}>
                  <Workflow className="mr-2 h-4 w-4" />
                  Assign Selected ({selected.length})
                </Button>
              )}
               <div className="flex items-center space-x-2">
                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" disabled>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-8 w-8 p-0" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page 1 of 1
                </div>
                <Button variant="outline" className="h-8 w-8 p-0" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" disabled>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
        </CardFooter>
      </Card>
    </>
  );
}
