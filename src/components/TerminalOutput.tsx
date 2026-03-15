'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { useWizardStore } from '@/lib/store';

interface TerminalOutputProps {
  title?: string;
  defaultOpen?: boolean;
}

export default function TerminalOutput({ title = 'Terminal Output', defaultOpen = false }: TerminalOutputProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { terminalOutput } = useWizardStore();

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput, isOpen]);

  if (terminalOutput.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-brand-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-brand-surface hover:bg-brand-surface/80 transition-colors text-sm text-brand-muted"
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Terminal className="w-4 h-4" />
        {title}
        <span className="ml-auto text-xs opacity-50">{terminalOutput.length} lines</span>
      </button>

      {isOpen && (
        <div className="bg-black/50 p-4 max-h-64 overflow-y-auto font-mono text-xs leading-relaxed">
          {terminalOutput.map((line, i) => (
            <div key={i} className="text-green-400/80 whitespace-pre-wrap break-all">
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
