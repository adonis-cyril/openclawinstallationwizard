'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { useWizardStore } from '@/lib/store';

interface TerminalOutputProps {
  title?: string;
  defaultOpen?: boolean;
}

// Strip ANSI escape sequences (colors, cursor movement, etc.)
function stripAnsi(text: string): string {
  return text.replace(/\x1B\[[0-9;]*[A-Za-z]|\x1B\][^\x07]*\x07/g, '');
}

export default function TerminalOutput({ title = 'Terminal Output', defaultOpen = false }: TerminalOutputProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { terminalOutput } = useWizardStore();

  const handleCopy = async () => {
    const markdown = '```\n' + stripAnsi(terminalOutput.join('')) + '\n```';
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput, isOpen]);

  if (terminalOutput.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-brand-border overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border-b border-brand-border">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-error/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-warning/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-success/40" />
          </div>

          <span className="text-[12px] text-brand-muted font-medium">
            {title}
          </span>

          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-brand-muted-light">
            {terminalOutput.length} lines
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        </button>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
          title="Copy output as markdown"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-brand-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-brand-dark p-4 max-h-64 overflow-y-auto font-mono text-[11px] leading-relaxed">
          {terminalOutput.map((line, i) => (
            <div key={i} className="text-amber-200/80 whitespace-pre-wrap break-all">
              {stripAnsi(line)}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
