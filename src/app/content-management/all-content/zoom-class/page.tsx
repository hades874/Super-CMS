
'use client';
import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Pencil, PlusCircle, Trash2, Workflow } from 'lucide-react';
import type { ZoomClass } from '@/types';
import { mockZoomClasses } from '@/data/zoom-class-data';
import { useAssignment } from '@/context/AssignmentContext';

export default function ZoomClassContentPage() {
  const [zoomClasses, setZoomClasses] = useLocalStorage<ZoomClass[]>('zoomClasses', mockZoomClasses);
  const [selected, setSelected] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { openDialog } = useAssignment();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAssign = (item: ZoomClass) => {
    openDialog([{ id: item.id, name: item.title, contentType: 'zoom-class' }]);
  };


  if (!mounted) {
    return null; // or a loading spinner
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(zoomClasses.map(lc => lc.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const deleteSelected = () => {
    setZoomClasses(prev => prev.filter(r => !selected.includes(r.id)));
    setSelected([]);
  };

  const isAllSelected = selected.length > 0 && selected.length === zoomClasses.length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Zoom Classes</h1>
          <p className="text-muted-foreground">Manage your scheduled and past Zoom classes.</p>
        </div>
         <div className='flex gap-2'>
            {selected.length > 0 && (
            <Button variant="destructive" onClick={deleteSelected}>
                <Trash2 className="mr-2" />
                Delete Selected ({selected.length})
            </Button>
            )}
            <Button>
                <PlusCircle className="mr-2" />
                Add Class
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Zoom Classes</CardTitle>
            <CardDescription>A list of all your Zoom classes.</CardDescription>
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
                <TableHead>Meeting ID</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Live URL</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zoomClasses.length > 0 ? zoomClasses.map(item => (
                <TableRow key={item.id} data-state={selected.includes(item.id) && 'selected'}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() => handleSelectOne(item.id)}
                        aria-label={`Select row for ${item.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.meetingId}</TableCell>
                    <TableCell>{item.start}</TableCell>
                    <TableCell>{item.end}</TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAssign(item)}>
                                <Workflow className="mr-2 h-4 w-4"/>
                                Assign
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No Zoom classes found.
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
