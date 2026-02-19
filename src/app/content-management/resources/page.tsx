
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Image as ImageIcon, PlusCircle, Workflow } from 'lucide-react';
import { lectureSlides } from '@/data/k12-content';
import type { Resource } from '@/data/k12-content';
import { AddResourceDialog } from '@/components/k12/AddResourceDialog';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useAssignment } from '@/context/AssignmentContext';

export default function ResourcesPage() {
  const [resources, setResources] = useLocalStorage<Resource[]>('k12-resources', lectureSlides);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openDialog } = useAssignment();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAssign = () => {
    const itemsToAssign = resources
      .filter(res => selectedResources.includes(res.id))
      .map(res => ({ id: res.id, name: res.title, contentType: 'resource' as const }));
    openDialog(itemsToAssign);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResources(resources.map(r => r.id));
    } else {
      setSelectedResources([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedResources(prev => [...prev, id]);
    } else {
      setSelectedResources(prev => prev.filter(resourceId => resourceId !== id));
    }
  };

  const deleteSelected = () => {
    setResources(prev => prev.filter(r => !selectedResources.includes(r.id)));
    setSelectedResources([]);
  };

  const handleAddResource = (newResource: Omit<Resource, 'id'>) => {
    const resourceWithId = { ...newResource, id: `res-${Date.now()}` };
    setResources(prev => [resourceWithId, ...prev]);
  };

  const isAllSelected = resources.length > 0 && selectedResources.length === resources.length;

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">Resources</h1>
            <p className="text-muted-foreground">Manage your lecture slides and other resources.</p>
        </div>
        <div className='flex gap-2'>
            {selectedResources.length > 0 && (
              <>
                <Button variant="outline" onClick={handleAssign}>
                  <Workflow className="mr-2 h-4 w-4" />
                  Assign Selected ({selectedResources.length})
                </Button>
                <Button variant="destructive" onClick={deleteSelected}>
                    <Trash2 className="mr-2" />
                    Delete Selected ({selectedResources.length})
                </Button>
              </>
            )}
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2" />
                Add Resource
            </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lecture Slides</CardTitle>
          <CardDescription>A list of all available lecture slides.</CardDescription>
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
                <TableHead>Description</TableHead>
                <TableHead>Square image</TableHead>
                <TableHead>File Type</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.length > 0 ? resources.map(resource => (
                <TableRow key={resource.id} data-state={selectedResources.includes(resource.id) && 'selected'}>
                  <TableCell>
                    <Checkbox
                      checked={selectedResources.includes(resource.id)}
                      onCheckedChange={(checked) => handleSelectOne(resource.id, !!checked)}
                      aria-label={`Select row for ${resource.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell>{resource.description}</TableCell>
                  <TableCell>
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>{resource.fileType}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
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
                    <TableCell colSpan={6} className="h-24 text-center">
                        No resources found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
     <AddResourceDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddResource}
      />
    </>
  );
}
