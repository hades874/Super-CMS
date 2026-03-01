
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PenSquare } from 'lucide-react';
import type { WritingTask as WritingTaskType } from '@/types';
import { IeltsWritingSection } from '../IeltsWritingSection';


export function WritingSection({ tasks }: { tasks: WritingTaskType[] }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="p-4 h-full">
                <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center pt-6">
                        <PenSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="text-xl font-semibold mt-4">Writing Section</h2>
                        <p className="text-muted-foreground mt-2">Writing tasks are not loaded for this test.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <IeltsWritingSection questions={tasks} />
}
