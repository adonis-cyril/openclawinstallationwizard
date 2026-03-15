'use client';

import { Check, X } from 'lucide-react';

interface StatusCheckProps {
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail';
  detail?: string;
}

const ROW_BG: Record<string, string> = {
  pass: 'bg-brand-success/[0.04]',
  fail: 'bg-brand-error/[0.04]',
};

export default function StatusCheck({ label, status, detail }: StatusCheckProps) {
  const rowBg = ROW_BG[status] || '';

  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors duration-300 ${rowBg}`}>
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {status === 'pass' && <Check className="w-4 h-4 text-brand-success" strokeWidth={2.5} />}
        {status === 'fail' && <X className="w-4 h-4 text-brand-error" strokeWidth={2.5} />}
        {status === 'checking' && (
          <span className="w-4 h-4 rounded-full border-2 border-brand-accent/30 border-t-brand-accent animate-spin" />
        )}
        {status === 'pending' && <span className="w-2 h-2 rounded-full bg-brand-border" />}
      </span>

      <div className="flex-1 min-w-0">
        <span className={`text-[13px] transition-colors duration-200 ${status === 'fail' ? 'text-brand-error' : 'text-brand-text'}`}>
          {label}
        </span>
        {detail && (
          <span className="text-[11px] text-brand-muted ml-2">{detail}</span>
        )}
      </div>
    </div>
  );
}
