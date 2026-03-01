'use client';
import { ScrollArea } from "./ui/scroll-area";

type SectionContentProps = {
    title: string;
    instructions: string;
}

export function SectionContent({ title, instructions }: SectionContentProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-1">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-6">{instructions}</p>
                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-10">
                    <p>Content for the {title.toLowerCase()} will appear here.</p>
                </div>
            </div>
        </ScrollArea>
    )
}
