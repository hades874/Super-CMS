
'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Workflow } from 'lucide-react';
import { AddFbClassDialog } from '@/components/k12/AddFbClassDialog';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useAssignment } from '@/context/AssignmentContext';

type FbLiveContent = {
  id: string;
  name: string;
  facebookLiveUrl: string;
  startAt: string;
  endAt: string;
  instructorName?: string;
  recordingId?: string;
}

export default function FbLiveContentPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useLocalStorage<FbLiveContent[]>('fbLiveContent', []);
  const [mounted, setMounted] = useState(false);
  const { openDialog } = useAssignment();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddContent = (newContent: any) => {
    const contentWithId: FbLiveContent = { 
      ...newContent, 
      id: `fb-${Date.now()}`,
      startAt: newContent.startAt.toISOString(),
      endAt: newContent.endAt.toISOString()
    };
    setContent(prev => [...prev, contentWithId]);
  }

  const handleAssign = (item: FbLiveContent) => {
    openDialog([{ id: item.id, name: item.name, contentType: 'fb-live' }]);
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">FB Live Content</h1>
          <p className="text-muted-foreground">Manage your Facebook Live classes.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2" />
          Add FB Class
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All FB Live Classes</CardTitle>
            <CardDescription>A list of all scheduled and past live classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.length > 0 ? content.map(item => (
                <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.instructorName || 'N/A'}</TableCell>
                    <TableCell>{new Date(item.startAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(item.endAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleAssign(item)}>
                          <Workflow className="mr-2 h-4 w-4"/>
                          Assign
                        </Button>
                    </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No content found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddFbClassDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddContent}
      />
    </>
  );
}
