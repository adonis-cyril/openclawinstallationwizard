'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Info, Lightbulb, AlertTriangle } from 'lucide-react';

interface ExplainerBoxProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'info' | 'tip' | 'warning';
}

const variantConfig = {
  info: {
    borderColor: 'border-l-brand-accent',
    iconColor: 'text-brand-accent',
    Icon: Info,
  },
  tip: {
    borderColor: 'border-l-brand-success',
    iconColor: 'text-brand-success',
    Icon: Lightbulb,
  },
  warning: {
    borderColor: 'border-l-brand-warning',
    iconColor: 'text-brand-warning',
    Icon: AlertTriangle,
  },
};

export default function ExplainerBox({
  title,
  children,
  defaultOpen = false,
  variant = 'info',
}: ExplainerBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = variantConfig[variant];
  const VariantIcon = config.Icon;

  return (
    <div className={`rounded-lg border border-brand-border border-l-2 ${config.borderColor} bg-brand-surface overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-brand-bg/50 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className={`w-3.5 h-3.5 ${config.iconColor}`} />
        ) : (
          <ChevronRight className={`w-3.5 h-3.5 ${config.iconColor}`} />
        )}
        <VariantIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        <span className="text-[13px] text-brand-text font-medium">{title}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-3.5 text-sm text-brand-muted leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
