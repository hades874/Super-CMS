
'use client';
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import type { QuestionStatus } from '@/types';

type IeltsFooterProps = {
  statuses: Record<number, QuestionStatus>;
  onToggleReview: (questionNumber: number) => void;
  // onNavigate: (questionNumber: number) => void; // For future use
};

export function IeltsFooter({ statuses, onToggleReview }: IeltsFooterProps) {
  const totalQuestions = Object.keys(statuses).length;

  return (
    <footer className="bg-card border-t p-3 flex flex-col">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-3">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
            (qNumber) => {
              const status = statuses[qNumber];
              const isReview = status === 'review';
              return (
                <div key={qNumber} className="flex flex-col items-center gap-1">
                  <Button
                    variant="outline"
                    // onClick={() => onNavigate(qNumber)}
                    className={cn(
                      'h-9 w-9 p-0 rounded-full relative',
                      status === 'answered' && 'bg-ielts-answered text-white',
                      status === 'review' && 'bg-ielts-review text-black'
                    )}
                  >
                    {qNumber}
                    {isReview && <div className="absolute top-[-2px] right-[-2px] bg-ielts-review h-3 w-3 rounded-full border-2 border-card" />}
                  </Button>
                  <button onClick={() => onToggleReview(qNumber)} className="flex items-center justify-center">
                    <Flag className={cn("h-4 w-4 text-muted-foreground", isReview && "fill-current text-ielts-review")} />
                  </button>
                </div>
              );
            }
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
       <div className="flex items-center justify-between pt-3 border-t">
          <Button variant="outline"><ChevronLeft className="mr-2"/> Back</Button>
          <div className="flex items-center gap-2">
            <Button>Submit</Button>
          </div>
          <Button variant="outline">Next <ChevronRight className="ml-2"/></Button>
       </div>
    </footer>
  );
}
