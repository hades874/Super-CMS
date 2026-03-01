
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
              <Construction className="h-8 w-8 text-primary" />
              Settings
          </CardTitle>
           <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page will host application settings.</p>
          <Link href="/exam-creation">
            <Button className="mt-4">Go to Exam Creation</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
