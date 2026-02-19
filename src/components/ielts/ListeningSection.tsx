
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Volume2 } from 'lucide-react';

export function ListeningSection() {
    return (
        <div className="p-4 h-full">
            <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center pt-6">
                    <Volume2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h2 className="text-xl font-semibold mt-4">Listening Section</h2>
                    <p className="text-muted-foreground mt-2">This section is currently under development.</p>
                </CardContent>
            </Card>
        </div>
    )
}
