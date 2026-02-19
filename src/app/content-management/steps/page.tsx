
'use client';
import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Program } from '@/app/content-management/programs/page';

export default function StepsPage() {
  const [mounted, setMounted] = useState(false);
  const [programs] = useLocalStorage<Program[]>('k12-programs', []);
  const [mockData] = useState([
    { id: '1', title: 'One Shot Class' },
    { id: '2', title: 'কেমিস্ট্রি দাগানো বই' },
    { id: '3', title: 'Monthly Exam' },
    { id: '4', title: 'Weekly Exam' },
    { id: '5', title: 'Basic Building' },
    { id: '6', title: 'Orientation Class' },
    { id: '7', title: 'Chemistry 2nd Paper' },
    { id: '8', title: 'Chemistry 1st Paper' },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayData = programs.length > 0 ? programs.map(p => ({id: p.id, title: p.name})) : mockData;


  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
       <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Steps</h1>
            <p className="text-muted-foreground">Manage steps and chapters for your curriculum components.</p>
          </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Curriculum Overview</CardTitle>
                <CardDescription>List of all major curriculum components.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="text-right w-[200px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline">Steps</Button>
                                        <Button variant="destructive">Chapter</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
