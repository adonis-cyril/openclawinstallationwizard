'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface ExplainerBoxProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'info' | 'tip' | 'warning';
}

export default function ExplainerBox({
  title,
  children,
  defaultOpen = false,
  variant = 'info',
}: ExplainerBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const borderColor = {
    info: 'border-brand-accent/30',
    tip: 'border-brand-success/30',
    warning: 'border-brand-warning/30',
  }[variant];

  const iconColor = {
    info: 'text-brand-accent',
    tip: 'text-brand-success',
    warning: 'text-brand-warning',
  }[variant];

  return (
    <div className={`rounded-lg border ${borderColor} bg-brand-surface/50 overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors text-sm"
      >
        {isOpen ? (
          <ChevronDown className={`w-4 h-4 ${iconColor}`} />
        ) : (
          <ChevronRight className={`w-4 h-4 ${iconColor}`} />
        )}
        <Info className={`w-4 h-4 ${iconColor}`} />
        <span className="text-brand-text font-medium">{title}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 text-sm text-brand-muted leading-relaxed animate-slide-up">
          {children}
        </div>
      )}
    </div>
  );
}
