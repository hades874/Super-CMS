'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type CsvUploaderProps = {
    examType: string;
}

export function CsvUploader({ examType }: CsvUploaderProps) {
    const [questionType, setQuestionType] = useState('');

    const getQuestionTypes = () => {
        switch(examType) {
            case 'Reading':
                return ["Multiple Choice", "Fill in the Blanks", "True/False/Not Given", "Matching"];
            case 'Listening':
                return ["Multiple Choice", "Fill in the Blanks", "Matching", "Labelling"];
            case 'Writing':
                return ["Task 1", "Task 2"];
            default:
                return [];
        }
    }

    return (
        <div className="border-t pt-4">
            <h3 className="text-lg font-medium">Upload for {examType}</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="question-type" className="block text-sm font-medium mb-1">Question Type</label>
                    <Select onValueChange={setQuestionType} value={questionType}>
                        <SelectTrigger id="question-type">
                            <SelectValue placeholder="Select Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {getQuestionTypes().map(type => (
                                <SelectItem key={type} value={type.toLowerCase().replace(/ /g, '-')}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {questionType && (
                     <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium mb-1">Upload CSV</label>
                        <div className="flex gap-2">
                            <Input id="file-upload" type="file" accept=".csv" />
                            <Button>Upload</Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <a href="#" className="underline">Download template for {questionType.replace(/-/g, ' ')}</a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
