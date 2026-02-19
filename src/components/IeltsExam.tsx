
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';


export function IeltsExam() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4 sm:p-8">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            IELTS Mock Tests
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Prepare for the official Computer-Delivered IELTS with a realistic exam simulation.
          </p>
        </div>
        <div className="w-full max-w-md">
           <Card>
            <CardHeader>
                <CardTitle>Academic Test 1</CardTitle>
                <CardDescription>A full-length practice test covering Listening, Reading, and Writing.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/exam/ielts-academic-1">
                    <Button className="w-full">
                        Start Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
           </Card>
        </div>
      </div>
  );
}
