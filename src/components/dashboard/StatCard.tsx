'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimatedCounterProps = {
  end: number;
  duration?: number;
};

function AnimatedCounter({ end, duration = 1500 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      const currentCount = Math.floor(progress * end);
      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
        cancelAnimationFrame(animationFrame);
        startTimeRef.current = null;
    };
  }, [end, duration]);

  return <span className="text-3xl font-bold tracking-tight">{count.toLocaleString()}</span>;
}


type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
};

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Card className="group overflow-hidden border-none bg-card hover:bg-accent/5 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className={cn("absolute inset-y-0 left-0 w-1 bg-muted-foreground/20 group-hover:bg-primary transition-colors", color && color.replace('text-', 'bg-'))} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-6 px-6">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                <div className={cn("p-2 rounded-lg bg-muted/50 group-hover:bg-background transition-colors", color)}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                {mounted ? <AnimatedCounter end={value} /> : <div className="text-3xl font-bold tracking-tight">0</div>}
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-emerald-500 font-medium">+12%</span>
                    <span>from last month</span>
                </div>
            </CardContent>
        </Card>
    );
}
