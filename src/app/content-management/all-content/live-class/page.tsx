
'use client';
import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LiveClass } from '@/types';
import { mockLiveClasses } from '@/data/live-class-data';
import { useAssignment } from '@/context/AssignmentContext';

export default function LiveClassContentPage() {
  const [liveClasses, setLiveClasses] = useLocalStorage<LiveClass[]>('liveClasses', mockLiveClasses);
  const [selected, setSelected] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { openDialog } = useAssignment();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAssign = (item: LiveClass) => {
    openDialog([{ id: item.id, name: item.title, contentType: 'live-class' }]);
  };


  if (!mounted) {
    return null; // or a loading spinner
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(liveClasses.map(lc => lc.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = selected.length > 0 && selected.length === liveClasses.length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Classes</h1>
          <p className="text-muted-foreground">Manage your scheduled and past live classes.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Live Classes</CardTitle>
            <CardDescription>A list of all your live classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                   <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accessible</TableHead>
                <TableHead>Live URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveClasses.length > 0 ? liveClasses.map(item => (
                <TableRow key={item.id} data-state={selected.includes(item.id) && 'selected'}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() => handleSelectOne(item.id)}
                        aria-label={`Select row for ${item.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.start}</TableCell>
                    <TableCell>{item.end}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'scheduled' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={item.accessible === 'private' ? 'outline' : 'default'}>
                            {item.accessible}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAssign(item)}>
                        <Workflow className="mr-2 h-4 w-4"/>
                        Assign
                      </Button>
                    </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                        No live classes found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
