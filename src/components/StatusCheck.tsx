'use client';

import { Check, X, Loader2 } from 'lucide-react';

interface StatusCheckProps {
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail';
  detail?: string;
}

export default function StatusCheck({ label, status, detail }: StatusCheckProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        {status === 'pass' && <Check className="w-5 h-5 text-brand-success" />}
        {status === 'fail' && <X className="w-5 h-5 text-brand-error" />}
        {status === 'checking' && <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />}
        {status === 'pending' && <div className="w-3 h-3 rounded-full bg-brand-border" />}
      </span>

      <div className="flex-1 min-w-0">
        <span className={`text-sm ${status === 'fail' ? 'text-brand-error' : 'text-brand-text'}`}>
          {label}
        </span>
        {detail && (
          <span className="text-xs text-brand-muted ml-2">{detail}</span>
        )}
      </div>
    </div>
  );
}
