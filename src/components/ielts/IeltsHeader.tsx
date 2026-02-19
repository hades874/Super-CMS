
'use client';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

type IeltsHeaderProps = {
    testTitle: string;
    timeLeft: number;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export function IeltsHeader({ testTitle, timeLeft }: IeltsHeaderProps) {
    return (
         <div className="flex justify-between items-center bg-card px-6 py-4 border-b shadow-sm">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h1 className="text-sm font-bold uppercase tracking-tight text-foreground/80">{testTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
                 <div className={cn(
                    "flex items-center gap-2.5 px-4 py-1.5 rounded-lg font-bold text-lg tabular-nums border transition-colors",
                    timeLeft < 300 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted/50 text-foreground border-transparent"
                 )}>
                    <Timer className="h-4 w-4 opacity-70"/>
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
            </div>
        </div>
    )
}
