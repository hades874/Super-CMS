'use client';
import type { DragEvent, MouseEvent } from 'react';
import type { QuestionSet } from '@/types';
import { Badge } from './ui/badge';
import { Package, Eye } from 'lucide-react';
import { Button } from './ui/button';

type QuestionSetCardProps = {
  questionSet: QuestionSet;
  onViewClickAction: (e: MouseEvent<HTMLButtonElement>) => void;
};

export function QuestionSetCard({ questionSet, onViewClickAction }: QuestionSetCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLButtonElement || (e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('questionSetId', questionSet.questionIds.join(','));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group border bg-card p-5 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing transition-all hover:bg-muted/5 flex flex-col gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl transition-transform group-hover:scale-110">
            <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
            <h4 className="font-bold text-sm uppercase tracking-tight">{questionSet.name}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{questionSet.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/50 border-none">
           {questionSet.questionIds.length} Signals
        </Badge>
        <Button 
           variant="ghost" 
           size="sm"
           onClick={onViewClickAction}
           className="h-8 px-4 rounded-lg font-bold text-[10px] uppercase gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
           <Eye className="h-3.5 w-3.5" /> View Matrix
        </Button>
      </div>
    </div>
  );
}
