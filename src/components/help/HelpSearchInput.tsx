'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui';

interface HelpSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function HelpSearchInput({ value, onChange }: HelpSearchInputProps) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search tasks, pages, workflows, or keywords"
      startAdornment={<Search className="h-4 w-4" />}
    />
  );
}
