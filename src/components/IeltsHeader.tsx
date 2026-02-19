'use client';
import { Timer } from 'lucide-react';
import { Button } from './ui/button';

type IeltsHeaderProps = {
    timeLeft: number;
    formatTime: (seconds: number) => string;
}

export function IeltsHeader({ timeLeft, formatTime }: IeltsHeaderProps) {
    return (
         <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
            <h1 className="text-xl font-bold">IELTS Practice Test</h1>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-lg font-semibold text-primary font-mono">
                    <Timer className="h-6 w-6"/>
                    <span>{formatTime(timeLeft)}</span>
                </div>
                <Button variant="outline">Help</Button>
            </div>
        </div>
    )
}
